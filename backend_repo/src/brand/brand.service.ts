import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class BrandService {

  async create(payload: any, req: any) { // This function is used by route: /addBrandByUser(USER), /addBrand(ADMIN)
    try {
      const userId = req.user.id;
      let userDetail = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, userType: true }
      });
      let addBrand = await prisma.brand.create({
        data: {
          brandName: payload.brandName,
          brandType: userDetail.userType,
          addedBy: userId
        }
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: addBrand
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in create',
        error: error.message
      }
    }
  }

  async update(payload: any, req: any) {
    try {
      let addBrand = await prisma.brand.update({
        where: { id: payload.brandId },
        data: {
          brandName: payload.brandName
        }
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: addBrand
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in create',
        error: error.message
      }
    }
  }

  async findAll(term: any, addedBy: any, type: any) {
    try {
      let searchTerm = term?.length > 2 ? term : ''
      const addedBY = parseInt(addedBy);

      let brandList;
      if (type == 'OWNBRAND') {
        brandList = await prisma.brand.findMany({
          where: { 
            status: 'ACTIVE',
            brandName: {
              contains: searchTerm,
              mode: 'insensitive'
            },
            addedBy: addedBY
          }
        });
      } else if (type == 'BRAND'){
        brandList = await prisma.brand.findMany({
          where: { 
            status: 'ACTIVE',
            brandName: {
              contains: searchTerm,
              mode: 'insensitive'
            },
            brandType: 'ADMIN'
            // addedBy: {
            //   notIn: [addedBY] // Exclude brands with addedBy matching addedBY
            // }
          }
        });
      } else {
        brandList = await prisma.brand.findMany({
          where: { 
            status: 'ACTIVE',
            brandName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        });
      }
      
      if (!brandList) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0
        }
      }
      return {
        status: true,
        message: 'Fetch Successfully',
        data: brandList,
        totalCount: brandList.length
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in brandList',
        error: error.message
      }
    }
  }

  async findAllWithPagination(page: any, limit: any, term: any) {
    try {
      const Page = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : ''

      let brandList = await prisma.brand.findMany({
        where: { 
          status: 'ACTIVE',
          brandName: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        skip, // Offset
        take: pageSize, // Limit
      });

      let brandListCount = await prisma.brand.count({ where: { status: 'ACTIVE', brandName: {
        contains: searchTerm,
        mode: 'insensitive'
      } } });

      if (!brandList) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0
        }
      }
      return {
        status: true,
        message: 'Fetch Successfully',
        data: brandList,
        totalCount: brandListCount
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in brandList',
        error: error.message
      }
    }
  }

  async findOne(brandId: any, req: any) {
    try {
      const brandID = parseInt(brandId);
      let brandDetail = await prisma.brand.findUnique({
        where: { id: brandID }
      });
      if (!brandDetail) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }
      return {
        status: true,
        message: 'Fetch Successfully',
        data: brandDetail
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in findOne',
        error: error.message
      }
    }
  }

  async delete(brandId: any, req: any) {
    try {
      const brandID = parseInt(brandId);
      let deletedBrand = await prisma.brand.update({
        where: { id: brandID },
        data: {
          status: 'DELETE',
          deletedAt: new Date()
        }
      });

      return {
        status: true,
        message: 'Deleted Successfully',
        data: []
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in delete',
        error: error.message
      }
    }
  }
}
