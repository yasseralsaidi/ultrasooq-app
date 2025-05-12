import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class PolicyService {

  async createPolicy(payload: any) {
    try {

      // {
      //   "ruleName": "GST DEPERTMENT",
      //   "rule": "[{\"children\":[{\"text\":\"Tax depertment\"}],\"type\":\"p\",\"id\":\"k8wlu\"}]",
      //   "categoryName": "Tax depertment"
      // }


      // {
      //     "ruleName": "VAT DEPERTMENT",
      //     "rule": "[{\"children\":[{\"text\":\"Tax department\"}],\"type\":\"p\",\"id\":\"k8wlu\"}]",
      //     "parentId": 50
      // }
      if (payload.categoryName) {
        let createPolicy = await prisma.policy.create({
          data: {
            rule: payload.rule,
            categoryName: payload.categoryName,
          }
        });
        let createsub = await prisma.policy.create({
          data: {
            rule: payload.rule,
            categoryName: payload.ruleName,
            parentId: createPolicy.id
          }
        })
      }
      if (payload.parentId){
        let createsub = await prisma.policy.create({
          data: {
            rule: payload.rule,
            categoryName: payload.ruleName,
            parentId: payload.parentId
          }
        })
      }

      return {
        status: true,
        message: 'Created Successfully',
        data: []
      }
    } catch (error) {
      return {
        status: false,
        message: 'error, in createPolicy',
        error: error.message
      }
    }
  }

  async getAllPolicy(req: any, page: any, limit: any, sort: any, searchTerm: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10000000;
      const skip = (Page - 1) * pageSize;
      const sortType = 'desc';
      let searchTERM = searchTerm?.length > 2 ? searchTerm : ''

      let getAllPolicy = await prisma.policy.findMany({
        where: {
          status: 'ACTIVE',
          categoryName: {
            contains: searchTERM,
            mode: 'insensitive'
          },
          parentId: null
          // OR: [
          //   { parentId: null }, // Root policies
          // ]
        },
        include: {
          children: {
            where: {
              status: "ACTIVE"
            }
          }
        },
        orderBy: { createdAt: sortType },
        skip, // Offset
        take: pageSize, // Limit
      });

      if (!getAllPolicy) {
        return { 
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
          page: 0,
          limit: 0
        }
      }

      let getAllCountryCount = await prisma.policy.count({
        where: {
          status: 'ACTIVE',
          categoryName: {
            contains: searchTERM,
            mode: 'insensitive'
          },
          parentId: null
        }
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: getAllPolicy,
        totalCount: getAllCountryCount
      }
    } catch (error) {
      return {
        status: false,
        message: 'error, in getAllPolicy',
        error: error.message
      }
    }
  }

  async getAllMainPolicy() {
    try {
      let getAllMainPolicy = await prisma.policy.findMany({
        where: {
          status: 'ACTIVE',
          parentId: null
        },
      });

      if (!getAllMainPolicy) {
        return { 
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
          page: 0,
          limit: 0
        }
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllMainPolicy,
        totalCount: getAllMainPolicy.length
      }
    } catch (error) {
      return {
        status: false,
        message: 'error, in getAllMainPolicy',
        error: error.message
      }
    }
  }

  async updatePolicy(payload: any) {
    try {
      let updatePolicy = await prisma.policy.update({
        where: {
          id: payload.policyId
        },
        data: {
          ruleName: payload.ruleName,
          rule: payload.rule,
          categoryName: payload.categoryName,
        }
      });

      return {
        status: true,
        message: 'Updated Successfully',
        data: updatePolicy
      }
    } catch (error) {
      return {
        status: false,
        message: 'Error in updatePolicy',
        error: error.message
      }
    }
  }

  async getOnePolicy(policyId: any) {
    try {
      let policyID = parseInt(policyId)

      let getPolicy = await prisma.policy.findUnique({
        where: {
          id: policyID
        },
        include: {
          children: {
            where: {
              status: "ACTIVE"
            }
          }
        },
      });

      if (!getPolicy) {
        return {
          status: false,
          message: 'Policy Not Found'
        }
      }

      return {
        status: true,
        message: 'Policy Found',
        data: getPolicy
      }
    } catch (error) {
      return {
        status: false,
        message: 'Error in getOnePolicy',
        error: error.message
      }
    }
  }

  async deletePolicy(policyId: any) {
    try {
      // Parse policyId as an integer
      const policyID = parseInt(policyId);

      // Check if the policy exists
      const policy = await prisma.policy.findUnique({
        where: { id: policyID },
      });

      if (!policy) {
        return {
          status: false,
          message: 'Policy not found',
        };
      }

      // Update the policy to mark it as deleted by setting deletedAt to current date
      await prisma.policy.update({
        where: { id: policyID },
        data: { 
          deletedAt: new Date(),
          status: "DELETE"
        },
      });

      return {
        status: true,
        message: 'Deleted Successfully',
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error in deletePolicy',
        error: error.message,
      };
    }
  }
}
