import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notification/notification.service';
import { S3service } from 'src/user/s3.service';
import Stripe from 'stripe';
import * as randomstring from 'randomstring';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});

@Injectable()
export class StripeService {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly s3service: S3service,
  ) { }

  async createStripeAccount(req: any) {
    try {
      const userId = req?.user?.id;
      if (!req?.body?.returnURL) {
        return {
          status: false,
          message: 'returnURL is required!',
          data: [],
        };
      }
  
      let stripeAccountId;
      let userDetails = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!userDetails?.stripeAccountId) {
        // Create a new Stripe Express account
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'US',
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });
  
        stripeAccountId = account.id;
  
        // Update user record with the new Stripe account ID
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeAccountId: account.id },
          });
        }
      } else {
        stripeAccountId = userDetails.stripeAccountId;
      }
  
      // Generate Stripe onboarding link
      const accountLinkURL = await this.generateAccountLink(stripeAccountId, req.body.returnURL);
  
      return {
        status: true,
        message: 'Stripe account link generated successfully!',
        data: {
          stripeAccountId,
          url: accountLinkURL,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error in createStripeAccount',
        error: error.message,
      };
    }
  }

  async getAccount(req: any) {
    try {
      const userId = req.user.id; // Get userId from request
      const authUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!authUser) {
        return ({
          status: false,
          message: 'user not found',
          data: [],
        });
      }

      const stripeAccountId = req.params.stripeAccountId || authUser.stripeAccountId;

      if (!stripeAccountId) {
        return ({
          status: false,
          message: 'Stripe account ID not found for user',
          data: [],
        });
      }

      const stripeAccount = await stripe.accounts.retrieve(stripeAccountId);

      return ({
        status: true,
        message: 'Stripe account retrieved successfully',
        data: stripeAccount,
      });

    } catch (error) {
      console.error('getAccount Error:', error);
      return ({
        status: false,
        message: 'Error retrieving Stripe account',
        error: error.message,
      });
    }
  }

  async updateStripeAccount(req: any) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      if (!req.body.returnUrl) {
        throw new BadRequestException('returnUrl is required');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const stripeAccountId = user.stripeAccountId;
      if (!stripeAccountId) {
        throw new NotFoundException('Please create a Stripe account first');
      }

      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${req.body.returnUrl}?refresh=true`,
        return_url: req.body.returnUrl,
        type: 'account_onboarding',
      });

      return {
        status: true,
        message: 'Link created successfully',
        data: accountLink,
      };
    } catch (error) {
      console.error('updateStripeAccount Error:', error);
      return {
        status: false,
        message: 'Error in updateStripeAccount',
        error: error.message,
      };
    }
  }
  
  /**
   * Generate Stripe Account Onboarding Link
   */
  private async generateAccountLink(accountID: string, returnUrl: string): Promise<string> {
    try {
      const accountLink = await stripe.accountLinks.create({
        type: 'account_onboarding',
        account: accountID,
        refresh_url: `${returnUrl}?refresh=true`,
        return_url: `${returnUrl}?success=true`,
        collect: 'currently_due',
      });
  
      return accountLink.url;
    } catch (error) {
      throw new Error(`Failed to generate account link: ${error.message}`);
    }
  }
  

}
