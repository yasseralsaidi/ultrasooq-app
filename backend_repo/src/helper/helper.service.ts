import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const axios = require("axios");

const PAYMOB_OMAN_API_URL = "https://oman.paymob.com/api";

@Injectable()
export class HelperService {
  constructor(

  ) { }

  async getAdminId(userId: number): Promise<number | null> {
    if (!userId) return null; // Handle case where userId is undefined

    const adminDetail = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, tradeRole: true, addedBy: true },
    });

    return adminDetail?.tradeRole === 'MEMBER' ? adminDetail.addedBy : userId;
  }

  async getSuperAdminORSubAdminId(userId: number): Promise<number | null> {
    if (!userId) return null; // Handle case where userId is undefined

    const adminDetail = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, tradeRole: true, addedBy: true },
    });

    return adminDetail?.tradeRole === 'ADMINMEMBER' ? adminDetail.addedBy : userId;
  }

  /**
   * Paymob
   */
  async getAuthToken() {
    try {
      const response = await axios.post(`${PAYMOB_OMAN_API_URL}/auth/tokens`, {
        username: process.env.PAYMOB_USERNAME, // Your Paymob account username
        password: process.env.PAYMOB_PASSWORD, // Your Paymob account password
      });
  
      console.log("Auth Token:", response.data.token);
      console.log("Merchant ID:", response.data.profile.id);
  
      return response.data.token;
    } catch (error) {
      console.error("Error getting auth token:", error.response?.data || error.message);
      throw new Error("Failed to get authentication token");
    }
  }

}
