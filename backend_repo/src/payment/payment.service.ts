import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notification/notification.service';
import { S3service } from 'src/user/s3.service';
import Stripe from 'stripe';
import * as randomstring from 'randomstring';
import { HelperService } from 'src/helper/helper.service';
const axios = require("axios");
import * as cron from 'node-cron';
import { Cron } from '@nestjs/schedule';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});

@Injectable()
export class PaymentService {

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly s3service: S3service,
    private readonly helperService: HelperService,
  ) { }

  /**
   *  PAYMOB
   */
  async getAllTransaction(req: any) {
    try {
      const userId = req?.user?.id;
      if (!userId) {
        return {
          status: false,
          message: 'User not authenticated',
        };
      }
  
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;
  
      const transactions = await prisma.transactionPaymob.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      });
  
      const totalCount = await prisma.transactionPaymob.count({
        where: {
          userId: userId,
        },
      });
  
      return {
        status: true,
        message: 'Fetched transactions successfully',
        data: transactions,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error in getAllTransaction',
        error: error.message
      };
    }
  }

  async getAuthToken(req: any) {
    try {

      const token = await this.helperService.getAuthToken();

      return {
        status: true,
        message: 'fetched auth token',
        data: token
      };

    } catch (error) {
      return {
        status: false,
        message: 'Error in getAuthToken',
        error: error.message
      };
    }
  }

  /**
   *  DIRECT, ADVANCE, DUE
   */
  async createIntention(payload: any, req: any) {
    try {

      const requiredFields = ['amount', 'billing_data', 'extras', 'special_reference'];
      // Validate top-level fields
      for (const field of requiredFields) {
        if (!payload[field]) {
          return {
            status: false,
            message: `Missing required field: ${field}`
          };
        }
      }

      const billingFields = [
        'apartment', 'first_name', 'last_name', 'street', 'building',
        'phone_number', 'city', 'country', 'email', 'floor', 'state'
      ];

      const extrasFields = ['orderId', 'paymentType'];

      // Validate billing_data fields
      for (const field of billingFields) {
        if (!payload.billing_data[field]) {
          return {
            status: false,
            message: `Missing required billing_data field: ${field}`
          };
        }
      }

      // Validate extras fields
      for (const field of extrasFields) {
        if (!payload.extras[field]) {
          return {
            status: false,
            message: `Missing required extras field: ${field}`
          };
        }
      }


      const PAYMOB_INTENTION_URL = 'https://oman.paymob.com/v1/intention/';
      const AUTH_TOKEN = process.env.PAYMOB_SECRET_KEY
      const {
        amount,
        currency,
        payment_methods,
        items,
        billing_data,
        extras,
        special_reference,
        notification_url,
        redirection_url
      } = payload;

      const response = await axios.post(
        PAYMOB_INTENTION_URL,
        {
          amount: amount,
          currency: "OMR",
          payment_methods: [parseInt(process.env.PAYMOB_INTEGRATION_ID)],
          items: items,
          billing_data: billing_data,
          extras: extras,
          special_reference: special_reference,
          notification_url: "https://devbackend.ultrasooq.com/payment/paymob-webhook",
          redirection_url: "https://dev.ultrasooq.com/checkout-complete",
          "force_save_card": true
        },
        {
          headers: {
            Authorization: `Token ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        status: true,
        message: 'Payment intention created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Paymob Intention Error:', error?.response?.data || error.message);
      return {
        status: false,
        message: 'Error in createIntention',
        error: error?.response?.data || error.message
      };
    }
  }

  async paymobWebhook(payload: any, req: any) {
    try {
      try {
        console.log("data from webhook: ", req.body);
      } catch (e) {
      }
      const data = req.body;
      if (data?.type === 'TRANSACTION') {
        const { success, id, amount_cents, order, payment_key_claims } = data.obj;
        const merchant_order_id = parseInt(order?.merchant_order_id);
        const orderId = parseInt(payment_key_claims?.extra.orderId);

        if (payment_key_claims && payment_key_claims.extra.paymentType === 'DIRECT') {
          console.log("payment_key_claims.extra.paymentType === 'DIRECT'");

          if (success && orderId) {
            console.log("success true");

            let transactionDetail = await prisma.transactionPaymob.updateMany({
              where: { orderId: orderId },
              data: {
                transactionStatus: 'SUCCESS',
                paymobTransactionId: String(id), // <-- convert to string,
                amountCents: data.obj.amount_cents || 0,
                success: success,
                paymobObject: req.body,
                merchantOrderId: merchant_order_id,
                paymobOrderId: order?.id,
              }
            });
            await prisma.order.update({
              where: { id: orderId },
              data: {
                orderStatus: 'PAID'
              }
            });
          } else {
            console.log("success false");
            let transactionDetail = await prisma.transactionPaymob.updateMany({
              where: { orderId: orderId },
              data: {
                transactionStatus: 'FAILED',
                paymobTransactionId: String(id), // <-- convert to string,
                amountCents: data?.obj?.amount_cents || 0,
                success: success,
                paymobObject: req.body,
                merchantOrderId: merchant_order_id,
                paymobOrderId: order?.id,
              }
            });
          }
        } else if (payment_key_claims && payment_key_claims.extra.paymentType === 'ADVANCE') {

          console.log("payment_key_claims.extra.paymentType === 'ADVANCE'");
          // let orderDetail = await prisma.order.findUnique({
          //   where: { id: merchant_order_id}
          // });
          // update transaction
          if (success && orderId) {
            console.log("success true");

            let transactionDetail = await prisma.transactionPaymob.updateMany({
              where: { orderId: orderId },
              data: {
                transactionStatus: 'SUCCESS',
                paymobTransactionId: String(id), // <-- convert to string,
                amountCents: data.obj.amount_cents || 0,
                success: success,
                paymobObject: req.body,
                merchantOrderId: merchant_order_id,
                paymobOrderId: order?.id,
              }
            });
          } else {
            console.log("success false");
            let transactionDetail = await prisma.transactionPaymob.updateMany({
              where: { orderId: orderId },
              data: {
                transactionStatus: 'FAILED',
                paymobTransactionId: String(id), // <-- convert to string,
                amountCents: data?.obj?.amount_cents || 0,
                success: success,
                paymobObject: req.body,
                merchantOrderId: merchant_order_id,
                paymobOrderId: order?.id,
              }
            });
          }

        } else if (payment_key_claims && payment_key_claims.extra.paymentType === 'DUE') {

          console.log("payment_key_claims.extra.paymentType === 'DUE'");

          let orderDetail = await prisma.order.findUnique({
            where: { id: orderId },
          });
          // create trasaction
          if (success && orderId) {
            let newTransaction = await prisma.transactionPaymob.create({
              data: {
                transactionStatus: 'SUCCESS',
                paymobTransactionId: String(id), // <-- convert to string,
                amountCents: data.obj.amount_cents || 0,
                success: success,
                paymobObject: req.body,
                merchantOrderId: merchant_order_id,
                paymobOrderId: order?.id,
                orderId: orderId,
                transactionType: 'DUE',
                userId: orderDetail.userId
              }
            });
            await prisma.order.update({
              where: { id: orderId },
              data: {
                dueAmount: 0,
                orderStatus: 'PAID'
              }
            });
          } else {
            let newTransaction = await prisma.transactionPaymob.create({
              data: {
                transactionStatus: 'FAILED',
                paymobTransactionId: String(id), // <-- convert to string,
                amountCents: data.obj.amount_cents || 0,
                success: success,
                paymobObject: req.body,
                merchantOrderId: merchant_order_id,
                paymobOrderId: order?.id,
                orderId: orderId,
                transactionType: 'DUE',
                userId: orderDetail.userId
              }
            })
          }

        }
      }

      return {
        success: true,
        message: "paymobWebhook successfully"
      };

    } catch (error) {
      console.error('Paymob Webhook Error::', error?.response?.data || error.message);
      return {
        status: false,
        message: 'Error in paymobWebhook',
        error: error?.response?.data || error.message
      };
    }
  }

  /**
   * PAYMENT WITH LINK
   */
  async createPaymentLink(payload: any, req: any) {
    try {
      const tokenResponse = await this.helperService.getAuthToken();
  
      // console.log("tokenResponse: ", tokenResponse);
      
      // if (!tokenResponse || !tokenResponse.token) {
      //   throw new Error("Paymob auth token not found");
      // }
  
      const authToken = tokenResponse;

      console.log("authToken: ", authToken);
      

      // return;
  
      // Step 2: Prepare JSON payload
      const {
        amountCents,
        referenceId,
        paymentMethods,
        email,
        fullName,
        description,
        redirectionUrl,
        isLive,
        phoneNumber, // optional
      } = payload;
  
      const jsonPayload = {
        amount_cents: amountCents,
        reference_id: referenceId,
        payment_methods: [parseInt(process.env.PAYMOB_INTEGRATION_ID)],
        email: email,
        is_live: isLive || false,
        full_name: fullName,
        description: description,
        notification_url: 'https://devbackend.ultrasooq.com/payment/paymob-webhook-createPaymentLink', // webhook
        redirection_url: redirectionUrl || 'https://dev.ultrasooq.com/checkout-complete', // redirect
        // phone_number: phoneNumber, // optional
      };
  
      // Step 3: Make request to Paymob
      const response = await axios.post(
        "https://oman.paymob.com/api/ecommerce/payment-links",
        jsonPayload,
        {
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      return {
        success: true,
        message: "Payment link created successfully",
        data: response.data,
      };
  
    } catch (error: any) {
      console.error("Error creating payment link:", error?.response?.data || error.message);
      return {
        success: false,
        message: "Failed to create payment link",
        error: error?.response?.data || error.message,
      };
    }
  }

  async paymobwebhookForCreatePaymentLink(payload: any, req: any) {
    try {
      console.log("req.body:", req.body);
  
      const data = req.body;
      let orderId: number | null = null;
  
      // Step 1: Extract orderId from description if event is TRANSACTION
      if (data?.type === 'TRANSACTION') {
        const items = data?.order?.items;
        const description = items?.[0]?.description;
  
        if (description) {
          const match = description.match(/orderId=(\d+)/);
          if (match) {
            orderId = parseInt(match[1], 10);
          }
        }
  
        console.log('Extracted orderId:', orderId);
      }
  
      // Step 2: Safety check
      if (!orderId) {
        throw new Error('Order ID not found in webhook payload');
      }
  
      // Step 3: Extract other fields from webhook object
      const obj = data?.obj || {};
      const success = obj.success;
      const id = obj.id;
      const amount_cents = obj.amount_cents || 0;
      const merchant_order_id = parseInt(obj.order?.merchant_order_id);
      const paymobOrderId = data?.order?.id;
  
      // Step 4: Update transactionPaymob
      const transactionDetail = await prisma.transactionPaymob.updateMany({
        where: { orderId },
        data: {
          transactionStatus: 'SUCCESS',
          paymobTransactionId: String(id),
          amountCents: amount_cents,
          success: success,
          paymobObject: req.body,
          merchantOrderId: merchant_order_id,
          paymobOrderId: paymobOrderId,
          transactionType: 'PAYMENTLINK'
        },
      });
  
      // Step 5: Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: 'PAID' },
      });
  
      // Step 6: Respond
      return {
        success: true,
        message: 'paymobWebhookForCreatePaymentLink successfully',
        orderId,
        transactionDetail,
      };
  
    } catch (error: any) {
      console.error('Paymob Webhook Error ::', error?.response?.data || error.message);
      return {
        status: false,
        message: 'Error in paymobwebhookForCreatePaymentLink',
        error: error?.response?.data || error.message,
      };
    }
  }

  /**
   *   EMI PAYMENT
   */
  // Storing card token
  async createSaveCardToken (req: any) {
    try {
      console.log("req.body:", req.body);
      const { obj, type } = req.body;

      const newSaveCardToken = await prisma.orderSaveCardToken.create({
        data: {
          paymobOrderId: parseInt(obj?.order_id) || null,
          token: obj?.token || null,
          saveCardObject: req.body,
        },
      });

      return {
        success: true,
        message: 'newSaveCardToken created successfully',
        data: newSaveCardToken,
      };
      
    } catch (error) {
      console.error('createSaveCardToken Error ::', error?.response?.data || error.message);
      return {
        status: false,
        message: 'Error in createSaveCardToken',
        error: error?.response?.data || error.message,
      };
    }
  }

  // test with saved card token
  async createPaymentUsingSaveCardToken(req: any) {
    try {

      const response = await axios.post(
        'https://oman.paymob.com/api/acceptance/payments/pay',
        {
          source: {
            identifier: req.body.identifier, // e.g., token
            subtype: 'TOKEN'
          },
          payment_token: req.body.payment_token
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        status: true,
        message: 'Payment created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.log("error: ", error);

      return {
        status: false,
        message: 'Error in createPaymentPaymob',
        error: error?.response?.data || error.message
      };
    }
  }

  // First Payment for EMI
  async createPaymentForEMI (payload: any, req: any) {
    try {
      const requiredFields = ['amount', 'billing_data', 'extras', 'special_reference'];
      // Validate top-level fields
      for (const field of requiredFields) {
        if (!payload[field]) {
          return {
            status: false,
            message: `Missing required field: ${field}`
          };
        }
      }

      const billingFields = [
        'apartment', 'first_name', 'last_name', 'street', 'building',
        'phone_number', 'city', 'country', 'email', 'floor', 'state'
      ];

      const extrasFields = ['orderId', 'paymentType'];

      // Validate billing_data fields
      for (const field of billingFields) {
        if (!payload.billing_data[field]) {
          return {
            status: false,
            message: `Missing required billing_data field: ${field}`
          };
        }
      }

      // Validate extras fields
      for (const field of extrasFields) {
        if (!payload.extras[field]) {
          return {
            status: false,
            message: `Missing required extras field: ${field}`
          };
        }
      }

      const PAYMOB_INTENTION_URL = 'https://oman.paymob.com/v1/intention/';
      const AUTH_TOKEN = process.env.PAYMOB_SECRET_KEY
      const {
        amount,
        currency,
        payment_methods,
        items,
        billing_data,
        extras,
        special_reference,
        notification_url,
        redirection_url
      } = payload;

      const response = await axios.post(
        PAYMOB_INTENTION_URL,
        {
          amount: amount,
          currency: "OMR",
          payment_methods: [parseInt(process.env.PAYMOB_INTEGRATION_ID)],
          items: items,
          billing_data: billing_data,
          extras: extras,
          special_reference: special_reference,
          notification_url: "https://devbackend.ultrasooq.com/payment/webhook-PaymentForEMI",
          redirection_url: "https://dev.ultrasooq.com/checkout-complete",
        },
        {
          headers: {
            Authorization: `Token ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        status: true,
        message: 'createPaymentForEMI created successfully',
        data: response.data
      };

    } catch (error) {
      console.log("error createPaymentForEMI:: ", error);
      return {
        status: false,
        message: 'Error in createPaymentForEMI',
        error: error?.response?.data || error.message
      };
    }
  }

  async webhookForFirstEMI (req: any) {
    try {
      const data = req.body;
      if (data?.type === 'TRANSACTION') {
        const { success, id, amount_cents, order, payment_key_claims } = data.obj;
        const merchant_order_id = parseInt(order?.merchant_order_id);
        const orderId = parseInt(payment_key_claims?.extra.orderId);

        if (payment_key_claims && payment_key_claims.extra.paymentType === 'EMI') {
          console.log("payment_key_claims.extra.paymentType === 'EMI'");

          if (success && orderId) {
            console.log("success true");

            let transactionDetail = await prisma.transactionPaymob.updateMany({
              where: { orderId: orderId },
              data: {
                transactionStatus: 'SUCCESS',
                paymobTransactionId: String(id), // <-- convert to string,
                amountCents: data.obj.amount_cents || 0,
                success: success,
                paymobObject: req.body,
                merchantOrderId: merchant_order_id,
                paymobOrderId: order?.id,
              }
            });
            await prisma.order.update({
              where: { id: orderId },
              data: {
                orderStatus: 'PENDING',
                paymobOrderId: String(order?.id),
              }
            });
          } else {
            console.log("success false");
            let transactionDetail = await prisma.transactionPaymob.updateMany({
              where: { orderId: orderId },
              data: {
                transactionStatus: 'FAILED',
                paymobTransactionId: String(id), // <-- convert to string,
                amountCents: data?.obj?.amount_cents || 0,
                success: success,
                paymobObject: req.body,
                merchantOrderId: merchant_order_id,
                paymobOrderId: order?.id,
              }
            });
          }
        } 
      }
    } catch (error) {
      console.log("error createPaymentForEMI:: ", error);
      return {
        status: false,
        message: 'Error in createPaymentForEMI',
        error: error?.response?.data || error.message
      };
    }
  }

  // @Cron('*/5 * * * * *')
  @Cron('0 0 * * * *')
  async cronJobRunEveryHour() {
    try{
      console.log("CRON JOB RUNNING............................");
    } catch (error) {
      console.log("error: ", error);
    }
  }

  // @Cron('*/2 * * * *') // Every 2 minutes
  async cronJobCheckEMIPayments() {
    try {
      console.log("🔁 CRON JOB RUNNING: Checking EMI status...");
  
      const ongoingEMIs = await prisma.orderEMI.findMany({
        where: {
          emiStatus: 'ONGOING',
          deletedAt: null,
          emiInstallmentCount: {
            gt: 0
          },
        },
      });
  
      for (const emi of ongoingEMIs) {
        const {
          orderId,
          emiInstallmentCount,
          emiInstallmentsPaid,
          nextEmiDueDate,
          emiInstallmentAmountCents
        } = emi;
  
        // Check if installments are still pending and due date is today or earlier
        if ( orderId && emiInstallmentCount > (emiInstallmentsPaid || 0) && nextEmiDueDate && new Date(nextEmiDueDate) <= new Date()) {
          console.log(`Running payInstallment for orderId: ${orderId} & amountCents: ${emiInstallmentAmountCents}`);
          await this.payInstallment(orderId );
          // await this.payInstallment(orderId, emiInstallmentAmountCents);
        }
      }
  
    } catch (error) {
      console.log("Error in cronJobCheckEMIPayments: ", error);
    }
  }

  // async payInstallment(req: any, emiInstallmentAmountCents: any) {
  async payInstallment(req: any) {
    try {
      const PAYMOB_INTENTION_URL = 'https://oman.paymob.com/v1/intention/';
      const AUTH_TOKEN = process.env.PAYMOB_SECRET_KEY;
      const INTEGRATION_ID = parseInt(process.env.PAYMOB_INTEGRATION_ID);
  
      const orderId = req.body.orderId;

      // Fetch the order details
      const orderDetail = await prisma.order.findUnique({
        where: { id: orderId }
      });
      if (!orderDetail || !orderDetail.paymobOrderId) {
        throw new Error('Order or paymobOrderId not found');
      }
  
      const paymobOrderId = parseInt(orderDetail.paymobOrderId);
  
      // Get the saved card token
      const saveCardTakenDetail = await prisma.orderSaveCardToken.findFirst({
        where: { paymobOrderId }
      });
      if (!saveCardTakenDetail || !saveCardTakenDetail.token) {
        throw new Error('Saved card token not found');
      }
  
      const identifier = saveCardTakenDetail.token;
      const amount = 1000; // You might want to dynamically fetch this later
  
      const billing_data = {
        apartment: "dumy",
        first_name: "dumy",
        last_name: "dumy",
        street: "dumy",
        building: "dumy",
        phone_number: "dumy",
        city: "dumy",
        country: "dumy",
        email: "dumy",
        floor: "dumy",
        state: "dumy"
      };
  
      const extras = {
        orderId: orderId,
        paymentType: "EMI"
      };
  
      const special_reference = new Date();
  
      const responseIntention = await axios.post(
        PAYMOB_INTENTION_URL,
        {
          amount,
          currency: "OMR",
          payment_methods: [25198], //[INTEGRATION_ID], // Use this 25198 Intention Moto Id to create Intention for EMI Payment
          billing_data,
          extras,
          special_reference,
          notification_url: "https://devbackend.ultrasooq.com/payment/webhookForEMI",
          redirection_url: "https://dev.ultrasooq.com/checkout-complete"
        },
        {
          headers: {
            Authorization: `Token ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      const paymentToken = responseIntention.data?.payment_keys?.[0]?.key;
      if (!paymentToken) {
        throw new Error('Payment token not received from Paymob');
      }
  
      const paymentResponse = await axios.post(
        'https://oman.paymob.com/api/acceptance/payments/pay',
        {
          source: {
            identifier,
            subtype: 'TOKEN'
          },
          payment_token: paymentToken
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
  
      return {
        status: true,
        message: 'Payment created successfully',
        data: paymentResponse.data
      };
  
    } catch (error) {
      console.error("error payInstallment::", error);
      return {
        status: false,
        message: 'Error in payInstallment',
        error: error?.response?.data || error.message
      };
    }
  }
  
  async webhookForEMI (req: any) {
    try {
      const data = req.body;
      if (data?.type === 'TRANSACTION') {
        const { success, id, amount_cents, order, payment_key_claims } = data.obj;
        const merchant_order_id = parseInt(order?.merchant_order_id);
        const orderId = parseInt(payment_key_claims?.extra.orderId);

        if (payment_key_claims && payment_key_claims.extra.paymentType === 'EMI') {
          console.log("payment_key_claims.extra.paymentType === 'EMI'");

          let orderDetail = await prisma.order.findUnique({
            where: { id: orderId },
          });

          if (success && orderId) {
            console.log("success true");

            let newTransaction = await prisma.transactionPaymob.create({
              data: {
                transactionStatus: 'SUCCESS',
                paymobTransactionId: String(id), // <-- convert to string,
                amountCents: data.obj.amount_cents || 0,
                success: success,
                paymobObject: req.body,
                merchantOrderId: merchant_order_id,
                paymobOrderId: order?.id,
                orderId: orderId,
                transactionType: 'EMI',
                userId: orderDetail.userId
              }
            });

            // Fetch existing EMI data
            const orderEMI = await prisma.orderEMI.findFirst({
              where: { orderId }
            });

            if (orderEMI) {
              const updatedInstallmentsPaid = (orderEMI.emiInstallmentsPaid || 0) + 1;
              const isCompleted = updatedInstallmentsPaid >= (orderEMI.emiInstallmentCount || 0);

              await prisma.orderEMI.updateMany({
                where: { orderId },
                data: {
                  emiInstallmentsPaid: updatedInstallmentsPaid,
                  emiStatus: isCompleted ? 'COMPLETED' : 'ONGOING',
                  nextEmiDueDate: isCompleted ? null : (() => {
                    const nextDue = new Date();
                    nextDue.setDate(nextDue.getDate() + 30);
                    return nextDue;
                  })()
                }
              });
            }

          } else {
            console.log("success false");

            let newTransaction = await prisma.transactionPaymob.create({
              data: {
                transactionStatus: 'FAILED',
                paymobTransactionId: String(id), // <-- convert to string,
                amountCents: data.obj.amount_cents || 0,
                success: success,
                paymobObject: req.body,
                merchantOrderId: merchant_order_id,
                paymobOrderId: order?.id,
                orderId: orderId,
                transactionType: 'EMI',
                userId: orderDetail.userId
              }
            });

            // Update nextEmiDueDate to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            await prisma.orderEMI.updateMany({
              where: { orderId },
              data: {
                nextEmiDueDate: tomorrow
              }
            });

          }
        } 
      }
    } catch (error) {
      console.log("error webhookForEMI:: ", error);
      return {
        status: false,
        message: 'Error in webhookForEMI',
        error: error?.response?.data || error.message
      };
    }
  }

}


