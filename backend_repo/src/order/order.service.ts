import { Injectable } from '@nestjs/common';
import * as randomstring from 'randomstring';
import { compare, hash, genSalt } from 'bcrypt';
import { Prisma, PrismaClient } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';
import { Decimal } from '@prisma/client/runtime/library';
const prisma = new PrismaClient();

@Injectable()
export class OrderService {

  constructor(
    private readonly notificationService: NotificationService
  ) { }

  // in use
  async createOrder2(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      const userAddressId = payload?.userAddressId

      let totalCartIds = [
        ...(payload.cartIds || []),
        ...(payload.serviceCartIds || [])
      ];

      let cartProductServiceRelation = await prisma.cartProductService.findMany({
        where: {
          OR: [
            { cartId: { in: totalCartIds } },
            { relatedCartId: { in: totalCartIds } }
          ]
        }
      });

      // return {
      //   status: true,
      //   message: 'Created Successfully',
      //   data: cartProductServiceRelation
      // };

      let userDetail = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          customerId: true,
          userType: true,
          tradeRole: true
        }
      });
      let userTradeRole = userDetail.tradeRole;
      console.log("buyerTradeRole: ", userTradeRole);
      
      const buyerType = ['COMPANY', 'FREELANCER'].includes(userTradeRole) ? 'VENDOR' : 'CONSUMER';

      let productList = [];
      let deliveryCharge = 0;
      let totalPrice = 0;
      let totalPurchasedPrice = 0;
      let discount = 0;
      let invalidProducts = [];
      let productCannotBuy = []
      let totalCustomerPay = 0;
      let totalPlatformFee = 0
      let totalCashbackToCustomer = 0;

      for (let i = 0; i < payload.cartIds.length; i++) {
        let cartDetails = await prisma.cart.findUnique({
          where: { id: payload.cartIds[i] },
          select: { id: true, productId: true, quantity: true, productPriceId: true, sharedLinkId: true, object: true }
        });
        // console.log("cartDetails: ", cartDetails);
        
        let productPriceDetails = await prisma.productPrice.findUnique({
          where: { id: cartDetails.productPriceId },
        });
        let menuId = productPriceDetails.menuId;
        // console.log("productPriceDetails: ", productPriceDetails);
        
        // ----------- Restriction: VENDORS cannot buy CONSUMER-only products
        if (['COMPANY', 'FREELANCER'].includes(userTradeRole) && productPriceDetails.consumerType === 'CONSUMER') {
          invalidProducts.push(cartDetails.productId);
          continue;
        }

        // ----------- Restriction: CONSUMERS cannot buy VENDORS-only products
        if (userTradeRole === 'BUYER' && productPriceDetails.consumerType === 'VENDORS' ) {
          invalidProducts.push(cartDetails.productId);
          continue;
        }

        let offerPrice = parseFloat(productPriceDetails.offerPrice.toString());
        let purchasedPrice = offerPrice;
        let discountAmount = 0;
        let discountApplied = false

        //  Apply Discounts
        if (productPriceDetails.consumerType === 'VENDORS' && ['COMPANY', 'FREELANCER'].includes(userTradeRole)) {

          if (productPriceDetails?.vendorDiscountType === 'FLAT') {
            discountAmount = parseFloat(productPriceDetails.vendorDiscount?.toString() || "0");
            purchasedPrice -= discountAmount;
            discountApplied = true;

          } else if (productPriceDetails?.vendorDiscountType === 'PERCENTAGE') {
            discountAmount = (offerPrice * parseFloat(productPriceDetails.vendorDiscount?.toString() || "0")) / 100;
            purchasedPrice -= discountAmount;
            discountApplied = true;
          }

        } else if (productPriceDetails.consumerType === 'CONSUMER' && userTradeRole === 'BUYER') {

          if (productPriceDetails?.consumerDiscountType === 'FLAT') {
            discountAmount = parseFloat(productPriceDetails.consumerDiscount?.toString() || "0");
            purchasedPrice -= discountAmount;
            discountApplied = true;

          } else if (productPriceDetails?.consumerDiscountType === 'PERCENTAGE') {
            discountAmount = (offerPrice * parseFloat(productPriceDetails.consumerDiscount?.toString() || "0")) / 100;
            purchasedPrice -= discountAmount;
            discountApplied = true;
          }

        } else if (productPriceDetails.consumerType === 'EVERYONE') {
          console.log("EVERYONE");
          
          if (['COMPANY', 'FREELANCER'].includes(userTradeRole)) {
            if (productPriceDetails?.vendorDiscountType === 'FLAT') {
              discountAmount = parseFloat(productPriceDetails.vendorDiscount?.toString() || "0");
              purchasedPrice -= discountAmount;
              discountApplied = true;

            } else if (productPriceDetails?.vendorDiscountType === 'PERCENTAGE') {
              discountAmount = (offerPrice * parseFloat(productPriceDetails.vendorDiscount?.toString() || "0")) / 100;
              purchasedPrice -= discountAmount;
              discountApplied = true;

            }
          } else if (userTradeRole === 'BUYER') {

            if (productPriceDetails?.consumerDiscountType === 'FLAT') {
              discountAmount = parseFloat(productPriceDetails.consumerDiscount?.toString() || "0");
              purchasedPrice -= discountAmount;
              discountApplied = true;
  
            } else if (productPriceDetails?.consumerDiscountType === 'PERCENTAGE') {
              discountAmount = (offerPrice * parseFloat(productPriceDetails.consumerDiscount?.toString() || "0")) / 100;
              purchasedPrice -= discountAmount;
              discountApplied = true;
  
            }
          }
        }

        let quantity = cartDetails.quantity;
        let totalProductDiscount = discountAmount * quantity;

        // -------------------------------------------------------------- Updating Stock
        if (productPriceDetails.productId && productPriceDetails.id && quantity) {
          const productPriceDetail = await prisma.productPrice.findUnique({
            where: { id: productPriceDetails.id },
          });

          if (productPriceDetail) {
            if (productPriceDetail.stock >= quantity) {
              let updatedStock = productPriceDetail.stock - quantity;

              // Ensure stock doesn't go negative
              if (updatedStock < 0) {
                updatedStock = 0;
              }

              await prisma.productPrice.update({
                where: { id: productPriceDetails.id },
                data: {
                  stock: updatedStock,
                },
              });

              // console.log(`Stock updated. Remaining stock: ${updatedStock}`);
            } else {
              productCannotBuy.push({
                productId: productPriceDetails.productId,
                productReasonMessage: "Out Of Stock"
              });
              continue;
            }
          } else {
            productCannotBuy.push({
              productId: productPriceDetails.productId,
              productReasonMessage: "Product Not Found"
            });
            continue;
          }
        }

        // fee calculation function (define separately)
        const feeResult = await this.calculateFees({
          userAddressId: userAddressId,
          menuId: menuId,
          buyerId: userId,
          buyerType: buyerType,
          productId: productPriceDetails.productId,
          productPriceId: productPriceDetails.id,
          quantity: quantity,
          purchasedPrice: purchasedPrice * quantity
        });

        const breakdown = feeResult.breakdown;
        const customerPay = Number(feeResult.customerPay);
        const cashbackToCustomer = feeResult.cashbackToCustomer;
        const sellerReceives = feeResult.sellerReceives;
        const platformProfit = feeResult.platformProfit;
        const productReasonMessage = feeResult.message;

        if (!feeResult || !feeResult.isValid) {
          productCannotBuy.push({
            productId: cartDetails.productId,
            productReasonMessage: productReasonMessage
          });
          continue;
        }

        productList.push({
          productPriceId: productPriceDetails.id,
          productId: productPriceDetails.productId,
          offerPrice: offerPrice, // actual price per
          purchasedPrice: purchasedPrice, // actual price after discount
          quantity: quantity,
          sellerId: productPriceDetails.adminId,
          discountApplied,
          discountAmount: discountAmount, // discount per quantity
          totalProductDiscount, // total discount on per product
          menuId: menuId,
          breakdown: breakdown,
          customerPay: customerPay,
          cashbackToCustomer: cashbackToCustomer,
          sellerReceives: sellerReceives,
          platformProfit: platformProfit,
          object: cartDetails.object,
          cartId: cartDetails.id,
          orderProductType: 'PRODUCT'
        });

        totalPrice += offerPrice * quantity;
        totalPurchasedPrice += purchasedPrice * quantity;
        discount += totalProductDiscount;

        totalCustomerPay += customerPay;
        totalPlatformFee += platformProfit;
        totalCashbackToCustomer += cashbackToCustomer;
      }

      for (let j = 0; j < payload.serviceCartIds.length; j++) {
        const cartDetails = await prisma.cart.findUnique({
          where: { id: payload.serviceCartIds[j] },
          include: {
            service: {
              include: {
                serviceFeatures: true
              }
            },
            cartServiceFeatures: {
              include: {
                serviceFeature: true
              }
            }
          }
        });
      
        let totalPrice = 0;
        let quantity = 0;
        const breakdownList = [];
      
        for (let k = 0; k < cartDetails.cartServiceFeatures.length; k++) {

          const feature = cartDetails.cartServiceFeatures[k].serviceFeature;
          const cost = parseFloat(feature.serviceCost.toString());
          const serviceFeatureQuantity = cartDetails.cartServiceFeatures[k].quantity

          if (feature.serviceCostType === 'FLAT') {
            totalPrice += cost;
            quantity += serviceFeatureQuantity

            breakdownList.push({
              id: feature.id,
              name: feature.name,
              cost: cost,
              costType: feature.serviceCostType,
              quantity: serviceFeatureQuantity
            });

          } else if (feature.serviceCostType === 'HOURLY') {
            const hours = cartDetails.service.eachCustomerTime || 1;
            totalPrice += (cost * hours) * serviceFeatureQuantity;
            quantity = serviceFeatureQuantity;

            breakdownList.push({
              id: feature.id,
              name: feature.name,
              cost: cost * hours,
              costType: feature.serviceCostType,
              hours: hours,
              quantity: serviceFeatureQuantity
            });
          }
        }
      
        productList.push({
          orderProductType: 'SERVICE',
          serviceId: cartDetails.serviceId,
          productPriceId: null,
          productId: null,
          offerPrice: totalPrice / quantity,
          purchasedPrice: totalPrice / quantity,
          quantity: quantity,
          sellerId: cartDetails.service.sellerId,
          discountApplied: false,
          discountAmount: 0,
          totalProductDiscount: 0,
          menuId: null,
          breakdown: { serviceFeatures: breakdownList },
          customerPay: totalPrice,
          cashbackToCustomer: 0,
          sellerReceives: totalPrice,
          platformProfit: 0,
          object: cartDetails.object,
          cartId: cartDetails.id,
        });

        totalCustomerPay += totalPrice;
      }
      
      // return {
      //   status: true,
      //   message: 'Created Successfully',
      //   data: cartProductServiceRelation,
      //   productList: productList
      // };

      const uniqueSellerIds = [...new Set(productList.map(item => item.sellerId))];

      let isShipping = false;
      if (payload.shipping && payload.shipping.length > 0) {
        // Step 1: Extract sellerIds from shipping
        const shippingSellerIds = payload.shipping.map(item => item.sellerId);

        // Step 2: Find sellerIds which do not exist in uniqueSellerIds
        const mismatchedSellers = shippingSellerIds
          .filter(sellerId => !uniqueSellerIds.includes(sellerId))
          .map(sellerId => ({
            sellerId,
            message: "This sellerId does not match with product sellerId"
          }));

        isShipping = true;

        // Step 3: If any mismatch found, return warning
        if (mismatchedSellers.length > 0) {
          return {
            status: false,
            mismatchedSellers,
          }
        }
      }
      
      // order create
      let orderDetails = await prisma.order.create({
        data: {
          userId: userId,
          totalPrice: totalPrice,
          actualPrice: totalPurchasedPrice,
          totalDiscount: discount,
          totalCustomerPay: totalCustomerPay,
          totalPlatformFee: totalPlatformFee,
          totalCashbackToCustomer: totalCashbackToCustomer,
          paymentMethod: payload?.paymentMethod,
          deliveryCharge: payload?.deliveryCharge || null,
          orderDate: new Date(),
          orderNo: "Ord_" + randomstring.generate({length: 12, charset: "alphanumeric",}),

          paymentType: payload?.paymentType || 'DIRECT',
          advanceAmount: payload?.advanceAmount,
          dueAmount: payload?.dueAmount
        }
      });

      let newOrderEMI;
      if (payload?.paymentType === 'EMI') {
        const nextEmiDueDate = new Date();
        nextEmiDueDate.setDate(nextEmiDueDate.getDate() + 30); // Adds 30 days to today

        newOrderEMI = await prisma.orderEMI.create({
          data: {
            orderId: orderDetails.id,
            emiInstallmentCount: payload?.emiInstallmentCount,
            emiInstallmentAmount: payload?.emiInstallmentAmount,
            emiInstallmentAmountCents: payload?.emiInstallmentAmountCents,
            emiStartDate: new Date(),
            emiInstallmentsPaid: 1,
            emiStatus: 'ONGOING',
            nextEmiDueDate: nextEmiDueDate,
          }
        });
      }

      // const uniqueSellerIds = [...new Set(productList.map(item => item.sellerId))];

      for (let sellerId of uniqueSellerIds) {
        const sellerOrderNo = `Ords_${randomstring.generate({ length: 12, charset: 'alphanumeric' })}`;

        // order seller
        let addOrderSeller = await prisma.orderSeller.create({
          data: {
            orderId: orderDetails.id,
            orderNo: orderDetails.orderNo,
            sellerOrderNo: sellerOrderNo,
            amount: productList.filter(item => item.sellerId === sellerId).reduce((acc, item) => acc + (parseFloat(item.offerPrice) * item.quantity), 0),
            purchasedAmount: productList.filter(item => item.sellerId === sellerId).reduce((acc, item) => acc + (parseFloat(item.purchasedPrice) * item.quantity), 0),
            sellerId: sellerId,
          }
        });

        // check and create shipping
        let newOrderShipping;
        if (isShipping === true) {
          const shippingData = payload.shipping.find(ship => ship.sellerId === sellerId);

          if (shippingData) {
            newOrderShipping = await prisma.orderShipping.create({
              data: {
                orderId: orderDetails.id,
                sellerId: sellerId,
                orderShippingType: shippingData.orderShippingType,
                serviceId: shippingData.serviceId || null,
                shippingDate: new Date(shippingData.shippingDate),
                shippingCharge: shippingData.shippingCharge || 0,
                status: "PENDING",
                fromTime: new Date(shippingData?.fromTime) || null,
                toTime: new Date(shippingData?.toTime) || null,
              }
            });
          }
        }

        //order products
        const productListForSeller = productList.filter(item => item.sellerId === sellerId);
        let cartOrder: any = {};
        for (let product of productListForSeller) {
          let orderProduct = await prisma.orderProducts.create({
            data: {
              userId: userId,
              orderNo: orderDetails.orderNo,
              sellerOrderNo: sellerOrderNo, // Use the generated sellerOrderNo
              orderId: orderDetails.id,
              orderSellerId: addOrderSeller.id,
              productPriceId: product.productPriceId,
              productId: product.productId,

              serviceId: product.serviceId,
              serviceFeatures: product.breakdown,

              purchasePrice: product.purchasedPrice,
              salePrice: product.offerPrice,

              sellerId: product.sellerId,
              orderQuantity: product.quantity,
              orderProductDate: new Date(),

              breakdown: product.breakdown,
              customerPay: product.customerPay,
              cashbackToCustomer: product.cashbackToCustomer,
              sellerReceives: product.sellerReceives,
              platformFee: product.platformProfit,

              object: product.object,
              orderShippingId: newOrderShipping?.id || undefined,
              orderProductType: product.orderProductType
            }
          });

          cartOrder[product.cartId] = orderProduct.id // map cartId to orderId
        }
        console.log("cartOrder: ", cartOrder);
        

        if (cartProductServiceRelation.length > 0) {
          for (let relation of cartProductServiceRelation) {
            const orderProductId = cartOrder[relation.cartId];
            const relatedOrderProductId = relation.relatedCartId ? cartOrder[relation.relatedCartId] : null;
          
            if (orderProductId) {
              await prisma.orderProductService.create({
                data: {
                  productId: relation.productId,
                  serviceId: relation.serviceId,
                  orderProductId: orderProductId,
                  relatedOrderProductId: relatedOrderProductId,
                  orderProductType: relation.cartType // "product" or "service"
                }
              });
            }
          }
        }
      }

      // order Billing address
      await prisma.orderAddress.create({
        data: {
          orderId: orderDetails.id,
          firstName: payload?.firstName,
          lastName: payload?.lastName,
          email: payload?.email,
          cc: payload?.cc,
          phone: payload?.phone,
          address: payload?.billingAddress,
          city: payload?.billingCity,
          province: payload?.billingProvince,
          country: payload?.billingCountry,
          postCode: payload?.billingPostCode,
          addressType: 'BILLING',
          countryId: payload?.countryId,
          stateId: payload?.stateId,
          cityId: payload?.cityId,
          town: payload?.town,
        }
      });

      // order shipping address
      await prisma.orderAddress.create({
        data: {
          orderId: orderDetails.id,
          firstName: payload?.firstName,
          lastName: payload?.lastName,
          email: payload?.email,
          cc: payload?.cc,
          phone: payload?.phone,
          address: payload?.shippingAddress,
          city: payload?.shippingCity,
          province: payload?.shippingProvince,
          country: payload?.shippingCountry,
          postCode: payload?.shippingPostCode,
          addressType: 'SHIPPING',
          countryId: payload?.countryId,
          stateId: payload?.stateId,
          cityId: payload?.cityId,
          town: payload?.town,
        }
      });

      // Create Transaction 
      let newTransaction = await prisma.transactionPaymob.create({
        data: {
          userId: userId,
          orderId: orderDetails.id,
          transactionStatus: 'PENDING',
          success: false,
          transactionType: payload?.paymentType || 'DIRECT',
          amount: payload?.paymentType === 'ADVANCE' ? payload?.amount : totalCustomerPay
        }
      });

      let updateOrderDetail = await prisma.order.update({
        where: { id: orderDetails.id },
        data: {
          transactionId: newTransaction.id
        }
      })

      // cart delete (clearing after order)
      // for (let i = 0; i < productList.length; i++) {
      //   await prisma.cart.delete({
      //     where: { id: payload.cartIds[i] },
      //   });
      // }
      // Step 1: Find all cart IDs for the user
      const cartIds = await prisma.cart.findMany({
        where: { userId },
        select: { id: true },
      });
      const cartIdList = cartIds.map(c => c.id);

      // Step 2: Delete from CartServiceFeature (child)
      await prisma.cartServiceFeature.deleteMany({
        where: {
          cartId: { in: cartIdList },
        },
      });

      // Step 3: Delete from CartProductService (child)
      await prisma.cartProductService.deleteMany({
        where: {
          cartId: { in: cartIdList },
        },
      });

      // Step 4: Delete from Cart (parent)
      await prisma.cart.deleteMany({
        where: {
          userId,
        },
      });

      return {
        status: true,
        message: 'Created Successfully',
        message1: invalidProducts.length > 0 ? "Some products are not available for your trade role" : "Fetch Successfully",
        data: orderDetails,
        data1: productList,
        totalPrice,
        totalPurchasedPrice,
        discount,
        invalidProducts,
        productCannotBuy: productCannotBuy,
        totalCustomerPay: totalCustomerPay,
        totalPlatformFee: totalPlatformFee,
        totalCashbackToCustomer: totalCashbackToCustomer,
        newTransaction: newTransaction
      };

    } catch (error) {
      console.log("error: ", error);
      return {
        status: false,
        message: 'error in createOrder2',
        error: error.message
      }
    }
  }
  
  async createOrderUnAuth(payload: any) {
    try {
      // guestUser Creation

      let guestUserId;
      let userId;
      if (payload?.guestUser) {
        if (payload?.guestUser?.email) {
          let re =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
          // console.log(re.test(String(createUserDto.email)));
          if (!re.test(String(payload.guestUser.email))) {
            return {
              status: 'false',
              message: 'enter a valid email',
              data: [],
            };
          }
          payload.guestUser.email = payload.guestUser.email.toLowerCase();
        }
  
        const userExist = await prisma.user.findUnique({
          where: { email: payload.guestUser.email }
        });
        if (userExist) {
          userId = userExist.id
        } else {

          let firstName = payload?.guestUser?.firstName;
          let lastName = payload?.guestUser?.lastName;
          let email = payload?.guestUser?.email;
          let cc = payload?.guestUser?.cc;
          let phoneNumber = payload?.guestUser?.phoneNumber;

          let rawPassword = randomstring.generate({ length: 8, charset: "alphanumeric" });
          console.log('rawPassword: ', rawPassword);
          
          const salt = await genSalt(10);
          const password = await hash(rawPassword, salt);

          guestUserId = await prisma.user.create({
            data: { 
              firstName, 
              lastName, 
              email,
              password,
              tradeRole: 'BUYER',
              cc,
              phoneNumber,
              status: 'ACTIVE',
              userType: 'USER'
            }
          });
          userId = guestUserId.id;
          let idString = guestUserId.id.toString();
          let requestId;
    
          if (idString.length >= 7) {
            requestId = idString;
          } else {
            requestId = "0".repeat(7 - idString.length) + idString;
          }
          let updatedUser = await prisma.user.update({
            where: { id: guestUserId.id },
            data: {
              uniqueId: requestId,
            }
          });

          let data = {
            email: email,
            name: firstName,
            rawPassword: rawPassword
          }
          this.notificationService.newUserCreatedOnCheckout(data);

        }
      }


      // const userId = guestUserId.id;
      // console.log("guestUserId.id: ", guestUserId.id);
      
      let productList = []
      let deliveryCharge = 0
      let totalPrice = 0;
      let discount = 0;
      for (let i=0; i<payload.cartIds.length; i++) {
        let cartDetails = await prisma.cart.findUnique({
          where: { id: payload.cartIds[i] },
          select: { productId: true, quantity: true, productPriceId: true }
        });

        // let productDetails = await prisma.product.findUnique({
        //   where: { id: cartDetails.productId },
        //   select: { id: true, offerPrice: true, adminId: true }
        // });

        let productPriceDetails = await prisma.productPrice.findUnique({
          where: { id: cartDetails.productPriceId },
          select: { id: true, offerPrice: true, adminId: true, productId: true }
        })

      let tempProductDetails = {
        productPriceId: productPriceDetails.id,
        productId: productPriceDetails.productId,
        offerPrice: productPriceDetails.offerPrice,
        quantity: cartDetails.quantity,
        sellerId: productPriceDetails.adminId
      } 
      productList.push(tempProductDetails);

      // calculate cart total
      const totalPriceForProduct = cartDetails.quantity * parseFloat(productPriceDetails.offerPrice.toString());
      totalPrice += totalPriceForProduct;
    }

      // order create
      let orderDetails = await prisma.order.create({
        data: {
          userId: userId,
          totalPrice: totalPrice,
          // discount: discount,
          actualPrice: totalPrice,
          paymentMethod: payload?.paymentMethod,
          deliveryCharge: payload?.deliveryCharge || null,
          orderDate: new Date(),
          orderNo: "Ord_" + randomstring.generate({length: 12, charset: "alphanumeric",}),
        }
      });

      const uniqueSellerIds = [...new Set(productList.map(item => item.sellerId))];

      // let productListFinal = [] // for testing
      for (let sellerId of uniqueSellerIds) {
        const sellerOrderNo = `Ords_${randomstring.generate({ length: 12, charset: 'alphanumeric' })}`;

        // order seller
        let addOrderSeller = await prisma.orderSeller.create({
          data: {
            orderId: orderDetails.id,
            orderNo: orderDetails.orderNo,
            sellerOrderNo: sellerOrderNo,
            amount: productList.filter(item => item.sellerId === sellerId).reduce((acc, item) => acc + (parseFloat(item.offerPrice) * item.quantity), 0),
            sellerId: sellerId
          }
        });

        //order products
        const productListForSeller = productList.filter(item => item.sellerId === sellerId);
        for (let product of productListForSeller) {
          await prisma.orderProducts.create({
            data: {
              userId: userId,
              orderNo: orderDetails.orderNo,
              sellerOrderNo: sellerOrderNo, // Use the generated sellerOrderNo
              orderId: orderDetails.id,
              orderSellerId: addOrderSeller.id,
              productPriceId: product.productPriceId,
              productId: product.productId,
              purchasePrice: product.offerPrice,
              salePrice: product.offerPrice,
              sellerId: product.sellerId,
              orderQuantity: product.quantity,
              orderProductDate: new Date()
            }
          });
        }

        // productListFinal.push(productListForSeller); // for testing
      }

      // let orderDetails = await prisma.order.create({
      //   data: {
      //     userId: userId,
      //     totalPrice: totalPrice,
      //     // discount: discount,
      //     actualPrice: totalPrice,
      //     paymentMethod: payload?.paymentMethod,
      //     deliveryCharge: payload?.deliveryCharge || null,
      //     // orderStatus: payload?.orderStatus,
      //     orderDate: new Date(),
      //     orderNo: "Ord_" + randomstring.generate({
      //       length: 12,
      //       charset: "alphanumeric",
      //     }),
      //   }
      // });

      // //order products
      // for (let i = 0; i < productList.length; i++) {
      //   await prisma.orderProducts.create({
      //     data: {
      //       userId: userId,
      //       orderId: orderDetails.id,
      //       productId: productList[i].productId,
      //       salePrice: productList[i].offerPrice,
      //       purchasePrice: productList[i].offerPrice,
      //       orderQuantity: productList[i].quantity,
      //       sellerId: productList[i].sellerId,
      //       orderProductDate: new Date()
      //     }
      //   });
      // }

      // cart delete
      for (let i = 0; i < productList.length; i++) {
        await prisma.cart.delete({
          where: { id: payload.cartIds[i] },
        });
      }

      // order Billing address
      await prisma.orderAddress.create({
        data: {
          orderId: orderDetails.id,
          firstName: payload?.firstName,
          lastName: payload?.lastName,
          email: payload?.email,
          cc: payload?.cc,
          phone: payload?.phone,
          address: payload?.billingAddress,
          city: payload?.billingCity,
          province: payload?.billingProvince,
          country: payload?.billingCountry,
          postCode: payload?.billingPostCode,
          addressType: 'BILLING'
        }
      });

      // order shipping address
      await prisma.orderAddress.create({
        data: {
          orderId: orderDetails.id,
          firstName: payload?.firstName,
          lastName: payload?.lastName,
          email: payload?.email,
          cc: payload?.cc,
          phone: payload?.phone,
          address: payload?.shippingAddress,
          city: payload?.shippingCity,
          province: payload?.shippingProvince,
          country: payload?.shippingCountry,
          postCode: payload?.shippingPostCode,
          addressType: 'SHIPPING'
        }
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: orderDetails
      }

    } catch (error) {
      console.log('error: ', error);
      
      return {
          status: false,
          message: 'error in createOrderUnAuth',
          error: error.message
      }
    }
  }

  // ---- **** buyer side start
  async getAllOrderByUserId(page: any, limit: any, req: any) {
    try {
      const userId = req?.user?.id;
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      

      let getAllOrderList = await prisma.order.findMany({
        where: { userId: userId },
        include: {
          order_orderProducts: true,
          order_orderAddress: true,
        },
        skip, // Offset
        take: pageSize, // Limit
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllOrderList
      }
      
    } catch (error) {
      return {
          status: false,
          message: 'error in createOrder',
          error: error.message
      }
    }
  }

  async getAllOrderProductByUserId(page: any, limit: any, req: any, term: any, orderProductStatus: any, startDate: any, endDate: any) {
    try {
      const userId = req?.user?.id;
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : ''

      let productWhereCondition: any = {
        productName: {
          contains: searchTerm,
          mode: 'insensitive'
        },
      };

      let whereCondition: any = {
        userId: userId,
        OR: [
          {
            orderProduct_product: {
              productName: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          },
          {
            orderProduct_order: {
              orderNo: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          }
        ]
      }

      if (orderProductStatus) {
        whereCondition.orderProductStatus = orderProductStatus
      }

      if (startDate && endDate) {
        whereCondition.orderProductDate = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      let getAllOrderProduct =  await prisma.orderProducts.findMany({
        where: whereCondition,
        include: {
          orderProduct_order: {
            include: {
              order_orderAddress: true
            }
          },   
          orderProduct_productPrice: {
            include: {
              productPrice_product: {
                include: {
                  productImages: true,
                }
              }
            }
          },  
          orderProduct_product: {
            select: {
              id: true,
              adminId: true
            },
            // include: {
            //   productImages: true,
            // }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      });

      if (!getAllOrderProduct) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      let getAllOrderProductCount = await prisma.orderProducts.count({
        where: whereCondition
      });
  
      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllOrderProduct,
        totalCount: getAllOrderProductCount
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in getAllOrderProductByUserId',
        error: error.message
      }
    }
  }

  async getOneOrderProductDetailByUserId(orderProductId: any, req: any) {
    try {
      const orderProductID = parseInt(orderProductId);

      let getOneOrderProductDetail = await prisma.orderProducts.findUnique({
        where: { id: orderProductID },
        include: {
          orderProduct_order: {
            include: {
              order_orderAddress: true
            }
          },
          orderProduct_productPrice: {
            include: {
              adminDetail: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                  tradeRole: true,
                  userProfile: {
                    select: {
                      profileType: true,
                      logo: true,
                      companyName: true
                    }
                  }
                }
              },
              productPrice_product: {
                include: {
                  productImages: true
                }
              }
            }
          }, 
          orderProduct_product: {
            select: {
              id: true,
              adminId: true
            },
            // include: {
            //   productImages: true,
            //   adminBy: { 
            //     select: {
            //       id: true,
            //       firstName: true,
            //       lastName: true,
            //       profilePicture: true,
            //       tradeRole: true,
            //       userProfile: {
            //         select: {
            //           profileType: true,
            //           logo: true,
            //           companyName: true
            //         }
            //       }
            //     }
            //   },
            // }
          }
        },
      });

      if (!getOneOrderProductDetail) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      let orderShippingDetail = null;
      if (getOneOrderProductDetail?.orderShippingId) {
        let orderShippingId = getOneOrderProductDetail?.orderShippingId;
        orderShippingDetail = await prisma.orderShipping.findUnique({
          where: { id: orderShippingId }
        });
      }
      
      let orderId = getOneOrderProductDetail.orderId;

      let orderDetail = await prisma.order.findMany({
        where: {
          id: orderId
        },
        include: {
          order_orderProducts: {
            where: {
              id: {
                not: orderProductID
              }
            },
            include: {
              orderProduct_productPrice: {
                include: {
                  adminDetail: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      profilePicture: true,
                      tradeRole: true,
                      userProfile: {
                        select: {
                          profileType: true,
                          logo: true,
                          companyName: true
                        }
                      }
                    }
                  },
                  productPrice_product: {
                    include: {
                      productImages: true
                    }
                  }
                }
              }, 
              orderProduct_product: {
                select: {
                  id: true,
                  adminId: true
                },
                // include: {
                //   userBy: true,
                //   adminBy: true,
                //   productImages: true,
                // }
              }
            }
          }
        }
      })

      return {
        status: true,
        message: 'Fetch Successfully',
        data: {
          ...getOneOrderProductDetail,
          orderShippingDetail,
        },
        orderShippingDetail: orderShippingDetail,
        otherData: orderDetail
      }

    } catch (error) {
      console.log('error: ', error);
      
      return {
        status: false,
        message: 'error in getOneOrderProductDetailByUserId',
        error: error.message
      }
    }
  }
  // buyer side ends **** ----

  // ---- **** seller side start
  async getAllOrderProductBySellerId(page: any, limit: any, req: any, term: any, orderProductStatus: any) {
    try {
      let sellerId = req?.user?.id;
      // if (req?.query?.selectedAdminId) {
      //   sellerId = parseInt(req.query.selectedAdminId);
      // }
      let adminDetail = await prisma.user.findUnique({
        where: { id: sellerId },
        select: {
          id: true,
          tradeRole: true,
          addedBy: true
        }
      });
      if (adminDetail && adminDetail.tradeRole === "MEMBER") {
        sellerId = adminDetail.addedBy;
      }
      console.log("sellerId: ", sellerId);
      
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : ''

      let whereCondition: any = {
        sellerId: sellerId,
        OR: [
          {
            orderProduct_product: {
              productName: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          },
          {
            sellerOrderNo: {
              contains: searchTerm,
              mode: 'insensitive'
            }
            // orderProduct_order: {
            //   orderNo: {
            //     contains: searchTerm,
            //     mode: 'insensitive'
            //   }
            // }
          }
        ]
      }

      if (orderProductStatus) {
        whereCondition.orderProductStatus = orderProductStatus
      }

      let getAllOrderProduct =  await prisma.orderProducts.findMany({
        where: whereCondition,
        include: {
          orderProduct_order: {
            include: {
              order_orderAddress: true
            }
          },
          orderProduct_productPrice: {
            include: {
              productPrice_product: {
                include: {
                  productImages: true,
                }
              }
            }
          }, 
          orderProduct_product: {
            select: {
              id: true,
              adminId: true
            },
            // include: {
            //   productImages: true,
            // }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      });

      if (!getAllOrderProduct) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      let getAllOrderProductCount = await prisma.orderProducts.count({
        where: whereCondition
      });
  
      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllOrderProduct,
        totalCount: getAllOrderProductCount,
        selectedAdminId: sellerId
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in getAllOrderProductBySellerId',
        error: error.message
      }
    }
  }

  async getOneOrderProductDetailBySellerId(orderProductId: any, req: any) {
    try {
      const orderProductID = parseInt(orderProductId);

      let getOneOrderProductDetail = await prisma.orderProducts.findUnique({
        where: { id: orderProductID },
        include: {
          orderProduct_order: {
            include: {
              order_orderAddress: true
            }
          },
          orderProduct_productPrice: {
            include: {
              adminDetail: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                  tradeRole: true,
                  userProfile: {
                    select: {
                      profileType: true,
                      logo: true,
                      companyName: true
                    }
                  }
                }
              },
              productPrice_product: {
                include: {
                  productImages: true,
                }
              }
            }
          }, 
          orderProduct_product: {
            select: {
              id: true,
              adminId: true
            },
            // include: {
            //   productImages: true,
            //   adminBy: { 
            //     select: {
            //       id: true,
            //       firstName: true,
            //       lastName: true,
            //       profilePicture: true,
            //       tradeRole: true,
            //       userProfile: {
            //         select: {
            //           profileType: true,
            //           logo: true,
            //           companyName: true
            //         }
            //       }
            //     }
            //   },
            // }
          }
        },
      });

      if (!getOneOrderProductDetail) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      
      let orderShippingDetail = null;
      if (getOneOrderProductDetail?.orderShippingId) {
        let orderShippingId = getOneOrderProductDetail?.orderShippingId;
        orderShippingDetail = await prisma.orderShipping.findUnique({
          where: { id: orderShippingId }
        });
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: {
          ...getOneOrderProductDetail,
          orderShippingDetail
        }
      }

    } catch (error) {
      return {
        status: false,
        message: 'error, in getOneOrderProductDetailBySellerId',
        error: error.message
      }
    }
  }

  async orderProductStatusById(payload: any) {
    try {
      const orderProductId = payload?.orderProductId;
      const status = payload?.status;

      let existOrderProduct = await prisma.orderProducts.findUnique({
        where: { id: orderProductId }
      });

      if (!existOrderProduct) {
        return {
          status: false,
          message: 'Not Found',
          data: existOrderProduct
        } 
      }

      let orderProductDetail = await prisma.orderProducts.update({
        where: { id: orderProductId },
        data: { orderProductStatus: status }
      });

      return {
        status: true,
        message: 'Status Changed Successfully',
        data: orderProductDetail
      } 

    } catch (error) {
      console.log('error: ', error);
      return {
        status: false,
        message: 'error, in orderProductStatusById',
        error: error.message
      }
    }
  }

  async orderShippingStatusUpdateById(payload: any, req: any) {
    try {
      const orderShippingId = payload?.orderShippingId;
      if (!orderShippingId) {
        return {
          status: false,
          message: 'orderShippingId is required.',
          data: []
        }
      }

      let updateOrderShipping = await prisma.orderShipping.update({
        where: { id: orderShippingId },
        data: {
          status: payload?.status,
          receipt: payload?.receipt
        }
      });

      return {
        status: true, 
        message: 'Updated Successfully',
        data: updateOrderShipping
      }
      
    } catch (error) {
      console.log('error in orderStatusUpdateById: ', error);
      return {
        status: false,
        message: 'error, in orderStatusUpdateById',
        error: error.message
      }
    }
  }
  // seller side ends **** ----

  async orderProductCancelReason(payload: any) {
    try {
      if(!payload?.cancelReason) {
        return {
          status: false,
          message: 'cancelReason is required',
          data: []
        }
      }
      const orderProductId = payload?.orderProductId;

      let orderProductCancelReason = await prisma.orderProducts.update({
        where: { id: orderProductId },
        data: { cancelReason: payload?.cancelReason }
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: orderProductCancelReason
      }
    } catch (error) {
      return {
        status: false,
        message: 'error, in orderProductCancelReason',
        error: error.message
      }
    }
  }

  async preOrderCal(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      const userAddressId = payload?.userAddressId

      let totalCartIds = [
        ...(payload.cartIds || []),
        ...(payload.serviceCartIds || [])
      ];

      let cartProductServiceRelation = await prisma.cartProductService.findMany({
        where: {
          OR: [
            { cartId: { in: totalCartIds } },
            { relatedCartId: { in: totalCartIds } }
          ]
        }
      });

      let userDetail = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          customerId: true,
          userType: true,
          tradeRole: true
        }
      });
      let userTradeRole = userDetail.tradeRole;
      console.log("buyerTradeRole: ", userTradeRole);
      
      const buyerType = ['COMPANY', 'FREELANCER'].includes(userTradeRole) ? 'VENDOR' : 'CONSUMER';

      let userAddress = await prisma.userAddress.findUnique({
        where: { id: payload?.userAddressId }
      });
      const countryId = userAddress.countryId;
      const stateId = userAddress.stateId;
      const cityId = userAddress.cityId;

      let FeesLocation;
      if (buyerType === 'VENDOR') {
        FeesLocation = await prisma.feesLocation.findMany({
          where: {
            feeLocationType: 'VENDOR',
            countryId: countryId,
            stateId: stateId,
            cityId: cityId
          },
          include: {
            vendorFeesDetails: true,
            // consumerFeesDetails: true
          }
        });
      } else {
        FeesLocation = await prisma.feesLocation.findMany({
          where: {
            feeLocationType: 'CONSUMER',
            countryId: countryId,
            stateId: stateId,
            cityId: cityId
          },
          include: {
            // vendorFeesDetails: true,
            consumerFeesDetails: true
          }
        });
      }

      // return {
      //   status: true,
      //   message: "Fetch Successfully",
      //   data: FeesLocation,
      //   countryId: countryId,
      //   stateId: stateId,
      //   cityId: cityId
      // };

      let productList = [];
      let deliveryCharge = 0;
      let totalPrice = 0;
      let totalPurchasedPrice = 0;
      let discount = 0;
      let invalidProducts = [];
      let productCannotBuy = []
      let totalCustomerPay = 0;
      let totalPlatform = 0
      let totalCashbackToCustomer = 0;

      for (let i = 0; i < payload.cartIds.length; i++) {
        let cartDetails = await prisma.cart.findUnique({
          where: { id: payload.cartIds[i] },
          select: { productId: true, quantity: true, productPriceId: true }
        });

        let productPriceDetails = await prisma.productPrice.findUnique({
          where: { id: cartDetails.productPriceId },
        });
        let menuId = productPriceDetails.menuId;
        
        // Restriction: VENDORS cannot buy CONSUMER-only products
        if (['COMPANY', 'FREELANCER'].includes(userTradeRole) && productPriceDetails.consumerType === 'CONSUMER') {
          invalidProducts.push(cartDetails.productId);
          continue;
        }

        // Restriction: CONSUMERS cannot buy VENDORS-only products
        if (userTradeRole === 'BUYER' && productPriceDetails.consumerType === 'VENDORS' ) {
          invalidProducts.push(cartDetails.productId);
          continue;
        }

        let offerPrice = parseFloat(productPriceDetails.offerPrice.toString());
        let purchasedPrice = offerPrice;
        let discountAmount = 0;
        let discountApplied = false

        //  Apply Discounts
        if (productPriceDetails.consumerType === 'VENDORS' && ['COMPANY', 'FREELANCER'].includes(userTradeRole)) {

          if (productPriceDetails?.vendorDiscountType === 'FLAT') {
            discountAmount = parseFloat(productPriceDetails.vendorDiscount?.toString() || "0");
            purchasedPrice -= discountAmount;
            discountApplied = true;

          } else if (productPriceDetails?.vendorDiscountType === 'PERCENTAGE') {
            discountAmount = (offerPrice * parseFloat(productPriceDetails.vendorDiscount?.toString() || "0")) / 100;
            purchasedPrice -= discountAmount;
            discountApplied = true;
          }

        } else if (productPriceDetails.consumerType === 'CONSUMER' && userTradeRole === 'BUYER') {

          if (productPriceDetails?.consumerDiscountType === 'FLAT') {
            discountAmount = parseFloat(productPriceDetails.consumerDiscount?.toString() || "0");
            purchasedPrice -= discountAmount;
            discountApplied = true;

          } else if (productPriceDetails?.consumerDiscountType === 'PERCENTAGE') {
            discountAmount = (offerPrice * parseFloat(productPriceDetails.consumerDiscount?.toString() || "0")) / 100;
            purchasedPrice -= discountAmount;
            discountApplied = true;
          }

        } else if (productPriceDetails.consumerType === 'EVERYONE') {
          console.log("EVERYONE");
          
          if (['COMPANY', 'FREELANCER'].includes(userTradeRole)) {
            if (productPriceDetails?.vendorDiscountType === 'FLAT') {
              discountAmount = parseFloat(productPriceDetails.vendorDiscount?.toString() || "0");
              purchasedPrice -= discountAmount;
              discountApplied = true;

            } else if (productPriceDetails?.vendorDiscountType === 'PERCENTAGE') {
              discountAmount = (offerPrice * parseFloat(productPriceDetails.vendorDiscount?.toString() || "0")) / 100;
              purchasedPrice -= discountAmount;
              discountApplied = true;

            }
          } else if (userTradeRole === 'BUYER') {

            if (productPriceDetails?.consumerDiscountType === 'FLAT') {
              discountAmount = parseFloat(productPriceDetails.consumerDiscount?.toString() || "0");
              purchasedPrice -= discountAmount;
              discountApplied = true;
  
            } else if (productPriceDetails?.consumerDiscountType === 'PERCENTAGE') {
              discountAmount = (offerPrice * parseFloat(productPriceDetails.consumerDiscount?.toString() || "0")) / 100;
              purchasedPrice -= discountAmount;
              discountApplied = true;
  
            }
          }
        } 

        let quantity = cartDetails.quantity;
        let totalProductDiscount = discountAmount * quantity;

        // fee calculation function (define separately)
        const feeResult = await this.calculateFees({
          userAddressId: userAddressId,
          menuId: menuId,
          buyerId: userId,
          buyerType: buyerType,
          productId: productPriceDetails.productId,
          productPriceId: productPriceDetails.id,
          quantity: quantity,
          purchasedPrice: purchasedPrice * quantity
        });

        // return {
        //   status: true,
        //   message: "Fetch Successfully",
        //   data: feeResult.feesFeesType,
        //   breakdown: feeResult.breakdown,
        //   customerPay: feeResult.customerPay,
        //   cashbackToCustomer: feeResult.cashbackToCustomer,
        //   sellerReceives: feeResult.sellerReceives,
        //   platformProfit: feeResult.platformProfit,
        //   productMessage: feeResult.message,
        //   productV: feeResult.productV,
        //   productC: feeResult.productC
        // };

        const breakdown = feeResult.breakdown;
        const customerPay = Number(feeResult.customerPay);
        const cashbackToCustomer = feeResult.cashbackToCustomer;
        const sellerReceives = feeResult.sellerReceives;
        const platformProfit = feeResult.platformProfit;
        const productReasonMessage = feeResult.message;

        if (!feeResult || !feeResult.isValid) {
          productCannotBuy.push({
            productId: cartDetails.productId,
            productReasonMessage: productReasonMessage
          });
          continue;
        }

        productList.push({
          productPriceId: productPriceDetails.id,
          productId: productPriceDetails.productId,
          offerPrice: offerPrice, // actual price per
          purchasedPrice: purchasedPrice, // actual price after discount
          quantity: quantity,
          sellerId: productPriceDetails.adminId,
          discountApplied,
          discountAmount: discountAmount, // discount per quantity
          totalProductDiscount, // total discount on 
          menuId: menuId,
          breakdown: breakdown,
          customerPay: customerPay,
          cashbackToCustomer: cashbackToCustomer,
          sellerReceives: sellerReceives,
          platformProfit: platformProfit
        });

        totalPrice += offerPrice * quantity;
        totalPurchasedPrice += purchasedPrice * quantity;
        discount += totalProductDiscount;

        totalCustomerPay += customerPay;
        totalPlatform += platformProfit;
        totalCashbackToCustomer += cashbackToCustomer;
      }

      for (let j = 0; j < payload.serviceCartIds.length; j++) {
        const cartDetails = await prisma.cart.findUnique({
          where: { id: payload.serviceCartIds[j] },
          include: {
            service: {
              include: {
                serviceFeatures: true
              }
            },
            cartServiceFeatures: {
              include: {
                serviceFeature: true
              }
            }
          }
        });
      
        let totalPrice = 0;
        let quantity = 0;
        const breakdownList = [];
      
        for (let k = 0; k < cartDetails.cartServiceFeatures.length; k++) {

          const feature = cartDetails.cartServiceFeatures[k].serviceFeature;
          const cost = parseFloat(feature.serviceCost.toString());
          const serviceFeatureQuantity = cartDetails.cartServiceFeatures[k].quantity

          if (feature.serviceCostType === 'FLAT') {
            totalPrice += cost;
            quantity += serviceFeatureQuantity

            breakdownList.push({
              id: feature.id,
              name: feature.name,
              cost: cost,
              costType: feature.serviceCostType,
              quantity: serviceFeatureQuantity
            });

          } else if (feature.serviceCostType === 'HOURLY') {
            const hours = cartDetails.service.eachCustomerTime || 1;
            totalPrice += (cost * hours) * serviceFeatureQuantity;
            quantity = serviceFeatureQuantity;

            breakdownList.push({
              id: feature.id,
              name: feature.name,
              cost: cost * hours,
              costType: feature.serviceCostType,
              hours: hours,
              quantity: serviceFeatureQuantity
            });
          }
        }
      
        productList.push({
          orderProductType: 'SERVICE',
          serviceId: cartDetails.serviceId,
          productPriceId: null,
          productId: null,
          offerPrice: totalPrice / quantity,
          purchasedPrice: totalPrice / quantity,
          quantity: quantity,
          sellerId: cartDetails.service.sellerId,
          discountApplied: false,
          discountAmount: 0,
          totalProductDiscount: 0,
          menuId: null,
          breakdown: { serviceFeatures: breakdownList },
          customerPay: totalPrice,
          cashbackToCustomer: 0,
          sellerReceives: totalPrice,
          platformProfit: 0,
          object: cartDetails.object,
          cartId: cartDetails.id,
        });

        totalCustomerPay += totalPrice;
      }

      return {
        status: true,
        message: invalidProducts.length > 0 ? "Some products are not available for your trade role" : "Fetch Successfully",
        data: productList,
        totalPrice,
        totalPurchasedPrice,
        discount,
        invalidProducts,
        productCannotBuy: productCannotBuy,
        totalCustomerPay: totalCustomerPay,
        totalPlatform: totalPlatform,
        totalCashbackToCustomer: totalCashbackToCustomer
      };

    } catch (error) {
      console.log("error: ", error);
      return {
        status: false,
        message: 'error in preOrderCal',
        error: error.message
      };
    }
  }
  
  async calculateFees({ userAddressId, menuId, buyerId, buyerType, productId, productPriceId, quantity, purchasedPrice }) {
    console.log("fee calculation called");
    
    // checking fees is GLOBAL or NONGLOBAL
    let feesFeesType = await prisma.fees.findFirst({
      where: {
        menuId: menuId
      },
    });
    

    if (feesFeesType) {
      if (feesFeesType.feeType === 'GLOBAL') {
        console.log(`Product with menuId ${menuId} has GLOBAL fee type`);
        // Later logic here

        let fees = await prisma.fees.findFirst({
          where: {
            menuId: menuId
          },
          include: {
            feesToFeesDetail: {
              where: { status: "ACTIVE" },
              include: {
                vendorDetail: {
                  where: { status: "ACTIVE" },
                  include: {
                    vendorLocation: {
                      where: { status: "ACTIVE" },
                      include: {
                        feesLocation_country: true,
                        feesLocation_state: true,
                        feesLocation_city: true,
                      }
                    }
                  }
                },
                consumerDetail: {
                  where: { status: "ACTIVE" },
                  include: {
                    consumerLocation: {
                      where: { status: "ACTIVE" },
                      include: {
                        feesLocation_country: true,
                        feesLocation_state: true,
                        feesLocation_city: true,
                      }
                    }
                  }
                },
              }
            }
          },
        });

        const feeDetail = fees.feesToFeesDetail[0];

        // Vendor side fees
        const vendorPercentage = feeDetail.vendorDetail.vendorPercentage || 0;
        const vendorMaxCapPerDeal = feeDetail.vendorDetail.vendorMaxCapPerDeal || 0;
        const vendorVat = feeDetail.vendorDetail.vendorVat || 0;
        const vendorPaymentGateFee = feeDetail.vendorDetail.vendorPaymentGateFee || 0;
        const vendorFixFee = feeDetail.vendorDetail.vendorFixFee || 0;

        console.log("vendorPercentage: ", vendorPercentage);
        console.log("vendorMaxCapPerDeal: ", vendorMaxCapPerDeal);
        console.log("vendorVat: ", vendorVat);
        console.log("vendorPaymentGateFee: ", vendorPaymentGateFee);
        console.log("vendorFixFee: ", vendorFixFee);

        // Customer side fees
        const customerPercentage = feeDetail.consumerDetail.consumerPercentage || 0;
        const customerMaxCapPerDeal = feeDetail.consumerDetail.consumerMaxCapPerDeal || 0;
        console.log("customerPercentage: ", customerPercentage);
        console.log("customerMaxCapPerDeal: ", customerMaxCapPerDeal);

        // // Customer Fee Calculation
        // const rawCustomerFee = purchasedPrice * (customerPercentage / 100);
        // const actualChargedCustomerFee = Math.min(rawCustomerFee, customerMaxCapPerDeal);
        // const cashbackToCustomer = rawCustomerFee - actualChargedCustomerFee;
        // const totalCustomerPay = purchasedPrice + actualChargedCustomerFee;

        // // Vendor Fee Calculation
        // const rawVendorFee = purchasedPrice * (vendorPercentage / 100);
        // const vendorFee = Math.min(rawVendorFee, vendorMaxCapPerDeal);
        // const vatAmount = purchasedPrice * (vendorVat / 100);
        // const gatewayFee = purchasedPrice * (vendorPaymentGateFee / 100);
        // const vendorReceives = purchasedPrice - (vendorFee + vatAmount + gatewayFee + vendorFixFee);

        // Ensure all inputs are converted to Decimal if not already
        const price = new Decimal(purchasedPrice); // in case purchasedPrice is a number

        // Customer Fee Calculation
        const rawCustomerFee = price.mul(customerPercentage).div(100); // price * customerPercentage / 100
        const actualChargedCustomerFee = Decimal.min(rawCustomerFee, customerMaxCapPerDeal); // min (rawCustomerFee - customerMaxCapPerDeal)
        const cashbackToCustomer = rawCustomerFee.sub(actualChargedCustomerFee); // rawCustomerFee - actualChargedCustomerFee
        const totalCustomerPay = price.add(actualChargedCustomerFee); // price + actualChargedCustomerFee

        // Vendor Fee Calculation
        const rawVendorFee = price.mul(vendorPercentage).div(100); // price * vendorPercentage / 100
        const vendorFee = Decimal.min(rawVendorFee, vendorMaxCapPerDeal); // min (rawVendorFee, vendorMaxCapPerDeal)
        const vatAmount = price.mul(vendorVat).div(100); // price * vendorVat / 100
        const gatewayFee = price.mul(vendorPaymentGateFee).div(100); // price  * vendorPaymentGateFee / 100
        const vendorReceives = price.sub(vendorFee.add(vatAmount).add(gatewayFee).add(vendorFixFee)); // price - (vendorFee + vatAmount + gatewayFee + vendorFixFee)

        // // Platform profit
        // const platformProfit = totalCustomerPay - vendorReceives - cashbackToCustomer;
        const platformProfit = totalCustomerPay
          .minus(vendorReceives)
          .minus(cashbackToCustomer);

        return {
          isValid: true,
          fees: fees,
          feesFeesType: feesFeesType,
          customerPay: totalCustomerPay,
          cashbackToCustomer: parseFloat(cashbackToCustomer.toFixed(2)),
          sellerReceives: parseFloat(vendorReceives.toFixed(2)),
          platformProfit: parseFloat(platformProfit.toFixed(2)),
          breakdown: {
            customer: {
              purchasedPrice,
              customerPercentage,
              rawCustomerFee: parseFloat(rawCustomerFee.toFixed(2)),
              chargedFee: parseFloat(actualChargedCustomerFee.toFixed(2)),
              cashback: parseFloat(cashbackToCustomer.toFixed(2)),
              totalPay: parseFloat(totalCustomerPay.toFixed(2)),
            },
            vendor: {
              vendorPercentage,
              vendorFee: parseFloat(vendorFee.toFixed(2)),
              vatAmount: parseFloat(vatAmount.toFixed(2)),
              gatewayFee: parseFloat(gatewayFee.toFixed(2)),
              fixFee: parseFloat(vendorFixFee.toFixed(2)),
              payout: parseFloat(vendorReceives.toFixed(2)),
            },
            platform: {
              profit: parseFloat(platformProfit.toFixed(2)),
            }
          }
        };

      } else if (feesFeesType.feeType === 'NONGLOBAL') {
        console.log(`Product with menuId ${menuId} has NONGLOBAL fee type`);

        // vendor fees
        let productPriceDetail = await prisma.productPrice.findUnique({
          where: { id: productPriceId }
        })
        const { productCountryId, productStateId, productCityId } = productPriceDetail

        const vendorLocationFees = await prisma.fees.findFirst({
          where: {
            menuId: menuId,
            id: feesFeesType.id,
            feesToFeesDetail: {
              some: {
                status: "ACTIVE",
                vendorDetail: {
                  status: "ACTIVE",
                  vendorLocation: {
                    status: "ACTIVE",
                    countryId: productCountryId,
                    stateId: productStateId,
                    cityId: productCityId,
                  }
                }
              }
            }
          },
          include: {
            feesToFeesDetail: {
              where: {
                status: "ACTIVE",
                vendorDetail: {
                  status: "ACTIVE",
                  vendorLocation: {
                    status: "ACTIVE",
                    countryId: productCountryId,
                    stateId: productStateId,
                    cityId: productCityId,
                  }
                }
              },
              include: {
                vendorDetail: {
                  include: {
                    vendorLocation: {
                      include: {
                        feesLocation_country: true,
                        feesLocation_state: true,
                        feesLocation_city: true,
                      }
                    }
                  }
                }
              }
            }
          }
        });
        

        // customer fees
        let userAddress = await prisma.userAddress.findUnique({
          where: { id: userAddressId }
        });
        const { countryId, stateId, cityId } = userAddress;
        const customerLocationFees = await prisma.fees.findFirst({
          where: {
            menuId: menuId,
            id: feesFeesType.id,
            feesToFeesDetail: {
              some: {
                status: "ACTIVE",
                consumerDetail: {
                  status: "ACTIVE",
                  consumerLocation: {
                    status: "ACTIVE",
                    countryId: countryId,
                    stateId: stateId,
                    cityId: cityId,
                  }
                }
              }
            }
          },
          include: {
            feesToFeesDetail: {
              where: {
                status: "ACTIVE",
                consumerDetail: {
                  status: "ACTIVE",
                  consumerLocation: {
                    status: "ACTIVE",
                    countryId: countryId,
                    stateId: stateId,
                    cityId: cityId,
                  }
                }
              },
              include: {
                consumerDetail: {
                  include: {
                    consumerLocation: {
                      include: {
                        feesLocation_country: true,
                        feesLocation_state: true,
                        feesLocation_city: true,
                      }
                    }
                  }
                }
              }
            }
          }
        });
        

        if (vendorLocationFees && customerLocationFees) {
          const vendorFeeDetail = vendorLocationFees.feesToFeesDetail[0];
          const customerFeeDetail = customerLocationFees.feesToFeesDetail[0];
        
          // Vendor side fees
          const vendorPercentage = vendorFeeDetail.vendorDetail.vendorPercentage || 0;
          const vendorMaxCapPerDeal = vendorFeeDetail.vendorDetail.vendorMaxCapPerDeal || 0;
          const vendorVat = vendorFeeDetail.vendorDetail.vendorVat || 0;
          const vendorPaymentGateFee = vendorFeeDetail.vendorDetail.vendorPaymentGateFee || 0;
          const vendorFixFee = vendorFeeDetail.vendorDetail.vendorFixFee || 0;
        
          // Customer side fees
          const customerPercentage = customerFeeDetail.consumerDetail.consumerPercentage || 0;
          const customerMaxCapPerDeal = customerFeeDetail.consumerDetail.consumerMaxCapPerDeal || 0;
        
          const price = new Decimal(purchasedPrice);
        
          // Customer Fee Calculation
          const rawCustomerFee = price.mul(customerPercentage).div(100);
          console.log("rawCustomerFee: ", rawCustomerFee);
          const actualChargedCustomerFee = Decimal.min(rawCustomerFee, customerMaxCapPerDeal);
          console.log("actualChargedCustomerFee: ", actualChargedCustomerFee);
          const cashbackToCustomer = rawCustomerFee.sub(actualChargedCustomerFee);
          console.log("cashbackToCustomer: ", cashbackToCustomer);
          const totalCustomerPay = price.add(actualChargedCustomerFee);
          console.log("totalCustomerPay: ", totalCustomerPay);
        
          // Vendor Fee Calculation
          const rawVendorFee = price.mul(vendorPercentage).div(100);
          console.log("rawVendorFee: ", rawVendorFee);
          const vendorFee = Decimal.min(rawVendorFee, vendorMaxCapPerDeal);
          console.log("vendorFee: ", vendorFee);
          const vatAmount = price.mul(vendorVat).div(100);
          console.log("vatAmount: ", vatAmount);
          const gatewayFee = price.mul(vendorPaymentGateFee).div(100);
          console.log("gatewayFee: ", gatewayFee);
          const vendorReceives = price.sub(
            vendorFee.add(vatAmount).add(gatewayFee).add(vendorFixFee)
          );
          console.log("vendorReceives: ", vendorReceives);
        
          // Platform profit
          const platformProfit = totalCustomerPay
            .sub(vendorReceives)
            .sub(cashbackToCustomer);
          console.log("platformProfit: ", platformProfit);
        
          return {
            isValid: true,
            message: "Fees calculated successfully",
            feesFeesType,
            customerPay: parseFloat(totalCustomerPay.toFixed(2)),
            cashbackToCustomer: parseFloat(cashbackToCustomer.toFixed(2)),
            sellerReceives: parseFloat(vendorReceives.toFixed(2)),
            platformProfit: parseFloat(platformProfit.toFixed(2)),
            breakdown: {
              customer: {
                purchasedPrice,
                customerPercentage,
                rawCustomerFee: parseFloat(rawCustomerFee.toFixed(2)),
                chargedFee: parseFloat(actualChargedCustomerFee.toFixed(2)),
                cashback: parseFloat(cashbackToCustomer.toFixed(2)),
                totalPay: parseFloat(totalCustomerPay.toFixed(2)),
              },
              vendor: {
                vendorPercentage,
                vendorFee: parseFloat(vendorFee.toFixed(2)),
                vatAmount: parseFloat(vatAmount.toFixed(2)),
                gatewayFee: parseFloat(gatewayFee.toFixed(2)),
                fixFee: parseFloat(vendorFixFee.toFixed(2)),
                payout: parseFloat(vendorReceives.toFixed(2)),
              },
              platform: {
                profit: parseFloat(platformProfit.toFixed(2)),
              }
            },
            productV: vendorLocationFees,
            productC: customerLocationFees,
          };
        }
        
        // Fee not found for one or both
        if (!vendorLocationFees && !customerLocationFees) {
          return {
            isValid: false,
            message: 'Both vendor and customer fees are missing for the provided location',
            feesFeesType,
            customerPay: purchasedPrice,
            sellerReceives: purchasedPrice,
            platformFee: 0,
            breakdown: {},
            productV: vendorLocationFees,
            productC: customerLocationFees
          };
        }

        if (!vendorLocationFees) {
          return {
            isValid: false,
            message: 'Vendor fees not found for the product location',
            feesFeesType,
            customerPay: purchasedPrice,
            sellerReceives: purchasedPrice,
            platformFee: 0,
            breakdown: {},
            productV: vendorLocationFees,
            productC: customerLocationFees
          };
        }

        if (!customerLocationFees) {
          return {
            isValid: false,
            message: 'Customer fees not found for the buyer location',
            feesFeesType,
            customerPay: purchasedPrice,
            sellerReceives: purchasedPrice,
            platformFee: 0,
            breakdown: {},
            productV: vendorLocationFees,
            productC: customerLocationFees
          };
        }

        return {
          isValid: false,
          message: "Fees found successfully (Error)",
          feesFeesType,
          vendorLocationFees,
          customerLocationFees,
          customerPay: purchasedPrice, // placeholder
          sellerReceives: purchasedPrice, // placeholder
          platformFee: 0, // placeholder
          breakdown: {},
          productV: vendorLocationFees,
          productC: customerLocationFees
        };

      }
    } else {
      console.log(`No fee found for menuId: ${menuId}`);
    }

    return {
      feesFeesType: feesFeesType,
      isValid: false,
      message: "non applicable",
      customerPay: purchasedPrice, // example
      sellerReceives: purchasedPrice, // example
      platformFee: 2,
      breakdown: {} // example
    };
  }


}
