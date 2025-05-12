import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, Product } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class WishlistService {
  // wishList
  async addWishList(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      const productId = payload?.productId;

      let existWishlist = await prisma.wishlist.findFirst({
        where: {
          userId: userId,
          productId: productId,
        }
      });

      if (existWishlist) {
        return {
          status: false,
          message: 'Already Added In Wishlist',
          data: existWishlist
        }
      }

      let addWishList = await prisma.wishlist.create({
        data: {
          userId: userId,
          productId: productId,
        }
      });

      let productExistInCart = await prisma.cart.findFirst({
        where: {
          userId: userId,
          productId: productId,
        }
      })

      if (productExistInCart) {
        let deleteCart = await prisma.cart.delete({
          where: { id: productExistInCart.id }
        })
      }

      return {
        status: true,
        messsage: 'Created Successfully',
        data: addWishList
      }

    } catch (error) {
      return {
        status: false,
        message: "error, in addWishList",
        error: error.message
      }
    }
  }

  async getAllWishListByUser(page: any, limit: any, req: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      const userId = req?.user?.id;

      let getAllWishListByUser = await prisma.wishlist.findMany({
        where: {
          status: 'ACTIVE',
          userId: userId
        },
        include: {
          wishlist_productDetail: {
            include: {
              productImages: true,
              productReview: { 
                where: { status: 'ACTIVE' },
                select: {
                  rating: true
                }
              },
              product_productPrice: {
                where: { status: 'ACTIVE'},
                include: {
                  adminDetail:{
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
                  }
                },
                orderBy: {
                  offerPrice: 'asc'
                },
                take: 1 // Limit the result to only 1 row
              },
              product_productShortDescription: { where: { status: 'ACTIVE' } },
            }
          }
        },
        skip,
        take: pageSize
      });

      let getAllWishListByUserCount = await prisma.wishlist.count({
        where: {
          status: 'ACTIVE',
          userId: userId
        }
      });

      if (!getAllWishListByUser) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllWishListByUser,
        totalCount: getAllWishListByUserCount
      }

    } catch (error) {
      return {
        status: false,
        message: "error, in getAllWishListByUser",
        error: error.message
      }
    }
  }

  async deleteWishList(productId: any, req: any) {
    try {
      const userId = req?.user?.id;
      const productID = parseInt(productId);

      let existWishList = await prisma.wishlist.findFirst({
        where: { 
          userId: userId,
          productId: productID
        } 
      });

      if (!existWishList) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      let deleteWishList = await prisma.wishlist.delete({
        where: { id: existWishList.id } 
      });

      return {
        status: true,
        message: "Deleted Successfully",
        data: []
      }

    } catch (error) {
      return {
        status: false,
        message: "error, in deleteWishList",
        error: error.message
      }
    }
  }

  async wishlistCount(req: any) {
    try {
      const userId = req?.user?.id;

      let getAllWishListByUserCount = await prisma.wishlist.count({
        where: {
          status: 'ACTIVE',
          userId: userId
        }
      });

      // if (!getAllWishListByUserCount) {
      //   return {
      //     status: false,
      //     message: 'Not Found',
      //     data: 0
      //   }
      // }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllWishListByUserCount,
      }


    } catch (error) {
      return {
        status: false,
        message: "error, in wishlistCount",
        error: error.message
      }
    }
  }
  
}
