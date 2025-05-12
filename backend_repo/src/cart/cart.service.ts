import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { AddCartServiceDto, AddCartServiceProdDto } from './dto/cart.dto';
import { features } from 'process';
const prisma = new PrismaClient();

@Injectable()
export class CartService {
  // using this func with login API & withOut Login API
  async update(payload: any, req: any) {
    try {
      // const product = await prisma.product.findUnique({
      //   where: { id: payload?.productId }
      // });
      const productPrice = await prisma.productPrice.findUnique({
        where: { id: payload?.productPriceId },
      });

      // let where = {};
      let where: Prisma.CartWhereInput = {}; // Define the type explicitly

      if (req?.user?.id) {
        where.OR = [{ userId: req.user.id }];
      } else {
        where.OR = [{ deviceId: payload.deviceId }];
      }

      const existingCart = await prisma.cart.findFirst({
        where: {
          AND: [
            where,
            { productId: productPrice?.productId },
            { productPriceId: productPrice.id },
            { deletedAt: null },
          ],
        },
      });

      if (existingCart) {
        if (payload?.quantity == -1) {
          existingCart.quantity = existingCart.quantity + 1;
          await prisma.cart.update({
            where: { id: existingCart.id },
            data: {
              quantity: existingCart.quantity,
              sharedLinkId: payload?.sharedLinkId,
              object: payload?.productVariant,
            },
          });
        } else {
          console.log('OLD PRODUCT UPDATE IN CART---');
          // existingCart.quantity = existingCart.quantity + payload?.quantity
          if (payload?.quantity > 0) {
            await prisma.cart.update({
              where: { id: existingCart.id },
              data: {
                quantity: payload?.quantity,
                // quantity: existingCart.
                sharedLinkId: payload?.sharedLinkId,
                object: payload?.productVariant,
              },
            });
          } else {
            await prisma.cart.delete({
              where: { id: existingCart.id },
            });
          }
        }

        return {
          status: true,
          message: 'Existing Cart Updated',
          data: [],
        };
      } else {
        // new product
        console.log('NEW PRODUCT IN CART---');
        let cartDetail = await prisma.cart.create({
          data: {
            userId: req?.user?.id || undefined,
            deviceId: payload?.deviceId || undefined,
            productId: productPrice?.productId,
            productPriceId: productPrice.id,
            quantity: payload?.quantity === -1 ? 1 : payload?.quantity || 1,
            sharedLinkId: payload?.sharedLinkId,
            object: payload?.productVariant,
          },
        });

        return {
          status: true,
          message: 'Cart Created Successfully',
          data: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in update',
        error: error.message,
      };
    }
  }

  // Add/Update Service with product
  async updateCartServiceWithProduct(payload: any, req: any) {
    try {
      const userId = req.user.id;
      const { serviceId, features } = payload;
      const existInCart = await prisma.cart.findFirst({
        where: {
          serviceId,
          userId,
          cartProductServices: {
            none: {},
          },
        },
      });
      if (!existInCart) {
        const cart = await prisma.cart.create({
          data: {
            userId,
            serviceId,
            cartType: 'SERVICE',
            quantity: 1,
            cartServiceFeatures: {
              createMany: {
                data: features,
              },
            },
          },
        });

        let cartProductService = await prisma.cartProductService.create({
          data: {
            cartId: payload.cartId,
            productId: payload.productId,
            serviceId: payload.serviceId,
            relatedCartId: cart.id,
            cartType: payload.cartType || 'PRODUCT',
            relatedCartType: payload.relatedCartType || 'SERVICE'
          }
        });

        return {
          success: true,
          message: 'service added to cart',
          data: cart,
          cartProductService: cartProductService,
        };
      } else {
        const response = await Promise.all(
          features.map(async (feature) => {
            const existingCartFeature =
              await prisma.cartServiceFeature.findFirst({
                where: {
                  cartId: existInCart.id,
                  serviceFeatureId: feature.serviceFeatureId,
                },
              });

            if (!existingCartFeature) {
              return await prisma.cartServiceFeature.create({
                data: {
                  cartId: existInCart.id,
                  ...feature,
                },
              });
            } else {
              return await prisma.cartServiceFeature.update({
                where: {
                  id: existingCartFeature.id,
                },
                data: {
                  quantity: feature.quantity,
                },
              });
            }
          }),
        );
        return {
          success: true,
          message: 'service added to cart',
          data: response,
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in update service cart',
        error: error.message,
      };
    }
  }

  // this api is used only in product detail page
  async addToCart(payload: any, req: any) {
    try {
      const productPrice = await prisma.productPrice.findUnique({
        where: { id: payload?.productPriceId },
      });

      let where: Prisma.CartWhereInput = {};

      if (req?.user?.id) {
        where.OR = [{ userId: req.user.id }];
      } else {
        where.OR = [{ deviceId: payload.deviceId }];
      }

      const existingCart = await prisma.cart.findFirst({
        where: {
          AND: [
            where,
            { productId: productPrice?.productId },
            { productPriceId: productPrice.id },
            { deletedAt: null },
          ],
        },
      });

      if (existingCart) {
        if (payload?.quantity == -1) {
          existingCart.quantity = existingCart.quantity + 1;
          await prisma.cart.update({
            where: { id: existingCart.id },
            data: {
              quantity: existingCart.quantity,
            },
          });
        } else {
          console.log('OLD PRODUCT UPDATE IN CART---');
          existingCart.quantity = existingCart.quantity + payload?.quantity;
          if (payload?.quantity > 0) {
            await prisma.cart.update({
              where: { id: existingCart.id },
              data: {
                // quantity: payload?.quantity
                quantity: existingCart.quantity,
              },
            });
          } else {
            await prisma.cart.delete({
              where: { id: existingCart.id },
            });
          }
        }

        return {
          status: true,
          message: 'Existing Cart Updated',
          data: [],
        };
      } else {
        // new product
        console.log('NEW PRODUCT IN CART---');
        let cartDetail = await prisma.cart.create({
          data: {
            userId: req?.user?.id || undefined,
            deviceId: payload?.deviceId || undefined,
            productId: productPrice?.productId,
            productPriceId: productPrice.id,
            quantity: payload?.quantity === -1 ? 1 : payload?.quantity || 1,
          },
        });

        return {
          status: true,
          message: 'Cart Created Successfully',
          data: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in update',
        error: error.message,
      };
    }
  }

  // using this func with login API & withOut Login API
  async list(page: any, limit: any, req: any, deviceId: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset

      let where: Prisma.CartWhereInput = { deletedAt: null };

      if (req?.user?.id) {
        where = { ...where, userId: req?.user?.id };
      } else {
        where = { ...where, deviceId: deviceId };
      }

      let cartResponse = await prisma.cart.findMany({
        where,
        include: {
          productPriceDetails: {
            include: {
              productPrice_product: {
                include: {
                  productImages: true,
                },
              },
            },
          },
          cartProductServices: true,
          cartServiceFeatures: {
            include: {
              serviceFeature: true,
            },
          },
          service: true
        },
        orderBy: { id: 'asc' },
        skip, // Offset
        take: pageSize, // Limit
      });

      let cartResponseCount = await prisma.cart.count({
        where,
      });

      if (!cartResponse) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
        };
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: cartResponse,
        totalCount: cartResponseCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in list',
        error: error.message,
      };
    }
  }

  async updateUserIdBydeviceId(payload: any, req: any) {
    let userId, deviceId, returnValue;
    try {
      if (req?.user?.id && payload?.deviceId) {
        userId = req.user.id;
        deviceId = payload?.deviceId;
        returnValue = await prisma.cart.updateMany({
          where: {
            deviceId,
          },
          data: {
            userId,
            deviceId: null,
          },
        });
      }

      // finding duplicateCartItem
      interface DuplicateCartItem {
        userId: number;
        // productId: number;
        productPriceId: number;
      }

      const duplicateCartItemsQueryResult: DuplicateCartItem[] =
        await prisma.$queryRaw`
        SELECT "userId", "productPriceId"
        FROM "Cart"
        WHERE "userId" = ${userId}
        GROUP BY "userId", "productPriceId"
        HAVING COUNT("productPriceId") > 1;
      `;

      const duplicateProductIds = duplicateCartItemsQueryResult.map(
        (item) => item.productPriceId,
      );

      const duplicateCartItems = await prisma.cart.findMany({
        where: {
          userId: userId,
          productPriceId: {
            in: duplicateProductIds,
          },
        },
      });
      // end of duplicateCartItem

      // const groupedItems: { [productId: number]: { id: number; quantity: number } } = {};
      const groupedItems: {
        [productPriceId: number]: { id: number; quantity: number };
      } = {};
      const promiseArr: Promise<any>[] = [];

      for (const item of duplicateCartItems) {
        const productPriceId = item.productPriceId;
        if (!groupedItems[productPriceId]) {
          groupedItems[productPriceId] = {
            id: item.id,
            quantity: item.quantity,
          };
        } else {
          groupedItems[productPriceId].quantity += item.quantity;
          promiseArr.push(prisma.cart.delete({ where: { id: item.id } }));
        }
      }

      for (const productPriceId in groupedItems) {
        const item = groupedItems[productPriceId];
        promiseArr.push(
          prisma.cart.update({
            where: { id: item.id },
            data: { quantity: item.quantity },
          }),
        );
      }

      await Promise.all(promiseArr);

      return {
        success: true,
        message: 'Cart items updated successfully',
        data: [],
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error in updateUserIdBydeviceId',
        error: error.message,
      };
    }
  }

  // Not in use
  // only delete product
  async delete(cartId: any) {
    try {
      const cartID = parseInt(cartId);

      let existCart = await prisma.cart.findUnique({
        where: { id: cartID },
      });

      if (!existCart) {
        return {
          status: false,
          message: 'Not Found',
          data: {},
        };
      }

      let deleteCartProductService = await prisma.cartProductService.deleteMany(
        {
          where: { cartId: cartID },
        },
      );

      let deletedCart = await prisma.cart.delete({
        where: { id: cartID },
      });

      return {
        status: true,
        message: 'Deleted Successfully',
        data: {},
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in delete cart',
        error: error.message,
      };
    }
  }

  // delete product & services under it
  async deleteProduct(cartId: any) {
    try {
      const cartID = parseInt(cartId);
  
      const existCart = await prisma.cart.findUnique({
        where: { id: cartID },
      });
  
      if (!existCart) {
        return {
          status: false,
          message: 'Cart not found',
          data: {},
        };
      }
  
      // Step 1: Get all services under this product
      const relatedServices = await prisma.cartProductService.findMany({
        where: { cartId: cartID },
      });
  
      const relatedServiceCartIds = relatedServices.map(rel => rel.relatedCartId).filter(Boolean);
  
      // Step 2: Delete related service features
      if (relatedServiceCartIds.length > 0) {
        await prisma.cartServiceFeature.deleteMany({
          where: {
            cartId: {
              in: relatedServiceCartIds,
            },
          },
        });
      }
  
      // Step 3: Delete related cartProductService entries
      await prisma.cartProductService.deleteMany({
        where: { cartId: cartID }
        // where: {
        //   OR: [
        //     { cartId: cartID },
        //     { relatedCartId: cartID },
        //   ],
        // },
      });
  
      // Step 4: Delete the related service carts
      if (relatedServiceCartIds.length > 0) {
        await prisma.cart.deleteMany({
          where: {
            id: {
              in: relatedServiceCartIds,
            },
          },
        });
      }
  
      // Step 5: Delete the main cart (product)
      await prisma.cart.delete({
        where: { id: cartID },
      });
  
      return {
        status: true,
        message: 'Deleted product and its related services successfully',
        data: {},
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error deleting cart',
        error: error.message,
      };
    }
  }
  
  

  async cartCount(payload: any, req: any) {
    try {
      const deviceId = payload?.deviceId;
      let where: Prisma.CartWhereInput = { deletedAt: null };

      if (req?.user?.id) {
        where = { ...where, userId: req?.user?.id };
      } else {
        where = { ...where, deviceId: deviceId };
      }

      let cartResponseCount = await prisma.cart.count({
        where,
      });

      if (!cartResponseCount) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
        };
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: cartResponseCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in cartCount',
        error: error.message,
      };
    }
  }

  async deleteAllCartItemByUserId(payload: any, req: any) {
    try {
      const userId = payload?.userId;

      let existAllCartItem = await prisma.cart.findMany({
        where: { userId: userId },
      });

      if (!existAllCartItem) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      let deleteAllCartItem = await prisma.cart.deleteMany({
        where: { userId: userId },
      });

      return {
        status: true,
        message: 'All Deleted Successfully',
        data: [],
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in deleteAllCartItemByUserId',
        error: error.message,
      };
    }
  }

  // ----- ***** RFQ CART BEGINS ***** -----

  async updateRfqCart(payload: any, req: any) {
    try {
      const productId = payload?.productId;
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      let where: Prisma.RFQCartWhereInput = {};
      if (req?.user?.id) {
        where.OR = [{ userId: req.user.id }];
      } else {
        where.OR = [{ deviceId: payload.deviceId }];
      }

      const existingCart = await prisma.rFQCart.findFirst({
        where: {
          AND: [where, { productId: product.id }, { deletedAt: null }],
        },
      });

      if (existingCart) {
        console.log('OLD PRODUCT UPDATE IN CART---');
        if (payload?.quantity > 0) {
          await prisma.rFQCart.update({
            where: { id: existingCart.id },
            data: {
              quantity: payload?.quantity || existingCart?.quantity,
              offerPrice: payload?.offerPrice || existingCart?.offerPrice,
              note: payload?.note || existingCart?.note,
              offerPriceFrom:
                payload?.offerPriceFrom || existingCart?.offerPriceFrom,
              offerPriceTo: payload?.offerPriceTo || existingCart?.offerPriceTo,
            },
          });
        } else {
          await prisma.rFQCart.delete({
            where: { id: existingCart.id },
          });
        }

        return {
          status: true,
          message: 'Existing Cart Updated',
          data: [],
        };
      } else {
        // new product
        console.log('NEW PRODUCT IN CART---');
        let rfqCartDetail = await prisma.rFQCart.create({
          data: {
            userId: req?.user?.id || undefined,
            deviceId: payload?.deviceId || undefined,
            productId: product?.id,
            quantity: payload?.quantity,
            offerPrice: payload?.offerPrice,
            note: payload?.note,
            offerPriceFrom: payload?.offerPriceFrom,
            offerPriceTo: payload?.offerPriceTo,
          },
        });

        return {
          status: true,
          message: 'Cart Created Successfully',
          data: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in updateRfqCart',
        error: error.message,
      };
    }
  }

  async rfqCartlist(page: any, limit: any, req: any, deviceId: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset

      let where: Prisma.RFQCartWhereInput = {};
      if (req?.user?.id) {
        where = { ...where, userId: req?.user?.id };
      } else {
        where = { ...where, deviceId: deviceId };
      }

      let rfqCartResponse = await prisma.rFQCart.findMany({
        where,
        // include: {
        //   rfqProductDetails: {
        //     include: {
        //       rfqProductImage: true
        //     }
        //   }
        // },
        include: {
          rfqCart_productDetails: {
            include: {
              productImages: true,
            },
          },
        },
        orderBy: { id: 'asc' },
        skip, // Offset
        take: pageSize, // Limit
      });

      let rfqCartResponseCount = await prisma.rFQCart.count({
        where,
      });

      if (!rfqCartResponse) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
        };
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: rfqCartResponse,
        totalCount: rfqCartResponseCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in rfqCartlist',
        error: error.message,
      };
    }
  }

  async rfqCartDelete(rfqCartId: any) {
    try {
      const rfqCartID = parseInt(rfqCartId);

      let existCart = await prisma.rFQCart.findUnique({
        where: { id: rfqCartID },
      });

      if (!existCart) {
        return {
          status: false,
          message: 'Not Found',
          data: {},
        };
      }

      let deletedCart = await prisma.rFQCart.delete({
        where: { id: rfqCartID },
      });

      return {
        status: true,
        message: 'Deleted Successfully',
        data: {},
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in rfqCartDelete',
        error: error.message,
      };
    }
  }

  // Still Now NOT USED!
  async updateRfqCartUserIdBydeviceId(payload: any, req: any) {
    let userId, deviceId, returnValue;
    try {
      if (req?.user?.id && payload?.deviceId) {
        userId = req.user.id;
        deviceId = payload.deviceId;
        returnValue = await prisma.rFQCart.updateMany({
          where: {
            deviceId,
          },
          data: {
            userId,
            deviceId: null,
          },
        });
      }

      // finding duplicateCartItem
      interface DuplicateRfqCartItem {
        userId: number;
        productId: number;
      }

      const duplicateRfqCartItemsQueryResult: DuplicateRfqCartItem[] =
        await prisma.$queryRaw`
        SELECT "userId", "productId"
        FROM "RFQCart"
        WHERE "userId" = ${userId}
        GROUP BY "userId", "productId"
        HAVING COUNT("productId") > 1;
      `;

      const duplicateRfqProductIds = duplicateRfqCartItemsQueryResult.map(
        (item) => item.productId,
      );

      const duplicateRfqCartItems = await prisma.rFQCart.findMany({
        where: {
          userId: userId,
          productId: {
            in: duplicateRfqProductIds,
          },
        },
      });

      const groupedItems: {
        [productId: number]: { id: number; quantity: number };
      } = {};
      const promiseArr: Promise<any>[] = [];

      for (const item of duplicateRfqCartItems) {
        const productId = item.productId;
        if (!groupedItems[productId]) {
          groupedItems[productId] = { id: item.id, quantity: item.quantity };
        } else {
          groupedItems[productId].quantity += item.quantity;
          promiseArr.push(prisma.rFQCart.delete({ where: { id: item.id } }));
        }
      }

      for (const productId in groupedItems) {
        const item = groupedItems[productId];
        promiseArr.push(
          prisma.rFQCart.update({
            where: { id: item.id },
            data: { quantity: item.quantity },
          }),
        );
      }

      await Promise.all(promiseArr);

      return {
        success: true,
        message: 'Cart items updated successfully',
        data: [],
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in updateRfqCartUserIdBydeviceId',
        error: error.message,
      };
    }
  }

  async deleteAllRfqCartItemByUserId(payload: any, req: any) {
    try {
    } catch (error) {}
  }

  // ----- ***** RFQ CART ENDS ***** -----

  // ----------------------------------------------- Factories Cart ---------------------------------------------------
  async addUpdateFactoriesCart(payload: any, req: any) {
    try {
      const { productId, customizeProductId, quantity, deviceId } = payload;
      const userId = req?.user?.id;

      if (!productId && !customizeProductId) {
        return {
          status: false,
          message: 'Either productId or customizeProductId is required',
        };
      }

      // Prepare dynamic where condition based on user/device
      let where: Prisma.FactoriesCartWhereInput = {};
      if (userId) {
        where.OR = [{ userId }];
      } else if (deviceId) {
        where.OR = [{ deviceId }];
      }

      // Check if cart item exists
      const existingCart = await prisma.factoriesCart.findFirst({
        where: {
          AND: [
            where,
            { deletedAt: null },
            { productId },
            { customizeProductId },
          ],
        },
      });

      if (existingCart) {
        console.log('UPDATING EXISTING FACTORIES CART ITEM---');

        if (quantity > 0) {
          // Update existing cart item
          await prisma.factoriesCart.update({
            where: { id: existingCart.id },
            data: { quantity },
          });

          return {
            status: true,
            message: 'Factories Cart Updated Successfully',
            data: [],
          };
        } else {
          // Remove item if quantity is 0 or not provided
          await prisma.factoriesCart.delete({ where: { id: existingCart.id } });

          return {
            status: true,
            message: 'Factories Cart Item Removed',
            data: [],
          };
        }
      } else {
        // Create new cart item
        console.log('ADDING NEW ITEM TO FACTORIES CART---');
        const newCart = await prisma.factoriesCart.create({
          data: {
            userId: userId || undefined,
            deviceId: deviceId || undefined,
            productId: productId || undefined,
            customizeProductId: customizeProductId || undefined,
            quantity: quantity > 0 ? quantity : 1, // Default to 1 if not provided
          },
        });

        return {
          status: true,
          message: 'Factories Cart Created Successfully',
          data: newCart,
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'Error in addUpdateFactoriesCart API',
        error: error.message,
      };
    }
  }

  async getAllFactoriesCart(page: any, limit: any, req: any, deviceId: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset

      let where: Prisma.FactoriesCartWhereInput = { deletedAt: null };

      if (req?.user?.id) {
        where = { ...where, userId: req?.user?.id };
      } else {
        where = { ...where, deviceId: deviceId };
      }

      let cartResponse = await prisma.factoriesCart.findMany({
        where: where,
        include: {
          customizeProductDetail: {
            where: { status: 'ACTIVE' },
            include: {
              customizeProductImageDetail: {
                where: { status: 'ACTIVE' },
              },
            },
          },
          productDetails: {
            where: { status: 'ACTIVE' },
            include: {
              productImages: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
        orderBy: { id: 'asc' },
        skip, // Offset
        take: pageSize, // Limit
      });

      let cartResponseCount = await prisma.factoriesCart.count({
        where,
      });

      if (!cartResponse) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
        };
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: cartResponse,
        totalCount: cartResponseCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in getAllFactoriesCart',
        error: error.message,
      };
    }
  }

  async deleteFactoriesCart(factoriesCartId: any) {
    try {
      if (!factoriesCartId) {
        return {
          status: false,
          message: 'factoriesCartId is required',
        };
      }
      const factoriesCartID = parseInt(factoriesCartId);

      let existFactoriesCart = await prisma.factoriesCart.findUnique({
        where: { id: factoriesCartID },
      });

      if (!existFactoriesCart) {
        return {
          status: false,
          message: 'Not Found',
          data: {},
        };
      }

      const customizeProductId = existFactoriesCart.customizeProductId;

      let deleteCustomizeProductImages =
        await prisma.customizeProductImage.deleteMany({
          where: {
            customizeProductId: customizeProductId,
          },
        });

      let deleteCustomizeProduct = await prisma.customizeProduct.delete({
        where: {
          id: customizeProductId,
        },
      });

      let deletedFactoriesCart = await prisma.factoriesCart.delete({
        where: { id: factoriesCartID },
      });

      return {
        status: true,
        message: 'Deleted Successfully',
        data: {},
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in deleteFactoriesCart',
        error: error.message,
      };
    }
  }
  async updateCartService(dto: AddCartServiceDto, userId: number) {
    try {
      const { serviceId, features } = dto;
      const existInCart = await prisma.cart.findFirst({
        where: {
          serviceId,
          userId,
          cartProductServices: {
            none: {},
          },
        },
      });
      if (!existInCart) {
        const cart = await prisma.cart.create({
          data: {
            userId,
            serviceId,
            cartType: 'SERVICE',
            quantity: 1,
            cartServiceFeatures: {
              createMany: {
                data: features,
              },
            },
          },
        });
        return {
          success: true,
          message: 'service added to cart',
          data: cart,
        };
      } else {
        const response = await Promise.all(
          features.map(async (feature) => {
            const existingCartFeature =
              await prisma.cartServiceFeature.findFirst({
                where: {
                  cartId: existInCart.id,
                  serviceFeatureId: feature.serviceFeatureId,
                },
              });

            if (!existingCartFeature) {
              return await prisma.cartServiceFeature.create({
                data: {
                  cartId: existInCart.id,
                  ...feature,
                },
              });
            } else {
              return await prisma.cartServiceFeature.update({
                where: {
                  id: existingCartFeature.id,
                },
                data: {
                  quantity: feature.quantity,
                },
              });
            }
          }),
        );
        return {
          success: true,
          message: 'service added to cart',
          data: response,
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in update service cart',
        error: error.message,
      };
    }
  }

  async updateServiceProduct(dto: AddCartServiceProdDto, userId: number) {
    try {
      const {
        cartId,
        serviceId,
        productPriceId,
        productId,
        object,
        cartType,
        relatedCartType,
        quantity,
      } = dto;

      const response = await prisma.$transaction(async (tx) => {
        const cart = await tx.cart.create({
          data: {
            userId,
            productId,
            productPriceId,
            cartType: 'DEFAULT',
            quantity,
            object,
          },
        });

        await tx.cartProductService.create({
          data: {
            productId,
            cartId,
            cartType,
            relatedCartId: cart.id,
            relatedCartType,
            serviceId,
          },
        });
        return cart;
      });

      return {
        success: true,
        message: 'product related to service added to cart',
        data: response,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in update product related to service cart',
        error: error.message,
      };
    }
  }

  async deleteCartService(
    cartId: number,
    userId: number,
    serviceFeatureIds: number[],
    serviceProdIds: number[],
  ) {
    try {
      const cart = await prisma.cart.findUniqueOrThrow({
        where: {
          id: cartId,
          userId,
        },
        include: {
          cartServiceFeatures: true,
          cartProductServices: true,
        },
      });
      if (serviceFeatureIds.length || serviceProdIds.length) {
        const deletedFeatures = await prisma.cartServiceFeature.deleteMany({
          where: {
            id: { in: serviceFeatureIds },
            cartId,
          },
        });

        const deletedProdCartIds: number[] = [];
        cart.cartProductServices.forEach((prod) => {
          if (prod.relatedCartId) {
            deletedProdCartIds.push(prod.relatedCartId);
          }
        });
        const deletedProds = await prisma.$transaction([
          prisma.cart.deleteMany({
            where: {
              id: { in: deletedProdCartIds },
            },
          }),
          prisma.cartProductService.deleteMany({
            where: {
              id: { in: serviceProdIds },
            },
          }),
        ]);
        return {
          status: false,
          message: 'service features & products deleted from cart',
          data: {
            features: deletedFeatures,
            products: deletedProds,
          },
        };
      }
      const cartServiceFeatureIds = cart.cartServiceFeatures.map(
        (serviceFeature) => serviceFeature.id,
      );

      const deletedProdCartIds: number[] = [];
      cart.cartProductServices.forEach((prod) => {
        if (prod.relatedCartId) {
          deletedProdCartIds.push(prod.relatedCartId);
        }
      });

      const cartServiceProdIds = cart.cartProductServices.map((serviceProd) => serviceProd.id)

      const deletedCart = await prisma.$transaction([
        prisma.cartServiceFeature.deleteMany({
          where: {
            id: { in: cartServiceFeatureIds },
          },
        }),
        prisma.cartProductService.deleteMany({
          where: {id: {in: cartServiceProdIds}}
        }),
        prisma.cart.deleteMany({
          where: {
            id: {in: deletedProdCartIds}
          }
        }),
        prisma.cart.delete({ where: { id: cartId } }),
      ]);
      return {
        status: false,
        message: 'service deleted from cart',
        data: deletedCart,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in delete service cart',
        error: error.message,
      };
    }
  }
}
