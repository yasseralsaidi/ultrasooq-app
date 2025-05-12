import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notification/notification.service';
import { S3service } from 'src/user/s3.service';
import { Prisma, PrismaClient, Product } from '@prisma/client';
import * as bwipjs from 'bwip-js';
import { UpdatedProductPriceDto } from './dto/update-productPrice.dto';
import { AddMultiplePriceForProductDTO } from './dto/addMultiple-productPrice.dto';
import { UpdateMultiplePriceForProductDTO } from './dto/updateMultiple-productPrice.dto';
import { HelperService } from 'src/helper/helper.service';

const prisma = new PrismaClient();

@Injectable()
export class ProductService {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly s3service: S3service,
    private readonly helperService: HelperService,
  ) {}

  async create(payload: any, req: any) {
    try {
      if (payload?.skuNo) {
        let existProduct = await prisma.product.findFirst({
          where: { skuNo: payload?.skuNo },
        });
        // console.log('existProduct: ', existProduct);

        if (existProduct) {
          return {
            status: false,
            message: 'This SKU No. Already Exist',
            data: [],
          };
        }
      }

      // const userId = req?.user?.id;
      let userId = req?.user?.id;
      userId = await this.helperService.getAdminId(userId);
      console.log('admin_id: ', userId);

      const adminId = payload?.adminId || undefined;

      let addProduct = await prisma.product.create({
        data: {
          productName: payload?.productName,
          productType: payload?.productType ? payload?.productType : 'P',
          categoryId: payload?.categoryId,
          typeOfProduct: payload?.typeOfProduct
            ? payload?.typeOfProduct
            : 'BRAND',
          brandId: payload?.brandId,
          placeOfOriginId: payload?.placeOfOriginId,
          skuNo: payload?.skuNo,
          productPrice: payload?.productPrice ? payload?.productPrice : 0,
          offerPrice: payload?.offerPrice ? payload?.offerPrice : 0,
          shortDescription: payload?.shortDescription,
          description: payload?.description,
          specification: payload?.specification,
          categoryLocation: payload?.categoryLocation,
          userId: userId,
          status: payload?.status || 'INACTIVE',
          adminId: userId,
        },
      });

      if (payload.productTagList && payload.productTagList.length > 0) {
        console.log('tag----1');

        for (let i = 0; i < payload.productTagList.length; i++) {
          console.log('tag----2');
          let addProductTags = await prisma.productTags.create({
            data: {
              productId: addProduct.id,
              tagId: payload.productTagList[i].tagId,
            },
          });
        }
      }

      if (payload.productImagesList && payload.productImagesList.length > 0) {
        console.log('images----1');

        for (let j = 0; j < payload.productImagesList.length; j++) {
          let addProductImages = await prisma.productImages.create({
            data: {
              productId: addProduct.id,
              imageName: payload?.productImagesList[j]?.imageName,
              image: payload?.productImagesList[j]?.image,
              videoName: payload?.productImagesList[j]?.videoName,
              video: payload?.productImagesList[j]?.video,
              variant: payload?.productImagesList[j]?.variant,
            },
          });
        }
      }

      if (payload?.productPriceList && payload?.productPriceList.length > 0) {
        for (let k = 0; k < payload.productPriceList.length; k++) {
          let menuId = 8; // Store
          if (payload?.productPriceList[k]?.isCustomProduct === 'true') {
            menuId = 10; // Factories
          } else if (
            payload?.productPriceList[k].sellType === 'BUYGROUP' &&
            payload?.productPriceList[k]?.isCustomProduct === 'false'
          ) {
            menuId = 9; // BuyGroup
          }

          let addProductPrice = await prisma.productPrice.create({
            data: {
              productId: addProduct.id,
              adminId: userId,
              status: payload.productPriceList[k].status || 'ACTIVE',
              productPrice: payload.productPriceList[k].productPrice || 0,
              offerPrice: payload.productPriceList[k].offerPrice || 0,
              stock: payload?.productPriceList[k].stock || undefined,
              deliveryAfter:
                payload?.productPriceList[k].deliveryAfter || undefined,
              timeOpen: payload?.productPriceList[k].timeOpen || undefined,
              timeClose: payload?.productPriceList[k].timeClose || undefined,
              consumerType:
                payload?.productPriceList[k].consumerType || undefined,
              sellType: payload?.productPriceList[k].sellType || 'NORMALSELL',
              vendorDiscount:
                payload?.productPriceList[k].vendorDiscount || undefined,
              consumerDiscount:
                payload?.productPriceList[k].consumerDiscount || undefined,
              minQuantity:
                payload?.productPriceList[k].minQuantity || undefined,
              maxQuantity:
                payload?.productPriceList[k].maxQuantity || undefined,
              productCondition:
                payload?.productPriceList[k].productCondition || undefined,
              minCustomer:
                payload?.productPriceList[k].minCustomer || undefined,
              maxCustomer:
                payload?.productPriceList[k].maxCustomer || undefined,
              minQuantityPerCustomer:
                payload?.productPriceList[k].minQuantityPerCustomer ||
                undefined,
              maxQuantityPerCustomer:
                payload?.productPriceList[k].maxQuantityPerCustomer ||
                undefined,
              askForStock: payload?.productPriceList[k]?.askForStock || 'false',
              askForPrice: payload?.productPriceList[k]?.askForPrice || 'false',
              vendorDiscountType:
                payload?.productPriceList[k]?.vendorDiscountType || undefined,
              consumerDiscountType:
                payload?.productPriceList[k]?.consumerDiscountType || undefined,
              dateOpen: payload?.productPriceList[k]?.dateOpen
                ? new Date(payload.productPriceList[k].dateOpen)
                : null,
              dateClose: payload?.productPriceList[k]?.dateClose
                ? new Date(payload.productPriceList[k].dateClose)
                : null,
              startTime: payload?.productPriceList[k]?.startTime || undefined,
              endTime: payload?.productPriceList[k]?.endTime || undefined,
              isCustomProduct:
                payload?.productPriceList[k]?.isCustomProduct || 'false',
              productCountryId:
                payload?.productPriceList[k]?.productCountryId || undefined,
              productStateId:
                payload?.productPriceList[k]?.productStateId || undefined,
              productCityId:
                payload?.productPriceList[k]?.productCityId || undefined,
              productTown:
                payload?.productPriceList[k]?.productTown || undefined,
              productLatLng:
                payload?.productPriceList[k]?.productLatLng || undefined,
              menuId: payload?.productPriceList[k]?.menuId || menuId,
            },
          });

          // Product Variant
          if (payload.productVariant) {
            let newProductVariant = await prisma.productVariant.create({
              data: {
                productId: addProduct.id,
                productPriceId: addProductPrice.id,
                object: payload.productVariant,
              },
            });
          }

          // Store sellCountryIds
          if (payload.productPriceList[k]?.sellCountryIds) {
            for (let country of payload.productPriceList[k].sellCountryIds ||
              []) {
              await prisma.productSellCountry.create({
                data: {
                  productId: addProduct.id,
                  productPriceId: addProductPrice.id,
                  countryName: country.label,
                  countryId: country.value,
                  status: 'ACTIVE',
                },
              });
            }
          }

          // Store sellStateIds
          if (payload.productPriceList[k]?.sellStateIds) {
            for (let state of payload.productPriceList[k].sellStateIds || []) {
              await prisma.productSellState.create({
                data: {
                  productId: addProduct.id,
                  productPriceId: addProductPrice.id,
                  stateName: state.label,
                  stateId: state.value,
                  status: 'ACTIVE',
                },
              });
            }
          }

          // Store sellCityIds
          if (payload.productPriceList[k]?.sellCityIds) {
            for (let city of payload.productPriceList[k].sellCityIds || []) {
              await prisma.productSellCity.create({
                data: {
                  productId: addProduct.id,
                  productPriceId: addProductPrice.id,
                  cityName: city.label,
                  cityId: city.value,
                  status: 'ACTIVE',
                },
              });
            }
          }

          try {
            const barcodeImageProductPrice =
              await this.generateBarcodeForProductPrice(
                addProductPrice.id.toString(),
                addProduct.id.toString(),
                adminId.toString(),
              );

            await prisma.productPrice.update({
              where: { id: addProductPrice.id },
              data: { productPriceBarcode: barcodeImageProductPrice },
            });
          } catch (error) {
            console.log(
              'error, in /product/create/barcodeImageProductPrice: ',
              error,
            );
          }
        }
      }

      if (
        payload?.productShortDescriptionList &&
        payload?.productShortDescriptionList.length > 0
      ) {
        for (let s = 0; s < payload.productShortDescriptionList.length; s++) {
          let addProductImages = await prisma.productShortDescription.create({
            data: {
              productId: addProduct.id,
              adminId: userId,
              shortDescription:
                payload?.productShortDescriptionList[s]?.shortDescription,
            },
          });
        }
      }

      if (
        payload?.productSpecificationList &&
        payload?.productSpecificationList.length > 0
      ) {
        for (let i = 0; i < payload.productSpecificationList.length; i++) {
          let addProductSpecifications =
            await prisma.productSpecification.create({
              data: {
                productId: addProduct.id,
                adminId: userId,
                label: payload?.productSpecificationList[i]?.label,
                specification:
                  payload?.productSpecificationList[i]?.specification,
              },
            });
        }
      }

      // Generate the barcode for the product
      const barcodeImage = await this.generateBarcode(
        addProduct.id.toString(),
        addProduct.productName,
        addProduct?.skuNo || '',
      );

      // Save the barcode image URL or data to the product in the database
      await prisma.product.update({
        where: { id: addProduct.id },
        data: { barcode: barcodeImage }, // Assuming you have a 'barcode' field in your Product model
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: addProduct,
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error in create product',
        error: error.message,
      };
    }
  }

  async generateBarcode(
    productId: string,
    productName: string,
    sku: string,
  ): Promise<string> {
    // Concatenate the product ID, product name, and SKU into a single string
    const barcodeData = `${productId}-${productName}-${sku}`;

    // Generate the barcode using bwip-js
    const barcodeOptions = {
      bcid: 'code128', // Barcode type
      text: barcodeData, // Data to encode
      scale: 3, // Scaling factor
      height: 10, // Bar height, in millimeters
      includetext: true, // Include human-readable text below the barcode
      // includetext: false, // Exclude human-readable text below the barcode
    };

    return new Promise((resolve, reject) => {
      bwipjs.toBuffer(barcodeOptions, (err, png) => {
        if (err) {
          reject(err);
        } else {
          // Convert the barcode image buffer to a data URL
          const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
          resolve(dataUrl);
        }
      });
    });
  }

  async generateBarcodeForProductPrice(
    productId: string,
    productPriceId: string,
    adminId: string,
  ) {
    const barcodeData = `${productId}-${productPriceId}-${adminId}`;

    const barcodeOptions = {
      bcid: 'code128', // Barcode type
      text: barcodeData, // Data to encode
      scale: 3, // Scaling factor
      height: 10, // Bar height, in millimeters
      includetext: true, // Include human-readable text below the barcode
    };

    return new Promise((resolve, reject) => {
      bwipjs.toBuffer(barcodeOptions, (err, png) => {
        if (err) {
          reject(err);
        } else {
          // Convert the barcode image buffer to a data URL
          const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
          resolve(dataUrl);
        }
      });
    });
  }

  async update(payload: any, req: any) {
    try {
      // const userId = req?.user?.id
      let userId = req?.user?.id;
      userId = await this.helperService.getAdminId(userId);
      console.log('admin_id: ', userId);

      const productId = payload.productId;
      let productDetail = await prisma.product.findUnique({
        where: { id: productId },
      });
      let updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          productName: payload.productName || productDetail.productName,
          typeOfProduct: payload.typeOfProduct || productDetail.typeOfProduct,
          categoryId: payload.categoryId || productDetail.categoryId,
          brandId: payload.brandId || productDetail.brandId,
          placeOfOriginId:
            payload.placeOfOriginId || productDetail.placeOfOriginId,
          skuNo: payload.skuNo || productDetail.skuNo,
          productPrice: payload.productPrice || productDetail.productPrice,
          offerPrice: payload.offerPrice || productDetail.offerPrice,
          shortDescription:
            payload.shortDescription || productDetail.shortDescription,
          description: payload.description || productDetail.description,
          specification: payload.specification || productDetail.specification,
          categoryLocation:
            payload?.categoryLocation || productDetail.categoryLocation,
          adminId: payload?.adminId || userId,
          userId: payload?.userId || userId,
        },
      });

      if (payload.productTagList && payload.productTagList.length > 0) {
        await prisma.productTags.deleteMany({
          where: { productId: productId },
        });
        for (let i = 0; i < payload.productTagList.length; i++) {
          let addProductTags = await prisma.productTags.create({
            data: {
              productId: productId,
              tagId: payload.productTagList[i].tagId,
            },
          });
        }
      }

      if (payload.productImagesList && payload.productImagesList.length > 0) {
        await prisma.productImages.deleteMany({
          where: { productId: productId },
        });
        for (let j = 0; j < payload.productImagesList.length; j++) {
          let addProductImages = await prisma.productImages.create({
            data: {
              productId: productId,
              imageName: payload?.productImagesList[j]?.imageName,
              image: payload?.productImagesList[j]?.image,
              videoName: payload?.productImagesList[j]?.videoName,
              video: payload?.productImagesList[j]?.video,
              variant: payload?.productImagesList[j]?.variant,
            },
          });
        }
      }

      if (
        payload?.productShortDescriptionList &&
        payload?.productShortDescriptionList.length > 0
      ) {
        await prisma.productShortDescription.deleteMany({
          where: { productId: productId },
        });
        for (let s = 0; s < payload.productShortDescriptionList.length; s++) {
          let addProductImages = await prisma.productShortDescription.create({
            data: {
              productId: productId,
              adminId: userId,
              shortDescription:
                payload?.productShortDescriptionList[s]?.shortDescription,
            },
          });
        }
      }

      if (
        payload?.productSpecificationList &&
        payload?.productSpecificationList.length > 0
      ) {
        await prisma.productSpecification.deleteMany({
          where: { productId: productId },
        });
        for (let i = 0; i < payload.productSpecificationList.length; i++) {
          let addProductSpecifications =
            await prisma.productSpecification.create({
              data: {
                productId: productId,
                adminId: userId,
                label: payload?.productSpecificationList[i]?.label,
                specification:
                  payload?.productSpecificationList[i]?.specification,
              },
            });
        }
      }

      if (payload?.productPriceList && payload?.productPriceList.length > 0) {
        let productPriceDetail = await prisma.productPrice.findFirst({
          where: {
            productId: productId,
            adminId: userId,
          },
        });
        for (let k = 0; k < payload.productPriceList.length; k++) {
          let menuId = 8; // Store
          if (payload?.productPriceList[k]?.isCustomProduct === 'true') {
            menuId = 10; // Factories
          } else if (
            payload?.productPriceList[k].sellType === 'BUYGROUP' &&
            payload?.productPriceList[k]?.isCustomProduct === 'false'
          ) {
            menuId = 9; // BuyGroup
          }

          let addProductPrice = await prisma.productPrice.update({
            where: { id: productPriceDetail?.id },
            data: {
              status:
                payload.productPriceList[k].status || productPriceDetail.status,
              productPrice:
                payload?.productPriceList[k]?.productPrice ||
                productPriceDetail.productPrice,
              offerPrice:
                payload?.productPriceList[k]?.offerPrice ||
                productPriceDetail.offerPrice,
              stock:
                payload?.productPriceList[k]?.stock || productPriceDetail.stock,
              deliveryAfter:
                payload?.productPriceList[k]?.deliveryAfter ||
                productPriceDetail.deliveryAfter,
              timeOpen:
                payload?.productPriceList[k]?.timeOpen ||
                productPriceDetail.timeOpen,
              timeClose:
                payload?.productPriceList[k]?.timeClose ||
                productPriceDetail.timeClose,
              consumerType:
                payload?.productPriceList[k]?.consumerType ||
                productPriceDetail.consumerType,
              sellType:
                payload?.productPriceList[k]?.sellType ||
                productPriceDetail.sellType,
              vendorDiscount:
                payload?.productPriceList[k]?.vendorDiscount ||
                productPriceDetail.vendorDiscount,
              consumerDiscount:
                payload?.productPriceList[k]?.consumerDiscount ||
                productPriceDetail.consumerDiscount,
              minQuantity:
                payload?.productPriceList[k]?.minQuantity ||
                productPriceDetail.minQuantity,
              maxQuantity:
                payload?.productPriceList[k]?.maxQuantity ||
                productPriceDetail.maxQuantity,
              productCondition:
                payload?.productPriceList[k].productCondition ||
                productPriceDetail.productCondition,
              minCustomer:
                payload?.productPriceList[k].minCustomer ||
                productPriceDetail.minCustomer,
              maxCustomer:
                payload?.productPriceList[k].maxCustomer ||
                productPriceDetail.maxCustomer,
              minQuantityPerCustomer:
                payload?.productPriceList[k].minQuantityPerCustomer ||
                productPriceDetail.minQuantityPerCustomer,
              maxQuantityPerCustomer:
                payload?.productPriceList[k].maxQuantityPerCustomer ||
                productPriceDetail.maxQuantityPerCustomer,
              vendorDiscountType:
                payload?.productPriceList[k]?.vendorDiscountType ||
                productPriceDetail.vendorDiscountType,
              consumerDiscountType:
                payload?.productPriceList[k]?.consumerDiscountType ||
                productPriceDetail.consumerDiscountType,
              dateOpen: payload?.productPriceList[k]?.dateOpen
                ? new Date(payload.productPriceList[k].dateOpen)
                : productPriceDetail.consumerDiscountType,
              dateClose: payload?.productPriceList[k]?.dateClose
                ? new Date(payload.productPriceList[k].dateClose)
                : productPriceDetail.consumerDiscountType,
              startTime:
                payload?.productPriceList[k]?.startTime ||
                productPriceDetail.startTime,
              endTime:
                payload?.productPriceList[k]?.endTime ||
                productPriceDetail.endTime,
              isCustomProduct:
                payload?.productPriceList[k]?.isCustomProduct ||
                productPriceDetail.isCustomProduct,
              productCountryId:
                payload?.productPriceList[k]?.productCountryId ||
                productPriceDetail.productCountryId,
              productStateId:
                payload?.productPriceList[k]?.productStateId ||
                productPriceDetail.productStateId,
              productCityId:
                payload?.productPriceList[k]?.productCityId ||
                productPriceDetail.productCityId,
              productTown:
                payload?.productPriceList[k]?.productTown ||
                productPriceDetail.productTown,
              productLatLng:
                payload?.productPriceList[k]?.productLatLng ||
                productPriceDetail.productLatLng,
              menuId:
                payload?.productPriceList[k]?.menuId ||
                productPriceDetail.menuId,
            },
          });

          // Store sellCountryIds
          if (payload.productPriceList[k]?.sellCountryIds) {
            await prisma.productSellCountry.deleteMany({
              where: { productId: productId },
            });
            for (let country of payload.productPriceList[k].sellCountryIds ||
              []) {
              await prisma.productSellCountry.create({
                data: {
                  productId: productId,
                  productPriceId: addProductPrice.id,
                  countryName: country.label,
                  countryId: country.value,
                  status: 'ACTIVE',
                },
              });
            }
          }

          // Store sellStateIds
          if (payload.productPriceList[k]?.sellStateIds) {
            await prisma.productSellState.deleteMany({
              where: { productId: productId },
            });
            for (let state of payload.productPriceList[k].sellStateIds || []) {
              await prisma.productSellState.create({
                data: {
                  productId: productId,
                  productPriceId: addProductPrice.id,
                  stateName: state.label,
                  stateId: state.value,
                  status: 'ACTIVE',
                },
              });
            }
          }

          // Store sellCityIds
          if (payload.productPriceList[k]?.sellCityIds) {
            await prisma.productSellCity.deleteMany({
              where: { productId: productId },
            });
            for (let city of payload.productPriceList[k].sellCityIds || []) {
              await prisma.productSellCity.create({
                data: {
                  productId: productId,
                  productPriceId: addProductPrice.id,
                  cityName: city.label,
                  cityId: city.value,
                  status: 'ACTIVE',
                },
              });
            }
          }
        }

        if (payload?.productVariant) {
          let updateProductVariant = await prisma.productVariant.updateMany({
            where: {
              productPriceId: productPriceDetail.id,
            },
            data: {
              object: payload?.productVariant,
            },
          });
        }
      }

      // Generate the barcode for the product
      const barcodeImage = await this.generateBarcode(
        productDetail.id.toString(),
        productDetail.productName,
        productDetail?.skuNo || '',
      );

      // Save the barcode image URL or data to the product in the database
      await prisma.product.update({
        where: { id: productDetail.id },
        data: { barcode: barcodeImage }, // Assuming you have a 'barcode' field in your Product model
      });

      return {
        status: true,
        message: 'Fetch SuccessFully',
        data: updatedProduct,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in update product',
        error: error.message,
      };
    }
  }

  async getProductVariant(payload: any, req: any) {
    try {
      const productPriceIds = payload?.productPriceId;
      let productVariant = await prisma.productVariant.findMany({
        where: {
          productPriceId: { in: productPriceIds },
        },
      });

      if (!productVariant) {
        return {
          status: false,
          message: 'product variant not found',
          data: [],
        };
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: productVariant,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in update product',
        error: error.message,
      };
    }
  }

  async findOneProductPrice(payload: any, req: any) {
    try {
      const userId = payload.userId;
      const productId = payload.productId;
      let productPrice = await prisma.productPrice.findFirst({
        where: {
          productId: productId,
          adminId: userId,
        },
      });
      return {
        status: true,
        message: 'Fetch SuccessFully',
        data: productPrice,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in update product',
        error: error.message,
      };
    }
  }

  // done where userId
  async findAll(
    userId: any,
    page: any,
    limit: any,
    req: any,
    term: any,
    brandIds: any,
  ) {
    try {
      let userID = parseInt(userId);

      let admin_id = userID;
      admin_id = await this.helperService.getAdminId(admin_id);
      console.log('admin_id: ', admin_id);

      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : '';
      let today = new Date();

      let statusFilter = req.query.status
        ? req.query.status
        : { not: 'DELETE' };

      const sellTypes = req.query.sellType
        ? req.query.sellType.split(',').map((type) => type.trim())
        : null;

      let whereCondition: any = {
        productType: 'P',
        // status: { in: ['ACTIVE', 'INACTIVE'] },
        status: statusFilter,
        // adminId: userID,
        product_productPrice: {
          some: {
            adminId: userID,
          },
        },
        productName: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        brandId: brandIds
          ? {
              in: brandIds.split(',').map((id) => parseInt(id.trim())),
            }
          : undefined,
      };

      if (req.query.expireDate === 'expired') {
        whereCondition.product_productPrice.some = {
          ...whereCondition.product_productPrice.some,
          dateClose: { lt: today },
        };
      }

      if (req.query.discount === 'true') {
        whereCondition.product_productPrice.some = {
          ...whereCondition.product_productPrice.some,
          OR: [
            { vendorDiscount: { not: null } },
            { consumerDiscount: { not: null } },
          ],
        };
      }

      if (sellTypes?.length > 0) {
        whereCondition.product_productPrice.some = {
          ...whereCondition.product_productPrice.some,
          sellType: { in: sellTypes },
        };
      }

      let productDetailList = await prisma.product.findMany({
        where: whereCondition,
        include: {
          // userBy: { where: { status: 'ACTIVE' } },
          // adminBy: { where: { status: 'ACTIVE' } },
          category: { where: { status: 'ACTIVE' } },
          brand: { where: { status: 'ACTIVE' } },
          placeOfOrigin: { where: { status: 'ACTIVE' } },
          productTags: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productTagsTag: true,
            },
          },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          productImages: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_wishlist: {
            where: { userId: userID },
            select: {
              userId: true,
              productId: true,
            },
          },
          product_productPrice: {
            where: {
              adminId: userID,
            },
            include: {
              adminDetail: { where: { status: 'ACTIVE' } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip, // Offset
        take: pageSize, // Limit
      });

      let productDetailListCount = await prisma.product.count({
        where: whereCondition,
      });

      if (!productDetailList) {
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
        data: productDetailList,
        totalCount: productDetailListCount,
      };
    } catch (error) {
      console.log('error:--- ', error);

      return {
        status: false,
        message: 'error in findAll product',
        error: error.message,
      };
    }
  }

  async findOne(productId: any, req: any, userId: any) {
    try {
      let inWishlist = 0;
      let currentSeller;
      var otherSeller;
      const productID = parseInt(productId);
      let productDetail = await prisma.product.findUnique({
        where: { id: productID },
        include: {
          category: {
            where: { status: 'ACTIVE' },
            include: {
              category_dynamicFormCategory: {
                include: {
                  formIdDetail: {
                    include: {
                      elements: true,
                    },
                  },
                },
              },
            },
          },
          brand: { where: { status: 'ACTIVE' } },
          placeOfOrigin: { where: { status: 'ACTIVE' } },
          productTags: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productTagsTag: true,
            },
          },
          productImages: { where: { status: 'ACTIVE' } },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          product_productSpecification: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_productPrice: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productPrice_productSellerImage: true,
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
                      companyName: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              offerPrice: 'asc',
            },
            take: 1, // Limit the result to only 1 row
          },
          product_sellCountry: { where: { status: 'ACTIVE' } },
          product_sellState: { where: { status: 'ACTIVE' } },
          product_sellCity: { where: { status: 'ACTIVE' } },
        },
      });
      if (!productDetail) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
          inWishlist: 0,
          otherSeller: [],
        };
      }

      if (userId) {
        const userID = parseInt(userId);
        let existInWishlist = await prisma.wishlist.findFirst({
          where: {
            userId: userID,
            productId: productID,
          },
        });
        if (existInWishlist) {
          inWishlist = 1;
        }
      }

      if (productDetail && productDetail.product_productPrice.length > 0) {
        currentSeller = productDetail?.product_productPrice;
        let currentSellerId = currentSeller[0].adminId;
        otherSeller = await prisma.productPrice.findMany({
          where: {
            productId: productID,
            adminId: {
              not: currentSellerId,
            },
            status: 'ACTIVE',
          },
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
                    companyName: true,
                  },
                },
              },
            },
          },
        });
      }

      let generatedLinkDetail;
      if (req.query.sharedLinkId) {
        const sharedLinkId = req.query.sharedLinkId;
        let sharedLinkExist = await prisma.sharedLink.findUnique({
          where: {
            id: parseInt(sharedLinkId),
          },
        });
        if (sharedLinkExist) {
          generatedLinkDetail = sharedLinkExist;
        }
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: productDetail,
        totalCount: 1,
        inWishlist: inWishlist,
        otherSeller: otherSeller ? otherSeller : [],
        generatedLinkDetail: generatedLinkDetail,
      };
    } catch (error) {
      console.log('error; ', error);

      return {
        status: false,
        message: 'error in findOne product',
        error: error.message,
      };
    }
  }

  async findOneWithProductPrice(
    productId: any,
    adminId: any,
    req: any,
    userId: any,
  ) {
    try {
      let inWishlist = 0;
      let currentSeller;
      var otherSeller;
      const productID = parseInt(productId);
      const adminID = parseInt(adminId);

      let productDetail = await prisma.product.findUnique({
        where: { id: productID },
        include: {
          category: {
            where: { status: 'ACTIVE' },
            include: {
              category_dynamicFormCategory: {
                include: {
                  formIdDetail: {
                    include: {
                      elements: true,
                    },
                  },
                },
              },
            },
          },
          brand: { where: { status: 'ACTIVE' } }, // Include the brand relation with active status
          placeOfOrigin: { where: { status: 'ACTIVE' } }, // Include the placeOfOrigin relation with active status
          productTags: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productTagsTag: true,
            },
          },
          productImages: { where: { status: 'ACTIVE' } },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          product_productSpecification: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_productPrice: {
            where: {
              adminId: adminID,
              status: 'ACTIVE',
            },
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
                      companyName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!productDetail) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
          inWishlist: 0,
          otherSeller: [],
        };
      }

      if (userId) {
        // checking WishList
        const userID = parseInt(userId);
        let existInWishlist = await prisma.wishlist.findFirst({
          where: {
            userId: userID,
            productId: productID,
          },
        });
        if (existInWishlist) {
          inWishlist = 1;
        }
      }

      if (productDetail && productDetail.product_productPrice.length > 0) {
        // checking other Seller for same productId
        currentSeller = productDetail?.product_productPrice;
        let currentSellerId = currentSeller[0].adminId;
        otherSeller = await prisma.productPrice.findMany({
          where: {
            productId: productID,
            adminId: {
              not: currentSellerId,
            },
            status: 'ACTIVE',
          },
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
                    companyName: true,
                  },
                },
              },
            },
          },
        });
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: productDetail,
        totalCount: 1,
        inWishlist: inWishlist,
        otherSeller: otherSeller ? otherSeller : [],
      };
    } catch (error) {
      console.log('error; ', error);
      return {
        status: false,
        message: 'error in findOneWithProductPrice',
        error: error.message,
      };
    }
  }

  async vendorDetails(adminId: any) {
    try {
      let adminID = parseInt(adminId);
      if (!adminID) {
        return {
          status: false,
          message: 'adminId is required',
          data: [],
          totalCount: 0,
        };
      }
      let vendorDetails = await prisma.user.findUnique({
        where: { id: adminID },
        select: {
          id: true,
          uniqueId: true,
          cc: true,
          phoneNumber: true,
          email: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          tradeRole: true,
          // userProfile: {
          //   select: {
          //     id: true,
          //     profileType: true,
          //     logo: true,
          //     companyName: true,
          //     userProfileBusinessType: {
          //       select: {
          //         id: true,
          //         businessTypeId: true,
          //         userProfileBusinessTypeTag: true
          //       }
          //     }
          //   }
          // },
          userProfile: {
            include: {
              userProfileBusinessType: {
                include: {
                  userProfileBusinessTypeTag: true,
                },
              },
            },
          },
          userBranch: {
            include: {
              userBranchBusinessType: {
                include: {
                  userBranch_BusinessType_Tag: true,
                },
              },
              userBranchTags: {
                include: {
                  userBranchTagsTag: true,
                },
              },
            },
          },
        },
      });
      return {
        status: true,
        message: 'Fetch Successfully',
        data: vendorDetails,
        totalCount: 1,
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error in vendorDetails',
        error: error.message,
      };
    }
  }

  async vendorAllProduct(
    adminId: any,
    page: any,
    limit: any,
    req: any,
    brandIds: any,
  ) {
    // all Active product is shown
    try {
      let adminID = parseInt(adminId);
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset

      let today = new Date();

      const sellTypes = req.query.sellType
        ? req.query.sellType.split(',').map((type) => type.trim())
        : null;

      let whereCondition: any = {
        productType: 'P',
        status: { in: ['ACTIVE'] },
        product_productPrice: {
          some: {
            adminId: adminID,
          },
        },
        brandId: brandIds
          ? {
              in: brandIds.split(',').map((id) => parseInt(id.trim())),
            }
          : undefined,
      };

      if (req.query.expireDate === 'expired') {
        whereCondition.product_productPrice.some = {
          ...whereCondition.product_productPrice.some,
          dateClose: { lt: today },
        };
      }

      if (req.query.discount === 'true') {
        whereCondition.product_productPrice.some = {
          ...whereCondition.product_productPrice.some,
          OR: [
            { vendorDiscount: { not: null } },
            { consumerDiscount: { not: null } },
          ],
        };
      }

      if (sellTypes?.length > 0) {
        whereCondition.product_productPrice.some = {
          ...whereCondition.product_productPrice.some,
          sellType: { in: sellTypes },
        };
      }

      let vendorAllProduct = await prisma.product.findMany({
        where: whereCondition,
        include: {
          category: { where: { status: 'ACTIVE' } },
          brand: { where: { status: 'ACTIVE' } },
          placeOfOrigin: { where: { status: 'ACTIVE' } },
          productTags: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productTagsTag: true,
            },
          },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          productImages: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          // product_wishlist: {
          //   where: { userId: adminID },
          //   select: {
          //     userId: true,
          //     productId: true
          //   }
          // },
          product_productPrice: {
            where: {
              adminId: adminID,
            },
            include: {
              adminDetail: { where: { status: 'ACTIVE' } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip, // Offset
        take: pageSize, // Limit
      });

      let vendorAllProductCount = await prisma.product.count({
        where: whereCondition,
      });

      if (!vendorAllProduct) {
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
        data: vendorAllProduct,
        totalCount: vendorAllProductCount,
      };
    } catch (error) {
      console.log('error: ', error);
      return {
        status: false,
        message: 'error in vendorAllProduct',
        error: error.message,
      };
    }
  }

  // Not in use
  async findOneProductBySellerId(
    productId: any,
    req: any,
    userId: any,
    sellerId: any,
  ) {
    try {
      let inWishlist = 0;
      let currentSeller;
      var otherSeller;

      // Type annotations and validations
      if (productId === null || productId === undefined || productId === '') {
        throw new Error('productId must not be empty');
      }
      if (sellerId === null || sellerId === undefined || sellerId === '') {
        throw new Error('sellerId must not be empty');
      }

      const productID = parseInt(productId);
      const userID = parseInt(userId);
      const sellerID = parseInt(sellerId);

      let productDetail = await prisma.product.findUnique({
        where: { id: productID },
        include: {
          category: {
            where: { status: 'ACTIVE' },
            include: {
              category_dynamicFormCategory: {
                include: {
                  formIdDetail: {
                    include: {
                      elements: true,
                    },
                  },
                },
              },
            },
          },
          brand: { where: { status: 'ACTIVE' } },
          placeOfOrigin: { where: { status: 'ACTIVE' } },
          productTags: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productTagsTag: true,
            },
          },
          productImages: { where: { status: 'ACTIVE' } },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          product_productSpecification: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_productPrice: {
            where: {
              status: 'ACTIVE',
              adminId: sellerID,
            },
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
                      companyName: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              offerPrice: 'asc',
            },
            take: 1, // Limit the result to only 1 row
          },
        },
      });
      if (!productDetail) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
          inWishlist: 0,
          otherSeller: [],
        };
      }

      if (productDetail && productDetail.product_productPrice) {
        currentSeller = productDetail?.product_productPrice;
        let currentSellerId = currentSeller[0].adminId;
        otherSeller = await prisma.productPrice.findMany({
          where: {
            productId: productID,
            adminId: {
              not: currentSellerId,
            },
          },
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
                    companyName: true,
                  },
                },
              },
            },
          },
        });
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: productDetail,
        totalCount: 1,
        inWishlist: inWishlist,
        otherSeller: otherSeller ? otherSeller : [],
      };
    } catch (error) {
      // console.log('error; ', error);
      return {
        status: false,
        message: 'error in findOneProductBySellerId',
        error: error.message,
      };
    }
  }

  async delete(productId: any, req: any) {
    try {
      let ID = parseInt(productId);
      let updatedProduct = await prisma.product.update({
        where: { id: ID },
        data: {
          status: 'DELETE',
          deletedAt: new Date(),
        },
      });
      return {
        status: true,
        message: 'Deleted Successfully',
        data: updatedProduct,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in delete product',
        error: error.message,
      };
    }
  }

  // same product, different price for seller, starts **** ----
  async addPriceForProduct(payload: any, req: any) {
    try {
      const adminId = req?.user?.id;
      const productId = payload?.productId;
      const productPrice = payload?.productPrice;
      const offerPrice = payload?.offerPrice;
      const stock = payload?.stock;
      const deliveryAfter = payload?.deliveryAfter;
      const timeOpen = payload?.timeOpen;
      const timeClose = payload?.timeClose;
      const consumerType = payload?.consumerType;
      const sellType = payload?.sellType;
      const vendorDiscount = payload?.vendorDiscount;
      const consumerDiscount = payload?.consumerDiscount;
      const minQuantity = payload?.minQuantity;
      const maxQuantity = payload?.maxQuantity;
      const productCondition = payload?.productCondition;
      const minCustomer = payload?.minCustomer;
      const maxCustomer = payload?.maxCustomer;
      const minQuantityPerCustomer = payload?.minQuantityPerCustomer;
      const maxQuantityPerCustomer = payload?.maxQuantityPerCustomer;

      if (!productId || !productPrice || !offerPrice) {
        return {
          status: false,
          message: 'productId or productPrice or offerPrice is missing',
          data: [],
        };
      }

      let existProductPrice = await prisma.productPrice.findFirst({
        where: {
          adminId: adminId,
          productId: productId,
        },
      });
      if (existProductPrice) {
        return {
          status: false,
          message: 'Already Added',
          data: existProductPrice,
        };
      }

      let addProdctPrice = await prisma.productPrice.create({
        data: {
          adminId: adminId,
          productId: productId,
          productPrice: productPrice,
          offerPrice: offerPrice,
          stock: stock || undefined,
          deliveryAfter: deliveryAfter || undefined,
          timeOpen: timeOpen || undefined,
          timeClose: timeClose || undefined,
          consumerType: consumerType || undefined,
          sellType: sellType || undefined,
          vendorDiscount: vendorDiscount || undefined,
          consumerDiscount: consumerDiscount || undefined,
          minQuantity: minQuantity || undefined,
          maxQuantity: maxQuantity || undefined,
          productCondition: productCondition || undefined,
          minCustomer: minCustomer || undefined,
          maxCustomer: maxCustomer || undefined,
          minQuantityPerCustomer: minQuantityPerCustomer || undefined,
          maxQuantityPerCustomer: maxQuantityPerCustomer || undefined,
        },
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: addProdctPrice,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in addPriceForProduct',
        error: error.message,
      };
    }
  }

  async addMultiplePriceForProduct(
    payload: AddMultiplePriceForProductDTO,
    req: any,
  ) {
    try {
      const adminId = req?.user?.id;
      const productPriceList = [];

      if (payload?.productPrice && payload?.productPrice.length > 0) {
        for (let i = 0; i < payload?.productPrice.length; i++) {
          let existProductPrice = await prisma.productPrice.findFirst({
            where: {
              adminId: adminId,
              productId: payload?.productPrice[i]?.productId,
            },
          });

          if (!existProductPrice) {
            let addProductPrice = await prisma.productPrice.create({
              data: {
                adminId: adminId,
                productId: payload.productPrice[i].productId,
                productPrice: payload.productPrice[i].productPrice || 0.0,
                offerPrice: payload.productPrice[i].offerPrice || 0.0,
                status: payload.productPrice[i].status || 'INACTIVE',
                askForStock: payload?.productPrice[i]?.askForStock || 'false',
                askForPrice: payload?.productPrice[i]?.askForPrice || 'false',
              },
            });
            productPriceList.push(addProductPrice);

            try {
              const barcodeImageProductPrice =
                await this.generateBarcodeForProductPrice(
                  payload.productPrice[i].productId.toString(),
                  addProductPrice.id.toString(),
                  adminId.toString(),
                );

              await prisma.productPrice.update({
                where: { id: addProductPrice.id },
                data: { productPriceBarcode: barcodeImageProductPrice },
              });
            } catch (error) {
              console.log(
                'error, in /product/addMultiplePriceForProduct/barcodeImageProductPrice: ',
                error,
              );
            }
          }
        }

        return {
          status: true,
          message: 'Created Successfully',
          data: productPriceList,
        };
      } else {
        return {
          status: false,
          message: 'Something when wrong!',
          data: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'error, in addMultiplePriceForProduct',
        error: error.message,
      };
    }
  }

  async updateMultipleProductPrice(
    payload: UpdateMultiplePriceForProductDTO,
    req: any,
  ) {
    try {
      const adminId = req?.user?.id;
      const productPriceList = [];

      if (payload?.productPrice && payload?.productPrice.length > 0) {
        for (let i = 0; i < payload?.productPrice.length; i++) {
          let existProductPrice = await prisma.productPrice.findUnique({
            where: { id: payload?.productPrice[i].productPriceId },
          });
          // console.log('existProductPrice: ',existProductPrice);

          if (existProductPrice) {
            let updatedProductPrice = await prisma.productPrice.update({
              where: { id: payload?.productPrice[i].productPriceId },
              data: {
                status:
                  payload?.productPrice[i]?.status || existProductPrice?.status,
                productPrice: payload?.productPrice[i]?.productPrice, // || existProductPrice?.productPrice,
                offerPrice: payload?.productPrice[i]?.offerPrice, // || existProductPrice?.offerPrice,
                stock: payload?.productPrice[i]?.stock, //|| existProductPrice?.stock,
                deliveryAfter:
                  payload?.productPrice[i]?.deliveryAfter ||
                  existProductPrice?.deliveryAfter,
                timeOpen:
                  payload?.productPrice[i]?.timeOpen ||
                  existProductPrice?.timeOpen,
                timeClose:
                  payload?.productPrice[i]?.timeClose ||
                  existProductPrice?.timeClose,
                consumerType:
                  payload?.productPrice[i]?.consumerType ||
                  existProductPrice?.consumerType,
                sellType:
                  payload?.productPrice[i]?.sellType ||
                  existProductPrice?.sellType,
                vendorDiscount:
                  payload?.productPrice[i]?.vendorDiscount ||
                  existProductPrice?.vendorDiscount,
                consumerDiscount:
                  payload?.productPrice[i]?.consumerDiscount ||
                  existProductPrice?.consumerDiscount,
                minQuantity:
                  payload?.productPrice[i]?.minQuantity ||
                  existProductPrice?.minQuantity,
                maxQuantity:
                  payload?.productPrice[i]?.maxQuantity ||
                  existProductPrice?.maxQuantity,
                productCondition:
                  payload?.productPrice[i]?.productCondition ||
                  existProductPrice?.productCondition,
                minCustomer:
                  payload?.productPrice[i]?.minCustomer ||
                  existProductPrice?.minCustomer,
                maxCustomer:
                  payload?.productPrice[i]?.maxCustomer ||
                  existProductPrice?.maxCustomer,
                minQuantityPerCustomer:
                  payload?.productPrice[i]?.minQuantityPerCustomer ||
                  existProductPrice?.minQuantityPerCustomer,
                maxQuantityPerCustomer:
                  payload?.productPrice[i]?.maxQuantityPerCustomer ||
                  existProductPrice?.maxQuantityPerCustomer,
                askForStock:
                  payload?.productPrice[i]?.askForStock ||
                  existProductPrice?.askForStock,
                askForPrice:
                  payload?.productPrice[i]?.askForPrice ||
                  existProductPrice?.askForPrice,
              },
            });
            productPriceList.push(updatedProductPrice);
          }
        }

        return {
          status: true,
          message: 'Updated Successfully',
          data: productPriceList,
        };
      } else {
        return {
          status: false,
          message: 'Something went wrong!',
          data: [],
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'error, in updateMultipleProductPrice',
        error: error.message,
      };
    }
  }

  async getAllProductPriceByUser(
    page: any,
    limit: any,
    req: any,
    term: any,
    brandIds: any,
  ) {
    try {
      let adminId = req?.user?.id;
      if (req?.query?.selectedAdminId) {
        adminId = parseInt(req.query.selectedAdminId);
      }
      // const adminId = req?.user?.id;
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : '';
      const sortType = 'desc'; //sort ? sort : 'desc';

      let today = new Date();

      // Determine the status filter
      let statusFilter = req.query.status
        ? req.query.status
        : { not: 'DELETE' };

      let whereCondition: any = {
        status: statusFilter,
        adminId: adminId,
        productPrice_product: {
          productType: 'P',
          productName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
          brandId: brandIds
            ? {
                in: brandIds.split(',').map((id) => parseInt(id.trim())),
              }
            : undefined,
        },
      };

      // Apply expireDate filter if requested
      if (req.query.expireDate === 'active') {
        whereCondition.dateClose = { gte: today }; // Active products (dateClose >= today)
      } else if (req.query.expireDate === 'expired') {
        whereCondition.dateClose = { lt: today }; // Expired products (dateClose < today)
      }

      // Apply `sellType` filter if provided
      // if (req.query.sellType === 'NORMALSELL') {
      //   whereCondition.sellType = 'NORMALSELL';
      // } else if (req.query.sellType === 'BUYGROUP') {
      //   whereCondition.sellType = 'BUYGROUP';
      // }
      const sellTypes = req.query.sellType
        ? req.query.sellType.split(',').map((type) => type.trim())
        : null;
      if (sellTypes) {
        whereCondition.sellType = { in: sellTypes };
      }

      // Apply discount filter if requested (if either discount is not null)
      if (req.query.discount === 'true') {
        whereCondition.OR = [
          { vendorDiscount: { not: null } },
          { consumerDiscount: { not: null } },
        ];
      }

      let getAllProductPrice = await prisma.productPrice.findMany({
        where: whereCondition,
        include: {
          productPrice_product: {
            include: {
              productImages: true,
            },
          },
          productPrice_productSellerImage: true,
        },
        orderBy: { createdAt: sortType },
        skip, // Offset
        take: pageSize, // Limit
      });

      if (!getAllProductPrice) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
        };
      }

      let getAllProductPriceCount = await prisma.productPrice.count({
        // where: { adminId: adminId }
        where: whereCondition,
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllProductPrice,
        totalCount: getAllProductPriceCount,
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error, in getAllProductPriceByUser',
        error: error.message,
      };
    }
  }

  async getOneProductByProductCondition(
    productId: any,
    req: any,
    productPriceId: any,
  ) {
    try {
      const productID = parseInt(productId);
      const productPriceID = parseInt(productPriceId);

      let productDetail = await prisma.product.findUnique({
        where: { id: productID },
        include: {
          productImages: { where: { status: 'ACTIVE' } },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          product_productSpecification: { where: { status: 'ACTIVE' } },
          product_productPrice: {
            where: {
              id: productPriceID,
            },
            include: {
              productPrice_productSellerImage: true,
            },
          },
        },
      });
      if (!productDetail) {
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
        data: productDetail,
        totalCount: 1,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in getOneProduct',
        error: error.message,
      };
    }
  }

  // not in use
  async editProductPriceByProductCondition(payload: any, req: any) {
    try {
      const productId = payload?.productId;
      const productPriceId = payload?.productPriceId;

      let productDetail = await prisma.product.findUnique({
        where: { id: productId },
      });
      let updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          description: payload.description || productDetail.description,
        },
      });

      if (
        payload?.productShortDescriptionList &&
        payload?.productShortDescriptionList.length > 0
      ) {
        let pre = await prisma.productShortDescription.findFirst({
          where: { productId: productId },
        });
        await prisma.productShortDescription.deleteMany({
          where: { productId: productId },
        });
        for (let s = 0; s < payload.productShortDescriptionList.length; s++) {
          let addProductImages = await prisma.productShortDescription.create({
            data: {
              productId: productId,
              adminId: pre?.adminId,
              shortDescription:
                payload?.productShortDescriptionList[s]?.shortDescription,
            },
          });
        }
      }

      if (
        payload?.productSpecificationList &&
        payload?.productSpecificationList.length > 0
      ) {
        let preProductSpecification =
          await prisma.productSpecification.findFirst({
            where: { productId: productId },
          });
        await prisma.productSpecification.deleteMany({
          where: { productId: productId },
        });
        for (let i = 0; i < payload.productSpecificationList.length; i++) {
          let addProductSpecifications =
            await prisma.productSpecification.create({
              data: {
                productId: productId,
                adminId: preProductSpecification?.adminId,
                label: payload?.productSpecificationList[i]?.label,
                specification:
                  payload?.productSpecificationList[i]?.specification,
              },
            });
        }
      }

      if (
        payload?.productSellerImageList &&
        payload?.productSellerImageList.length > 0
      ) {
        await prisma.productSellerImage.deleteMany({
          where: { productPriceId: productPriceId },
        });
        for (let i = 0; i < payload.productSellerImageList.length; i++) {
          let addProductSellerImage = await prisma.productSellerImage.create({
            data: {
              productPriceId:
                payload?.productSellerImageList[i]?.productPriceId,
              imageName: payload?.productSellerImageList[i]?.imageName,
              image: payload?.productSellerImageList[i]?.image,
              videoName: payload?.productSellerImageList[i]?.videoName,
              video: payload?.productSellerImageList[i]?.video,
            },
          });
        }
      }

      return {
        status: true,
        message: 'Updated Successfully',
        data: [],
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in getOneProductByProductCondition',
        error: error.message,
      };
    }
  }

  async updateProductPrice(
    updatedProductPriceDto: UpdatedProductPriceDto,
    req: any,
  ) {
    try {
      const productPriceId = updatedProductPriceDto?.productPriceId;

      const existProductPrice = await prisma.productPrice.findUnique({
        where: {
          id: productPriceId,
        },
      });
      if (!existProductPrice) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      let updatedProductPrice = await prisma.productPrice.update({
        where: { id: productPriceId },
        data: {
          productPrice:
            updatedProductPriceDto?.productPrice ||
            existProductPrice?.productPrice,
          offerPrice:
            updatedProductPriceDto?.offerPrice || existProductPrice?.offerPrice,
          stock: updatedProductPriceDto?.stock || existProductPrice?.stock,
          deliveryAfter:
            updatedProductPriceDto?.deliveryAfter ||
            existProductPrice?.deliveryAfter,
          timeOpen:
            updatedProductPriceDto?.timeOpen || existProductPrice?.timeOpen,
          timeClose:
            updatedProductPriceDto?.timeClose || existProductPrice?.timeClose,
          consumerType:
            updatedProductPriceDto?.consumerType ||
            existProductPrice?.consumerType,
          sellType:
            updatedProductPriceDto?.sellType || existProductPrice?.sellType,
          vendorDiscount:
            updatedProductPriceDto?.vendorDiscount ||
            existProductPrice?.vendorDiscount,
          consumerDiscount:
            updatedProductPriceDto?.consumerDiscount ||
            existProductPrice?.consumerDiscount,
          minQuantity:
            updatedProductPriceDto?.minQuantity ||
            existProductPrice?.minQuantity,
          maxQuantity:
            updatedProductPriceDto?.maxQuantity ||
            existProductPrice?.maxQuantity,
          productCondition:
            updatedProductPriceDto?.productCondition ||
            existProductPrice?.productCondition,
          minCustomer:
            updatedProductPriceDto?.minCustomer ||
            existProductPrice?.minCustomer,
          maxCustomer:
            updatedProductPriceDto?.maxCustomer ||
            existProductPrice?.maxCustomer,
          minQuantityPerCustomer:
            updatedProductPriceDto?.minQuantityPerCustomer ||
            existProductPrice?.minQuantityPerCustomer,
          maxQuantityPerCustomer:
            updatedProductPriceDto?.maxQuantityPerCustomer ||
            existProductPrice?.maxQuantityPerCustomer,
          status: updatedProductPriceDto?.status || existProductPrice?.status,
        },
      });

      return {
        status: true,
        message: 'UpdatedSuccessfully',
        data: updatedProductPrice,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in updateProductPrice',
        error: error.message,
      };
    }
  }

  // Not in use
  async getOneProductPrice(productPriceId: any) {
    try {
      // let productPriceID = productPriceId
      let productPriceID = parseInt(productPriceId);

      let getOneProductPrice = await prisma.productPrice.findUnique({
        where: { id: productPriceID },
      });
      if (!getOneProductPrice) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getOneProductPrice,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in getOneProductPrice',
        error: error.message,
      };
    }
  }

  async deleteOneProductPrice(productPriceId: any) {
    try {
      let productPriceID = parseInt(productPriceId);

      let getOneProductPrice = await prisma.productPrice.findUnique({
        where: { id: productPriceID },
      });
      if (!getOneProductPrice) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      let deletedProductPrice = await prisma.productPrice.update({
        where: { id: productPriceID },
        data: {
          status: 'DELETE',
          deletedAt: new Date(),
        },
      });

      return {
        status: true,
        message: 'Deleted Successfully',
        data: deletedProductPrice,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in deleteOneProductPrice',
        error: error.message,
      };
    }
  }
  // ---- **** Product Price Ends

  async addCountry(payload: any, req: any) {
    try {
      let addCountry = await prisma.countryList.create({
        data: {
          countryName: payload.countryName,
        },
      });
      return {
        status: false,
        message: 'error in addCountry',
        data: addCountry,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in addCountry',
        error: error.message,
      };
    }
  }

  async countryList() {
    try {
      let countryList = await prisma.countryList.findMany({
        where: { status: 'ACTIVE' },
      });
      if (!countryList) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }
      return {
        status: true,
        message: 'Fetch Successfully',
        data: countryList,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in countryList',
        error: error.message,
      };
    }
  }

  async addLocation(payload: any, req: any) {
    try {
      if (!payload?.locationName) {
        return {
          status: false,
          message: 'locationName is required',
          data: [],
        };
      }
      let addLocation = await prisma.locationList.create({
        data: {
          locationName: payload.locationName,
        },
      });
      return {
        status: false,
        message: 'error in addLocation',
        data: addLocation,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in addLocation',
        error: error.message,
      };
    }
  }

  async locationList() {
    try {
      let locationList = await prisma.locationList.findMany({
        where: { status: 'ACTIVE' },
      });
      if (!locationList) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }
      return {
        status: true,
        message: 'Fetch Successfully',
        data: locationList,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in locationList',
        error: error.message,
      };
    }
  }

  // interface ProductWithAverageRating extends Product {
  //   averageRating: number;
  // }

  // global product list
  async getAllProduct(
    page: any,
    limit: any,
    req: any,
    term: any,
    sort: any,
    brandIds: any,
    priceMin: any,
    priceMax: any,
    userId: any,
    categoryIds: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : '';
      const sortType = sort ? sort : 'desc';
      const userID = parseInt(userId);
      let myProduct;

      if (req.query.isOwner == 'me') {
        myProduct = userID;
      } else {
        myProduct = undefined;
      }

      // Parse categoryIds string into an array of integers
      // const categoryIdsArray = categoryIds.split(',').map((id: string) => parseInt(id.trim()));

      let whereCondition: any = {
        productType: {
          in: ['P', 'F'],
        },
        status: 'ACTIVE',
        // productName: {
        //   contains: searchTerm,
        //   mode: 'insensitive'
        // },
        categoryId: categoryIds
          ? {
              in: categoryIds.split(',').map((id) => parseInt(id.trim())),
            }
          : undefined,
        brandId: brandIds
          ? {
              in: brandIds.split(',').map((id) => parseInt(id.trim())),
            }
          : undefined,
        product_productPrice: {
          some: {
            askForPrice: 'false',
            isCustomProduct: 'false',
            sellType: 'NORMALSELL',
            status: 'ACTIVE',
          },
        },
        adminId: myProduct,
        OR: searchTerm
          ? [
              {
                productName: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                brand: {
                  brandName: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              },
            ]
          : undefined,
      };

      if (priceMin && priceMax) {
        whereCondition.offerPrice = {
          gte: parseFloat(priceMin),
          lte: parseFloat(priceMax),
        };
      }

      let productDetailList = await prisma.product.findMany({
        where: whereCondition,
        include: {
          category: { where: { status: 'ACTIVE' } },
          brand: { where: { status: 'ACTIVE' } },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          productImages: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_wishlist: {
            where: { userId: userID },
            select: {
              userId: true,
              productId: true,
            },
          },
          product_productPrice: {
            where: {
              status: 'ACTIVE',
              // askForPrice: 'false',
              // askForStock: 'false'
            },
            include: {
              productPrice_productSellerImage: true,
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
                      companyName: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              offerPrice: 'asc',
            },
            take: 1, // Limit the result to only 1 row
          },
        },
        orderBy: { createdAt: sortType },
        skip, // Offset
        take: pageSize, // Limit
      });

      let productDetailListCount = await prisma.product.count({
        where: whereCondition,
      });

      if (!productDetailList) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
        };
      }

      productDetailList.forEach((product) => {
        if (product.productReview.length > 0) {
          const totalRating = product.productReview.reduce(
            (acc, review) => acc + (review.rating || 0),
            0,
          );
          (product as any).averageRating = Math.floor(
            totalRating / product.productReview.length,
          );
        } else {
          (product as any).averageRating = 0; // Set default value if no reviews
        }
      });

      // Calculate average rating for each product
      // let productIds = productDetailList.map(product => product.id);
      // let productRatings = await prisma.productReview.groupBy({
      //   by: ['productId'],
      //   _avg: {
      //     rating: true,
      //   },
      //   where: {
      //     productId: { in: productIds }
      //   }
      // });

      // let productsWithRating: ProductWithAverageRating[] = productDetailList.map(product => {
      //   let productRating = productRatings.find(rating => rating.productId === product.id);
      //   let averageRating = productRating ? productRating._avg.rating || 0 : 0;
      //   return { ...product, averageRating };
      // });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: productDetailList,
        totalCount: productDetailListCount,
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error in getAllProduct',
        error: error.message,
      };
    }
  }

  // existingAllProduct  list
  async existingAllProduct(
    page: any,
    limit: any,
    req: any,
    term: any,
    sort: any,
    brandIds: any,
    priceMin: any,
    priceMax: any,
    userId: any,
    categoryIds: any,
    brandAddedBy: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : '';
      const sortType = sort ? sort : 'desc';
      const userID = parseInt(userId);
      const brandAddedBY = parseInt(brandAddedBy);

      // Parse categoryIds string into an array of integers
      // const categoryIdsArray = categoryIds.split(',').map((id: string) => parseInt(id.trim()));

      let whereCondition: any = {
        productType: 'P',
        status: 'ACTIVE',
        productName: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        categoryId: categoryIds
          ? {
              in: categoryIds.split(',').map((id) => parseInt(id.trim())),
            }
          : undefined,
        brandId: brandIds
          ? {
              in: brandIds.split(',').map((id) => parseInt(id.trim())),
            }
          : undefined,
        brand: {
          brandType: 'ADMIN',
          // addedBy: { not: brandAddedBY } // Exclude products where the brand's addedBy does not match addedBY
        },
      };

      if (priceMin && priceMax) {
        whereCondition.offerPrice = {
          gte: parseFloat(priceMin),
          lte: parseFloat(priceMax),
        };
      }

      let productDetailList = await prisma.product.findMany({
        where: whereCondition,
        include: {
          category: { where: { status: 'ACTIVE' } },
          brand: { where: { status: 'ACTIVE' } },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          productImages: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_wishlist: {
            where: { userId: userID },
            select: {
              userId: true,
              productId: true,
            },
          },
          product_productPrice: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productPrice_productSellerImage: true,
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
                      companyName: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              offerPrice: 'asc',
            },
            take: 1, // Limit the result to only 1 row
          },
        },
        orderBy: { createdAt: sortType },
        skip, // Offset
        take: pageSize, // Limit
      });

      let productDetailListCount = await prisma.product.count({
        where: whereCondition,
      });

      if (!productDetailList) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
        };
      }

      productDetailList.forEach((product) => {
        if (product.productReview.length > 0) {
          const totalRating = product.productReview.reduce(
            (acc, review) => acc + (review.rating || 0),
            0,
          );
          (product as any).averageRating = Math.floor(
            totalRating / product.productReview.length,
          );
        } else {
          (product as any).averageRating = 0; // Set default value if no reviews
        }
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: productDetailList,
        totalCount: productDetailListCount,
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error in getAllProduct',
        error: error.message,
      };
    }
  }

  // relatedProduct list for global
  async relatedAllProduct(
    page: any,
    limit: any,
    tagIds: any,
    userId: any,
    productId: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      const sortType = 'desc';
      const userID = parseInt(userId);
      const productID = parseInt(productId);

      if (!productID) {
        return {
          status: false,
          message: 'productId is required!',
          data: [],
          totalCount: 0,
        };
      }

      // Parse tagIds string into an array of integers
      const tagIdsArray = tagIds
        .split(',')
        .map((id: string) => parseInt(id.trim()));

      let whereCondition: any = {
        id: {
          not: productID,
        },
        productType: 'P',
        status: 'ACTIVE',
        productTags: {
          some: {
            tagId: {
              in: tagIdsArray,
            },
          },
        },
      };

      let productDetailList = await prisma.product.findMany({
        where: whereCondition,
        include: {
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          productImages: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_wishlist: {
            where: { userId: userID },
            select: {
              userId: true,
              productId: true,
            },
          },
          product_productPrice: {
            where: {
              status: 'ACTIVE',
              // askForPrice: 'false',
              // askForStock: 'false'
            },
            include: {
              productPrice_productSellerImage: true,
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
                      companyName: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              offerPrice: 'asc',
            },
            take: 1, // Limit the result to only 1 row
          },
        },
        orderBy: { createdAt: sortType },
        skip, // Offset
        take: pageSize, // Limit
      });

      let productDetailListCount = await prisma.product.count({
        where: whereCondition,
      });

      if (!productDetailList) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
        };
      }

      productDetailList.forEach((product) => {
        if (product.productReview.length > 0) {
          const totalRating = product.productReview.reduce(
            (acc, review) => acc + (review.rating || 0),
            0,
          );
          (product as any).averageRating = Math.floor(
            totalRating / product.productReview.length,
          );
        } else {
          (product as any).averageRating = 0; // Set default value if no reviews
        }
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: productDetailList,
        totalCount: productDetailListCount,
      };
    } catch (error) {
      console.log('error:: ', error);

      return {
        status: false,
        message: 'error in relatedAllProduct',
        error: error.message,
      };
    }
  }

  // sameBrand Product list for global
  async sameBrandAllProduct(
    page: any,
    limit: any,
    req: any,
    brandIds: any,
    userId: any,
    productId: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      const sortType = 'desc';
      const userID = parseInt(userId);
      const productID = parseInt(productId);

      if (!productID) {
        return {
          status: false,
          message: 'productId is required!',
          data: [],
          totalCount: 0,
        };
      }

      let whereCondition: any = {
        id: {
          not: productID,
        },
        productType: 'P',
        status: 'ACTIVE',
        brandId: brandIds
          ? {
              in: brandIds.split(',').map((id) => parseInt(id.trim())),
            }
          : undefined,
      };

      let productDetailList = await prisma.product.findMany({
        where: whereCondition,
        include: {
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          productImages: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_wishlist: {
            where: { userId: userID },
            select: {
              userId: true,
              productId: true,
            },
          },
          product_productPrice: {
            where: {
              status: 'ACTIVE',
              // askForPrice: 'false',
              // askForStock: 'false'
            },
            include: {
              productPrice_productSellerImage: true,
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
                      companyName: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              offerPrice: 'asc',
            },
            take: 1, // Limit the result to only 1 row
          },
        },
        orderBy: { createdAt: sortType },
        skip, // Offset
        take: pageSize, // Limit
      });

      let productDetailListCount = await prisma.product.count({
        where: whereCondition,
      });

      if (!productDetailList) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
        };
      }

      productDetailList.forEach((product) => {
        if (product.productReview.length > 0) {
          const totalRating = product.productReview.reduce(
            (acc, review) => acc + (review.rating || 0),
            0,
          );
          (product as any).averageRating = Math.floor(
            totalRating / product.productReview.length,
          );
        } else {
          (product as any).averageRating = 0; // Set default value if no reviews
        }
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: productDetailList,
        totalCount: productDetailListCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in sameBrandAllProduct',
        error: error.message,
      };
    }
  }

  // Review Product by user
  async addProductReview(payload: any, req: any) {
    try {
      const productId = payload?.productId;
      const userId = req?.user?.id;

      let addProductReview = await prisma.productReview.create({
        data: {
          userId: userId,
          productId: productId,
          title: payload?.title,
          description: payload?.description,
          rating: payload?.rating,
        },
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: addProductReview,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in addProductReview',
        error: error.message,
      };
    }
  }

  async editProductReview(payload: any, req: any) {
    try {
      if (!payload?.productReviewId) {
        return {
          status: false,
          message: 'productReviewId cannot be empty',
          data: [],
        };
      }
      const productReviewId = payload?.productReviewId;
      let existOneProductReview = await prisma.productReview.findUnique({
        where: { id: productReviewId },
      });

      if (!existOneProductReview) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      let editProductReview = await prisma.productReview.update({
        where: { id: productReviewId },
        data: {
          title: payload?.title,
          description: payload?.description,
          rating: payload?.rating,
        },
      });

      return {
        status: true,
        message: 'Updated Successfully',
        data: editProductReview,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in editProductReview',
        error: error.message,
      };
    }
  }

  async getOneProductReview(productReviewId: any) {
    try {
      if (!productReviewId) {
        return {
          status: false,
          message: 'productReviewId cannot be empty',
          data: [],
        };
      }
      const productReviewID = parseInt(productReviewId);

      let getOneProductReview = await prisma.productReview.findUnique({
        where: { id: productReviewID },
      });

      if (!getOneProductReview) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getOneProductReview,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in getOneProductReview',
        error: error.message,
      };
    }
  }

  async getAllProductReview(
    page: any,
    limit: any,
    productId: any,
    sortType: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let productID = parseInt(productId);
      let sort = {};
      if (sortType == 'highest') {
        sort = { rating: 'desc' };
      } else if (sortType == 'lowest') {
        sort = { rating: 'asc' };
      } else {
        sort = { createdAt: 'desc' };
      }

      let getAllProductReview = await prisma.productReview.findMany({
        where: {
          productId: productID,
          status: 'ACTIVE',
        },
        include: {
          reviewByUserDetail: {
            select: { firstName: true, lastName: true, profilePicture: true },
          },
        },
        orderBy: sort,
        skip, // Offset
        take: pageSize, // Limit
      });

      let getAllProductReviewCount = await prisma.productReview.count({
        where: {
          productId: productID,
          status: 'ACTIVE',
        },
      });

      if (!getAllProductReview) {
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
        data: getAllProductReview,
        totalcount: getAllProductReviewCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in getAllProductReview',
        error: error.message,
      };
    }
  }

  async getAllProductReviewBySellerId(
    page: any,
    limit: any,
    req: any,
    sortType: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      const sellerId = req?.user?.id;

      let sort = {};
      if (sortType == 'highest') {
        sort = { rating: 'desc' };
      } else if (sortType == 'lowest') {
        sort = { rating: 'asc' };
      } else {
        sort = { createdAt: 'desc' };
      }

      let getAllProductReview = await prisma.productReview.findMany({
        where: {
          status: 'ACTIVE',
          productReview_product: {
            userId: sellerId,
          },
        },
        include: {
          productReview_product: {
            include: {
              productImages: true,
            },
          },
          reviewByUserDetail: {
            select: { firstName: true, lastName: true, profilePicture: true },
          },
        },
        orderBy: sort,
        skip, // Offset
        take: pageSize, // Limit
      });

      if (!getAllProductReview) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
        };
      }

      let getAllProductReviewCount = await prisma.productReview.count({
        where: {
          status: 'ACTIVE',
          productReview_product: {
            userId: sellerId,
          },
        },
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllProductReview,
        totalcount: getAllProductReviewCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in getAllProductReviewBySellerId',
      };
    }
  }

  // START Review Product Price By User
  async addProductPriceReview(payload: any, req: any) {
    try {
      const userId = req?.user?.id;

      let addProductPriceReview = await prisma.productPriceReview.create({
        data: {
          userId: userId,
          productPriceId: payload?.productPriceId,
          adminId: payload?.adminId,
          productId: payload?.productId,
          title: payload?.title,
          description: payload?.description,
          rating: payload?.rating,
        },
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: addProductPriceReview,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in addProductPriceReview',
        error: error.message,
      };
    }
  }

  async getOneProductPriceReview(productPriceReviewId: any) {
    try {
      const productPriceReviewID = parseInt(productPriceReviewId);
      if (!productPriceReviewID) {
        return {
          status: false,
          message: 'productPriceReviewId is required',
          data: [],
        };
      }
      let existProductPriceReview = await prisma.productPriceReview.findUnique({
        where: { id: productPriceReviewID },
      });
      if (!existProductPriceReview) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }
      return {
        status: true,
        message: 'Fetch Successfully',
        data: existProductPriceReview,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in getOneProductPriceReview',
        error: error.message,
      };
    }
  }

  async updateOneProductPriceReview(payload: any, req: any) {
    try {
      const productPriceReviewID = payload?.productPriceReviewId;
      if (!productPriceReviewID) {
        return {
          status: false,
          message: 'productPriceReviewId is required',
          data: [],
        };
      }
      let existProductPriceReview = await prisma.productPriceReview.findUnique({
        where: { id: productPriceReviewID },
      });
      if (!existProductPriceReview) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      let updatedProductPriceReview = await prisma.productPriceReview.update({
        where: { id: productPriceReviewID },
        data: {
          title: payload?.title || existProductPriceReview?.title,
          description: payload?.description || existProductPriceReview?.title,
          rating: payload?.rating || existProductPriceReview?.title,
        },
      });
      return {
        status: true,
        message: 'Fetch Successfully',
        data: updatedProductPriceReview,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in getOneProductPriceReview',
        error: error.message,
      };
    }
  }

  async getAllProductPriceReviewBySellerId(
    page: any,
    limit: any,
    sellerId: any,
    sortType: any,
  ) {
    try {
      const sellerID = parseInt(sellerId);
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let sort = {};
      if (sortType == 'highest') {
        sort = { rating: 'desc' };
      } else if (sortType == 'lowest') {
        sort = { rating: 'asc' };
      } else {
        sort = { createdAt: 'desc' };
      }

      let whereCondition: any = {
        status: { in: ['ACTIVE'] },
        adminId: sellerID,
        // productPriceReview_productPrice: {
        //   some: {
        //     adminId: sellerID
        //   }
        // }
      };

      let getAllProductPriceReviewBySellerId =
        await prisma.productPriceReview.findMany({
          where: whereCondition,
          orderBy: sort,
          skip, // Offset
          take: pageSize, // Limit
        });
      let getAllProductPriceReviewBySellerIdCount =
        await prisma.productPriceReview.count({
          where: whereCondition,
        });

      if (!getAllProductPriceReviewBySellerId) {
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
        data: getAllProductPriceReviewBySellerId,
        totalCount: getAllProductPriceReviewBySellerIdCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in getAllProductPriceReviewBySellerId',
        error: error.message,
      };
    }
  }
  // END Review Product Price By User

  async askQuestion(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      const productId = payload?.productId;

      let askQuestion = await prisma.productQuestion.create({
        data: {
          productId: productId,
          question: payload?.question,
          questionByuserId: userId,
        },
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: askQuestion,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in askQuestion',
        error: error.message,
      };
    }
  }

  async getAllQuestion(
    page: any,
    limit: any,
    productId: any,
    sortType: any,
    userType: any,
    req: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let productID = parseInt(productId);
      let sort = {};
      if (sortType == 'oldest') {
        sort = { createdAt: 'asc' };
      } else {
        sort = { createdAt: 'desc' };
      }

      let tradeRole;
      if (userType === 'VENDOR') {
        //  VENDOR
        tradeRole = ['COMPANY', 'FREELANCER'];
      } else if (userType === 'CUSTOMER') {
        // CUSTOMER
        tradeRole = ['BUYER'];
      } else {
        // For All
        tradeRole = ['COMPANY', 'FREELANCER', 'BUYER'];
      }

      let whereCondition: any = {
        productId: productID,
        status: 'ACTIVE',
        questionByuserIdDetail: {
          tradeRole: { in: tradeRole }, // Move filtering inside the relation
        },
      };

      let getAllQuestion = await prisma.productQuestion.findMany({
        where: whereCondition,
        include: {
          questionByuserIdDetail: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              tradeRole: true,
            },
          },
          productQuestionAnswerDetail: {
            include: {
              answerByUserDetail: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                },
              },
            },
          },
        },
        orderBy: sort,
        skip, // Offset
        take: pageSize, // Limit
      });

      let getAllQuestionCount = await prisma.productQuestion.count({
        where: whereCondition,
      });

      if (!getAllQuestion) {
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
        data: getAllQuestion,
        totalcount: getAllQuestionCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in getAllQuestion',
        error: error.message,
      };
    }
  }

  // old method
  async giveAnswer_old(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      const productQuestionId = payload?.productQuestionId;

      let existQuestion = await prisma.productQuestion.findUnique({
        where: { id: productQuestionId },
      });

      if (!existQuestion) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      let giveAnswer = await prisma.productQuestion.update({
        where: { id: productQuestionId },
        data: {
          answer: payload?.answer,
          answerByuserId: userId,
        },
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: giveAnswer,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in giveAnswer',
        error: error.message,
      };
    }
  }

  async giveAnswer(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      const productQuestionId = payload?.productQuestionId;

      let giveAnswer = await prisma.productQuestionAnswer.create({
        data: {
          productId: payload?.productId,
          productQuestionId: productQuestionId,
          answer: payload?.answer,
          answerByuserId: userId,
        },
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: giveAnswer,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in giveAnswer',
        error: error.message,
      };
    }
  }

  // RFQ Products
  // No More in use
  async addRfqProduct(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      const adminId = payload?.adminId || undefined;

      let addRfqProduct = await prisma.rFQProduct.create({
        data: {
          adminId: userId,
          userId: userId,
          type: 'R',
          productNote: payload?.productNote,
          rfqProductName: payload?.rfqProductName,
        },
      });

      if (
        payload.rfqProductImagesList &&
        payload.rfqProductImagesList.length > 0
      ) {
        for (let j = 0; j < payload.rfqProductImagesList.length; j++) {
          let rFQProductImages = await prisma.rFQProductImages.create({
            data: {
              rfqProductId: addRfqProduct.id,
              imageName: payload?.rfqProductImagesList[j]?.imageName,
              image: payload?.rfqProductImagesList[j]?.image,
            },
          });
        }
      }

      return {
        status: true,
        message: 'Created Successfully',
        data: addRfqProduct,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in addRfqProduct',
        error: error.message,
      };
    }
  }

  // No More in use
  async editRfqProduct(payload: any, req: any) {
    try {
      const rFqProductId = payload?.rFqProductId;

      let existRfqProduct = await prisma.rFQProduct.findUnique({
        where: { id: rFqProductId },
      });
      if (!existRfqProduct) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      let editRfqProduct = await prisma.rFQProduct.update({
        where: { id: rFqProductId },
        data: {
          productNote: payload?.productNote || existRfqProduct.productNote,
          rfqProductName:
            payload?.rfqProductName || existRfqProduct.rfqProductName,
        },
      });

      if (
        payload.rfqProductImagesList &&
        payload.rfqProductImagesList.length > 0
      ) {
        await prisma.rFQProductImages.deleteMany({
          where: { rfqProductId: rFqProductId },
        });
        for (let j = 0; j < payload.rfqProductImagesList.length; j++) {
          let addProductImages = await prisma.rFQProductImages.create({
            data: {
              rfqProductId: rFqProductId,
              imageName: payload?.rfqProductImagesList[j]?.imageName,
              image: payload?.rfqProductImagesList[j]?.image,
            },
          });
        }
      }

      return {
        status: true,
        message: 'Updated Successfully',
        data: [],
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in editRfqProduct',
        error: error.message,
      };
    }
  }

  // No More in use
  async getOneRfqProduct(rfqProductId: any) {
    try {
      const rfqProductID = parseInt(rfqProductId);

      let getOneRfqProduct = await prisma.rFQProduct.findUnique({
        where: { id: rfqProductID },
        include: {
          rfqProductImage: true,
          rfqProduct_product: {
            include: {
              productImages: true,
            },
          },
        },
      });

      if (!getOneRfqProduct) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getOneRfqProduct,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in getOneRfqProduct',
        error: error.message,
      };
    }
  }

  /**
   * --------- RFQ Product Listing
   */
  // In Use
  async getAllRfqProduct(
    page: any,
    limit: any,
    term: any,
    adminId: any,
    sortType: any,
    req: any,
    brandIds: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : '';
      const adminID = parseInt(adminId);
      const userID = adminID;
      let sort = {};
      if (sortType == 'oldest') {
        sort = { createdAt: 'asc' };
      } else {
        sort = { createdAt: 'desc' };
      }

      let productDuplicateRfq = await prisma.productDuplicateRfq.findMany({
        where: { userId: adminID },
        select: { productId: true },
      });

      let myProduct;
      if (req.query.isOwner == 'me') {
        myProduct = userID;
      } else {
        myProduct = undefined;
      }

      let where: Prisma.ProductWhereInput = {
        status: 'ACTIVE',
        typeOfProduct: 'BRAND',
        AND: [
          {
            OR: [
              { productType: 'P' },
              {
                AND: [{ productType: 'R' }, { userId: adminID }],
              },
            ],
          },
          {
            id: {
              notIn: productDuplicateRfq.map((entry) => entry.productId),
            },
          },
        ],
        productName: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        brandId: brandIds
          ? {
              in: brandIds.split(',').map((id) => parseInt(id.trim())),
            }
          : undefined,
        adminId: myProduct,
        product_productPrice: {
          some: {
            sellType: 'NORMALSELL',
            status: 'ACTIVE',
            isCustomProduct: 'false',
          },
        },
      };

      let getAllRfqProduct = await prisma.product.findMany({
        where: where,
        include: {
          category: { where: { status: 'ACTIVE' } },
          brand: { where: { status: 'ACTIVE' } },
          placeOfOrigin: { where: { status: 'ACTIVE' } },
          productTags: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productTagsTag: true,
            },
          },
          productImages: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_rfqCart: {
            where: { userId: adminID },
            select: {
              userId: true,
              quantity: true,
            },
          },
          product_productPrice: {
            where: { status: 'ACTIVE' },
          },
          product_wishlist: {
            where: { userId: userID },
            select: {
              userId: true,
              productId: true,
            },
          },
        },
        orderBy: sort,
        skip,
        take: pageSize,
      });

      if (!getAllRfqProduct) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
        };
      }

      let getAllRfqProductCount = await prisma.product.count({
        where: where,
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllRfqProduct,
        totalCount: getAllRfqProductCount,
        productDuplicateRfq: productDuplicateRfq,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in getAllRfqProduct',
        error: error.message,
      };
    }
  }

  async rfqFindOne(productId: any, req: any, userId: any) {
    try {
      const productID = parseInt(productId);
      if (!productID) {
        return {
          status: false,
          message: 'productId is missing',
          data: [],
          totalCount: 0,
        };
      }
      let productDetail = await prisma.product.findUnique({
        where: { id: productID },
        include: {
          category: {
            where: { status: 'ACTIVE' },
            include: {
              category_dynamicFormCategory: {
                include: {
                  formIdDetail: {
                    include: {
                      elements: true,
                    },
                  },
                },
              },
            },
          },
          brand: { where: { status: 'ACTIVE' } },
          placeOfOrigin: { where: { status: 'ACTIVE' } },
          productTags: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productTagsTag: true,
            },
          },
          productImages: { where: { status: 'ACTIVE' } },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          product_productSpecification: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_productPrice: {
            where: { status: 'ACTIVE' },
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
                      companyName: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              offerPrice: 'asc',
            },
            take: 1, // Limit the result to only 1 row
          },
        },
      });
      if (!productDetail) {
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
        data: productDetail,
        totalCount: 1,
      };
    } catch (error) {
      console.log('rfqFindOne error: ', error);

      return {
        status: false,
        message: 'error in findOne product',
        error: error.message,
      };
    }
  }

  async addProductDuplicateRfq(payload: any, req: any) {
    try {
      const userId = payload?.userId || req?.user?.id;

      let addProductDuplicateRfq = await prisma.productDuplicateRfq.create({
        data: {
          adminId: userId,
          userId: userId,
          productId: payload?.productId,
        },
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: addProductDuplicateRfq,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in addProductDuplicateRfq',
        error: error.message,
      };
    }
  }

  // testing purpose api
  async allCompanyFreelancer(payload: any, req: any) {
    try {
      // for (let i=0; i<payload.rfqCartIds.length; i++) {
      //   let cartDetails = await prisma.rFQCart.findUnique({
      //     where: { id: payload.rfqCartIds[i] },
      //     select: { id: true, productId: true, quantity: true }
      //   });
      //   console.log('cartDetails.id', cartDetails.id);
      // };

      // let deleteCart = await prisma.rFQCart.deleteMany({
      //   where: {
      //     id: { in: payload.rfqCartIds }
      //   }
      // })

      const userId = req?.user?.id;
      let allUserList = await prisma.user.findMany({
        where: {
          id: {
            not: userId,
          },
          userType: 'USER',
          status: 'ACTIVE',
          tradeRole: { in: ['COMPANY', 'FREELANCER'] },
        },
        select: {
          id: true,
        },
        orderBy: { id: 'asc' },
      });

      if (!allUserList) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      return {
        status: false,
        message: 'Fetch Successfully',
        data: {
          allUser: allUserList,
          allUserCount: allUserList.length,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in allCompanyFreelancer',
        error: error.message,
      };
    }
  }

  async addRfqQuotes(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      let totalPrice = 0;
      let rfqProductList = [];
      let allUserList = await prisma.user.findMany({
        where: {
          id: {
            not: userId,
          },
          userType: 'USER',
          status: 'ACTIVE',
          tradeRole: { in: ['COMPANY', 'FREELANCER'] },
        },
        select: {
          id: true,
        },
      });

      for (let i = 0; i < payload.rfqCartIds.length; i++) {
        let rfqCartDetail = await prisma.rFQCart.findUnique({
          where: { id: payload.rfqCartIds[i] },
          select: {
            productId: true,
            quantity: true,
            offerPrice: true,
            note: true,
            offerPriceFrom: true,
            offerPriceTo: true,
          },
        });

        let rfqProductDetails = await prisma.product.findUnique({
          where: { id: rfqCartDetail.productId },
          select: { id: true, offerPrice: true, userId: true },
        });

        let tempProductDetails = {
          productId: rfqProductDetails.id,
          quantity: rfqCartDetail?.quantity,
          offerPrice: rfqCartDetail?.offerPrice, // now not in use
          note: rfqCartDetail?.note,
          offerPriceFrom: rfqCartDetail?.offerPriceFrom,
          offerPriceTo: rfqCartDetail?.offerPriceTo,
        };
        rfqProductList.push(tempProductDetails);

        // calculate cart total
        const totalPriceForProduct =
          rfqCartDetail.quantity *
            parseFloat(rfqCartDetail.offerPriceTo.toString()) || 1;
        totalPrice += totalPriceForProduct; // we are calculating offerPriceTo
      }

      // create rfq Quote Address
      let rfqQuotesAddress = await prisma.rfqQuoteAddress.create({
        data: {
          userId: userId,
          firstName: payload?.firstName,
          lastName: payload?.lastName,
          phoneNumber: payload?.phoneNumber,
          cc: payload?.cc,
          address: payload?.address,
          city: payload?.city,
          province: payload?.province,
          country: payload?.country,
          postCode: payload?.postCode,
          rfqDate: new Date(payload?.rfqDate),
        },
      });

      // create rfq Quote
      let rfqQuotes = await prisma.rfqQuotes.create({
        data: {
          buyerID: userId,
          rfqQuoteAddressId: rfqQuotesAddress.id,
        },
      });

      // create rfq Quotes Product
      for (let i = 0; i < rfqProductList.length; i++) {
        let rfqQuotesProducts = await prisma.rfqQuotesProducts.create({
          data: {
            rfqQuotesId: rfqQuotes.id,
            rfqProductId: rfqProductList[i].productId,
            offerPrice: rfqProductList[i]?.offerPrice,
            note: rfqProductList[i]?.note,
            quantity: rfqProductList[i]?.quantity,
            offerPriceFrom: rfqProductList[i]?.offerPriceFrom,
            offerPriceTo: rfqProductList[i]?.offerPriceTo,
          },
        });
      }

      for (let j = 0; j < allUserList.length; j++) {
        let rfqQuotesUsers = await prisma.rfqQuotesUsers.create({
          data: {
            rfqQuotesId: rfqQuotes.id,
            buyerID: userId,
            sellerID: allUserList[j].id,
            offerPrice: payload?.offerPrice || totalPrice || undefined,
            // offerPrice: payload?.offerPrice !== undefined ? payload.offerPrice : (totalPrice !== undefined ? totalPrice : undefined)
          },
        });
      }
      // const createRfqQuotesUsersPromises = allUserList.map(user => {
      //   return prisma.rfqQuotesUsers.create({
      //     data: {
      //       rfqQuotesId: rfqQuotes.id,
      //       buyerID: userId,
      //       sellerID: user.id,
      //       offerPrice: payload?.offerPrice || undefined
      //     }
      //   });
      // });
      // await Promise.all(createRfqQuotesUsersPromises);

      let deleteCart = await prisma.rFQCart.deleteMany({
        where: {
          id: { in: payload.rfqCartIds },
        },
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: [],
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error, in addRfqQuotes',
        error: error.message,
      };
    }
  }

  async getAllRfqQuotesByBuyerID(page: any, limit: any, req: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset

      // const buyerID = req?.user?.id;
      let buyerID = req?.user?.id;
      let adminDetail = await prisma.user.findUnique({
        where: { id: buyerID },
        select: {
          id: true,
          tradeRole: true,
          addedBy: true,
        },
      });
      if (adminDetail && adminDetail.tradeRole === 'MEMBER') {
        buyerID = adminDetail.addedBy;
      }
      console.log('admin_id: ', buyerID);

      let getAllRfqQuotes = await prisma.rfqQuotes.findMany({
        where: {
          status: 'ACTIVE',
          buyerID: buyerID,
        },
        include: {
          rfqQuotes_rfqQuoteAddress: true,
          rfqQuotesProducts: {
            include: {
              rfqProductDetails: {
                include: {
                  productImages: true,
                },
              },
            },
          },
        },
        skip,
        take: pageSize,
      });

      if (!getAllRfqQuotes) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      let getAllRfqQuotesCount = await prisma.rfqQuotes.count({
        where: {
          status: 'ACTIVE',
          buyerID: buyerID,
        },
      });

      return {
        status: true,
        message: 'Not Found',
        data: getAllRfqQuotes,
        totalCount: getAllRfqQuotesCount,
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error, in getAllRfqQuotes',
        error: error.message,
      };
    }
  }

  async deleteOneRfqQuote(rfqQuotesId: any, req: any) {
    try {
      const rfqQuotesID = parseInt(rfqQuotesId);
      let existRfqQuote = await prisma.rfqQuotes.findUnique({
        where: { id: rfqQuotesID },
      });
      if (!existRfqQuote) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      let deleteRfqQuote = await prisma.rfqQuotes.update({
        where: { id: rfqQuotesID },
        data: {
          status: 'DELETE',
          deletedAt: new Date(),
        },
      });

      return {
        status: true,
        message: 'Deleted Successfully',
        data: deleteRfqQuote,
      };
    } catch (error) {
      // console.log('error: ', error);
      return {
        status: false,
        message: 'error, in deleteOneRfqQuote',
        error: error.message,
      };
    }
  }

  async getAllRfqQuotesUsersByBuyerID(
    page: any,
    limit: any,
    req: any,
    rfqQuotesId: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      const buyerID = req?.user?.id;
      const rfqQuotesID = parseInt(rfqQuotesId);

      let getAllRfqQuotesUsersByBuyerID = await prisma.rfqQuotesUsers.findMany({
        where: {
          status: 'ACTIVE',
          buyerID: buyerID,
          rfqQuotesId: rfqQuotesID,
        },
        include: {
          sellerIDDetail: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              cc: true,
              phoneNumber: true,
              profilePicture: true,
            },
          },
          rfqQuotesUser_rfqQuotes: {
            include: {
              rfqQuotesProducts: {
                include: {
                  rfqProductDetails: {
                    include: {
                      productImages: true,
                    },
                  },
                },
              },
            },
          },
          // rfqQuotesUser_rfqQuotes: {
          //   include: {
          //     rfqQuotes_rfqQuoteAddress: true,
          //     rfqQuotesProducts: {
          //       include: {
          //         rfqProductDetails: true
          //       }
          //     }
          //   }
          // }
        },
      });

      if (!getAllRfqQuotesUsersByBuyerID) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      const usersWithUnreadMessages = await Promise.all(
        getAllRfqQuotesUsersByBuyerID.map(async (user) => {
          const rooms = await prisma.roomParticipants.findMany({
            where: {
              userId: user.sellerID,
            },
            select: {
              roomId: true,
            },
          });

          const unreadMessagesCount = await prisma.message.count({
            where: {
              userId: user.sellerID,
              status: 'UNREAD',
              roomId: {
                in: rooms.map((room) => room.roomId),
              },
            },
          });

          const lastUnreadMessage = await prisma.message.findFirst({
            where: {
              rfqQuotesUserId: user.id,
              roomId: {
                in: rooms.map((room) => room.roomId),
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              content: true,
              status: true,
              createdAt: true,
              roomId: true,
              userId: true,
            },
          });

          const rfqProductPriceRequests =
            await prisma.rfqQuoteProductPriceRequest.findMany({
              where: {
                rfqQuoteId: user.rfqQuotesId,
                rfqQuotesUserId: user.id,
                status: 'APPROVED',
              },
              orderBy: {
                id: 'desc',
              },
              select: {
                id: true,
                requestedPrice: true,
                rfqQuoteProductId: true,
                status: true,
                requestedBy: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
                requestedById: true,
                updatedAt: true,
              },
            });

          return {
            ...user,
            rfqProductPriceRequests,
            unreadMsgCount: unreadMessagesCount || 0,
            lastUnreadMessage: lastUnreadMessage || null,
          };
        }),
      );

      usersWithUnreadMessages.sort((a, b) => {
        const dateA = a.lastUnreadMessage?.createdAt
          ? new Date(a.lastUnreadMessage.createdAt).getTime()
          : 0;
        const dateB = b.lastUnreadMessage?.createdAt
          ? new Date(b.lastUnreadMessage.createdAt).getTime()
          : 0;
        return dateB - dateA;
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: usersWithUnreadMessages,
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error, in getAllRfqQuotes',
        error: error.message,
      };
    }
  }

  async getOneRfqQuotesUsersByBuyerID(req: any, rfqQuotesId: any) {
    try {
      const buyerID = req?.user?.id;
      const rfqQuotesID = parseInt(rfqQuotesId);

      let getOneRfqQuotes = await prisma.rfqQuotes.findUnique({
        where: {
          id: rfqQuotesID,
          buyerID: buyerID,
        },
        include: {
          rfqQuotes_rfqQuoteAddress: true,
          rfqQuotesProducts: {
            include: {
              rfqProductDetails: {
                include: {
                  productImages: true,
                },
              },
            },
          },
        },
      });

      if (!getOneRfqQuotes) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getOneRfqQuotes,
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error, in getOneRfqQuotesUsersByBuyerID',
        error: error.message,
      };
    }
  }

  async getAllRfqQuotesUsersBySellerID(page: any, limit: any, req: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset

      // const sellerID = req?.user?.id;
      let sellerID = req?.user?.id;
      let adminDetail = await prisma.user.findUnique({
        where: { id: sellerID },
        select: { id: true, tradeRole: true, addedBy: true },
      });
      if (adminDetail && adminDetail.tradeRole === 'MEMBER') {
        sellerID = adminDetail.addedBy;
      }
      console.log('admin_id: ', sellerID);

      // sellerID = await this.helperService.getAdminId(sellerID);

      let getAllRfqQuotesUsersBySellerID = await prisma.rfqQuotesUsers.findMany(
        {
          where: {
            status: 'ACTIVE',
            sellerID: sellerID,
            rfqQuotesId: {
              not: null,
            },
          },
          include: {
            buyerIDDetail: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                cc: true,
                phoneNumber: true,
                profilePicture: true,
              },
            },
            rfqQuotesUser_rfqQuotes: {
              include: {
                rfqQuotes_rfqQuoteAddress: true,
                rfqQuotesProducts: {
                  include: {
                    rfqProductDetails: {
                      include: {
                        productImages: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      );

      if (!getAllRfqQuotesUsersBySellerID) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      const usersWithUnreadMessages = await Promise.all(
        getAllRfqQuotesUsersBySellerID.map(async (user) => {
          const rooms = await prisma.roomParticipants.findMany({
            where: {
              userId: user.buyerID,
            },
            select: {
              roomId: true,
            },
          });

          const unreadMessagesCount = await prisma.message.count({
            where: {
              userId: user.buyerID,
              status: 'UNREAD',
              roomId: {
                in: rooms.map((room) => room.roomId),
              },
            },
          });

          const lastUnreadMessage = await prisma.message.findFirst({
            where: {
              rfqQuotesUserId: user.id,
              roomId: {
                in: rooms.map((room) => room.roomId),
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              content: true,
              status: true,
              createdAt: true,
              roomId: true,
              userId: true,
            },
          });

          let rfqProductPriceRequests = [];
          if (user?.rfqQuotesId) {
            rfqProductPriceRequests =
              await prisma.rfqQuoteProductPriceRequest.findMany({
                where: {
                  rfqQuoteId: user.rfqQuotesId,
                  rfqQuotesUserId: user.id,
                  status: 'APPROVED',
                },
                orderBy: {
                  id: 'desc',
                },
                select: {
                  id: true,
                  requestedPrice: true,
                  rfqQuoteProductId: true,
                  status: true,
                  requestedBy: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                  requestedById: true,
                  updatedAt: true,
                },
              });
          }

          return {
            ...user,
            rfqProductPriceRequests,
            unreadMsgCount: unreadMessagesCount || 0,
            lastUnreadMessage: lastUnreadMessage || null,
          };
        }),
      );

      usersWithUnreadMessages.sort((a, b) => {
        const dateA = a.lastUnreadMessage?.createdAt
          ? new Date(a.lastUnreadMessage.createdAt).getTime()
          : 0;
        const dateB = b.lastUnreadMessage?.createdAt
          ? new Date(b.lastUnreadMessage.createdAt).getTime()
          : 0;
        return dateB - dateA;
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: usersWithUnreadMessages,
        selectedAdminId: sellerID,
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error, in getAllRfqQuotes',
        error: error.message,
      };
    }
  }

  // ---- **** CUSTOM FIELD FOR PRODUCT BEGINS **** ----
  async createCustomFieldValue(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      let addCustomField = await prisma.customField.create({
        data: {
          formData: payload.form,
          formName: payload.formName,
          adminId: userId,
          userId: userId,
          productId: payload.productId,
        },
      });

      if (
        payload?.customFieldValueList &&
        payload?.customFieldValueList.length > 0
      ) {
        for (let i = 0; i < payload?.customFieldValueList.length; i++) {
          let addCustomFieldValue = await prisma.customFieldValue.create({
            data: {
              adminId: userId,
              userId: userId,
              formId: addCustomField.id,
              keyName: payload?.customFieldValueList[i].keyName,
              value: payload?.customFieldValueList[i].value,
            },
          });
        }
      }

      return {
        status: true,
        message: 'Created Successfully',
        data: addCustomField,
      };
    } catch (error) {
      console.log('error: ', error);
      return {
        status: false,
        message: 'error, in createCustomFieldValue',
        error: error.message,
      };
    }
  }

  /* ----------------------------------------------------------- Factories Product -------------------------------------------------------  */

  // general Factories product listing
  async getAllFactoriesProduct(
    page: any,
    limit: any,
    term: any,
    adminId: any,
    sortType: any,
    req: any,
    brandIds: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : '';
      const adminID = parseInt(adminId);
      const userID = adminID;
      // console.log('adminID: ', adminID);
      let sort = {};
      if (sortType == 'oldest') {
        sort = { createdAt: 'asc' };
      } else {
        sort = { createdAt: 'desc' };
      }

      let myProduct;
      if (req.query.isOwner == 'me') {
        myProduct = userID;
      } else {
        myProduct = undefined;
      }

      let where: Prisma.ProductWhereInput = {
        productType: {
          in: ['P'],
        },
        status: 'ACTIVE',
        productName: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        product_productPrice: {
          some: {
            isCustomProduct: 'true',
            status: 'ACTIVE',
          },
        },
        brandId: brandIds
          ? {
              in: brandIds.split(',').map((id) => parseInt(id.trim())),
            }
          : undefined,
        adminId: myProduct,
      };

      let getAllFactoriesProduct = await prisma.product.findMany({
        where: where,
        include: {
          category: { where: { status: 'ACTIVE' } },
          brand: { where: { status: 'ACTIVE' } },
          placeOfOrigin: { where: { status: 'ACTIVE' } },
          productTags: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productTagsTag: true,
            },
          },
          productImages: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_sellCountry: { where: { status: 'ACTIVE' } },
          product_sellState: { where: { status: 'ACTIVE' } },
          product_sellCity: { where: { status: 'ACTIVE' } },
          product_wishlist: {
            where: { userId: userID },
            select: {
              userId: true,
              productId: true,
            },
          },
          product_productPrice: {
            where: {
              status: 'ACTIVE',
            },
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
                      companyName: true,
                    },
                  },
                },
              },
            },
            // orderBy: {
            //   offerPrice: 'asc'
            // },
            // take: 1 // Limit the result to only 1 row
          },
        },
        orderBy: sort,
        skip,
        take: pageSize,
      });

      if (!getAllFactoriesProduct) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
          totalCount: 0,
        };
      }

      let getAllFactoriesProductCount = await prisma.product.count({
        where: where,
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllFactoriesProduct,
        totalCount: getAllFactoriesProductCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in getAllRfqProduct',
        error: error.message,
      };
    }
  }

  async addProductDuplicateFactories(payload: any, req: any) {
    try {
      const adminId = req?.user?.id;
      const userId = payload?.userId || req?.user?.id;
      const ID = parseInt(payload?.productId);

      let findProduct = await prisma.product.findUnique({
        where: {
          id: ID,
        },
        include: {
          category: {
            where: { status: 'ACTIVE' },
            include: {
              category_dynamicFormCategory: {
                include: {
                  formIdDetail: {
                    include: {
                      elements: true,
                    },
                  },
                },
              },
            },
          },
          brand: { where: { status: 'ACTIVE' } },
          placeOfOrigin: { where: { status: 'ACTIVE' } },
          productTags: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productTagsTag: true,
            },
          },
          productImages: { where: { status: 'ACTIVE' } },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          product_productSpecification: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_productPrice: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productPrice_productSellerImage: true,
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
                      companyName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!findProduct) {
        return {
          status: false,
          message: 'Product not found',
        };
      }

      // Construct new lists
      let productTagList = findProduct.productTags.map((tag) => ({
        tagId: tag.tagId,
      }));
      let productImagesList = findProduct.productImages.map((img) => ({
        imageName: img?.image,
        image: img?.image,
        videoName: img?.videoName,
        video: img?.video,
      }));
      let productShortDescriptionList =
        findProduct.product_productShortDescription.map((desc) => ({
          shortDescription: desc.shortDescription || '',
        }));
      let productPriceList = findProduct.product_productPrice.map((price) => ({
        productPrice: price.productPrice,
        offerPrice: price.offerPrice,
        status: 'ACTIVE',
        stock: price.stock || undefined,
        deliveryAfter: price.deliveryAfter || undefined,
        timeOpen: price.timeOpen || undefined,
        timeClose: price.timeClose || undefined,
        consumerType: price.consumerType || undefined,
        sellType: price.sellType || undefined,
        vendorDiscount: price.vendorDiscount || undefined,
        consumerDiscount: price.consumerDiscount || undefined,
        minQuantity: price.minQuantity || undefined,
        maxQuantity: price.maxQuantity || undefined,
        productCondition: price.productCondition || undefined,
        minCustomer: price.minCustomer || undefined,
        maxCustomer: price.maxCustomer || undefined,
        minQuantityPerCustomer: price.minQuantityPerCustomer || undefined,
        maxQuantityPerCustomer: price.maxQuantityPerCustomer || undefined,
        askForStock: price.askForStock || undefined,
        askForPrice: price.askForPrice || undefined,
      }));
      let productSpecificationList =
        findProduct.product_productSpecification.map((spec) => ({
          label: spec.label || '',
          specification: spec.specification || '',
        }));

      // Create a new product in the database
      let newProduct = await prisma.product.create({
        data: {
          adminId: userId,
          userId: userId,
          productName: findProduct.productName,
          productType: 'F',
          typeOfProduct: findProduct.typeOfProduct,
          categoryId: findProduct.categoryId,
          categoryLocation: findProduct.categoryLocation,
          brandId: findProduct.brandId,
          placeOfOriginId: findProduct.placeOfOriginId,
          skuNo: new Date().toISOString(),
          description: findProduct.description,
          status: 'ACTIVE',
          productPrice: 0,
          offerPrice: 0,
        },
      });

      if (productTagList && productTagList.length > 0) {
        console.log('tag----1');

        for (let i = 0; i < productTagList.length; i++) {
          console.log('tag----2');
          let addProductTags = await prisma.productTags.create({
            data: {
              productId: newProduct.id,
              tagId: productTagList[i].tagId,
            },
          });
        }
      }

      if (productImagesList && productImagesList.length > 0) {
        console.log('images----1');

        for (let j = 0; j < productImagesList.length; j++) {
          let addProductImages = await prisma.productImages.create({
            data: {
              productId: newProduct.id,
              imageName: productImagesList[j]?.imageName,
              image: productImagesList[j]?.image,
              videoName: productImagesList[j]?.videoName,
              video: productImagesList[j]?.video,
            },
          });
        }
      }

      if (productPriceList && productPriceList.length > 0) {
        for (let k = 0; k < productPriceList.length; k++) {
          let addProductPrice = await prisma.productPrice.create({
            data: {
              productId: newProduct.id,
              adminId: userId,
              status: 'ACTIVE',
              productPrice: productPriceList[k].productPrice || 0,
              offerPrice: productPriceList[k].offerPrice || 0,
              stock: productPriceList[k].stock || undefined,
              deliveryAfter: productPriceList[k].deliveryAfter || undefined,
              timeOpen: productPriceList[k].timeOpen || undefined,
              timeClose: productPriceList[k].timeClose || undefined,
              consumerType: productPriceList[k].consumerType || undefined,
              sellType: productPriceList[k].sellType || undefined,
              vendorDiscount: productPriceList[k].vendorDiscount || undefined,
              consumerDiscount:
                productPriceList[k].consumerDiscount || undefined,
              minQuantity: productPriceList[k].minQuantity || undefined,
              maxQuantity: productPriceList[k].maxQuantity || undefined,
              productCondition:
                productPriceList[k].productCondition || undefined,
              minCustomer: productPriceList[k].minCustomer || undefined,
              maxCustomer: productPriceList[k].maxCustomer || undefined,
              minQuantityPerCustomer:
                productPriceList[k].minQuantityPerCustomer || undefined,
              maxQuantityPerCustomer:
                productPriceList[k].maxQuantityPerCustomer || undefined,
              askForStock: productPriceList[k]?.askForStock || 'false',
              askForPrice: productPriceList[k]?.askForPrice || 'false',
            },
          });

          try {
            const barcodeImageProductPrice =
              await this.generateBarcodeForProductPrice(
                addProductPrice.id.toString(),
                newProduct.id.toString(),
                adminId.toString(),
              );

            await prisma.productPrice.update({
              where: { id: addProductPrice.id },
              data: { productPriceBarcode: barcodeImageProductPrice },
            });
          } catch (error) {
            console.log(
              'error, in /product/create/barcodeImageProductPrice: ',
              error,
            );
          }
        }
      }

      if (
        productShortDescriptionList &&
        productShortDescriptionList.length > 0
      ) {
        for (let s = 0; s < productShortDescriptionList.length; s++) {
          let addProductImages = await prisma.productShortDescription.create({
            data: {
              productId: newProduct.id,
              adminId: userId,
              shortDescription:
                productShortDescriptionList[s]?.shortDescription,
            },
          });
        }
      }

      if (productSpecificationList && productSpecificationList.length > 0) {
        for (let i = 0; i < productSpecificationList.length; i++) {
          let addProductSpecifications =
            await prisma.productSpecification.create({
              data: {
                productId: newProduct.id,
                adminId: userId,
                label: productSpecificationList[i]?.label,
                specification: productSpecificationList[i]?.specification,
              },
            });
        }
      }

      // Generate the barcode for the product
      const barcodeImage = await this.generateBarcode(
        newProduct.id.toString(),
        newProduct.productName,
        newProduct?.skuNo || '',
      );

      // Save the barcode image URL or data to the product in the database
      await prisma.product.update({
        where: { id: newProduct.id },
        data: { barcode: barcodeImage }, // Assuming you have a 'barcode' field in your Product model
      });

      let addProductDuplicateFactories =
        await prisma.productDuplicateFactories.create({
          data: {
            adminId: userId,
            userId: userId,
            productId: payload?.productId,
          },
        });

      return {
        status: true,
        message: 'Created Successfully',
        data: addProductDuplicateFactories,
        newProduct: newProduct,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in addProductDuplicateFactories',
        error: error.message,
      };
    }
  }

  async addCustomizeProduct(payload: any, req: any) {
    try {
      const adminId = req.user.id;
      const quantity = payload.quantity;
      if (!payload.productId) {
        return {
          status: false,
          message: 'productId is required',
        };
      }
      const productId = parseInt(payload?.productId);

      let productDetail = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      let newCustomizeProduct = await prisma.customizeProduct.create({
        data: {
          sellerId: productDetail.adminId,
          buyerId: adminId,
          productId: productId,
          note: payload.note,
          fromPrice: payload.fromPrice,
          toPrice: payload.toPrice,
        },
      });

      // let customizeProductImages = [];
      // if (payload.customizeproductImageList && payload.customizeproductImageList.length > 0) {
      //   for (let i=0; i<payload.customizeproductImageList.length; i++) {
      //     let newCustomizeProductImage = await prisma.customizeProductImage.create({
      //       data: {
      //         productId: productId,
      //         customizeProductId: newCustomizeProduct.id,
      //         link: payload.customizeproductImageList[i].link,
      //         linkType: payload.customizeproductImageList[i].linkType
      //       }
      //     });

      //     customizeProductImages.push(newCustomizeProductImage);
      //   }
      // }
      let customizeProductImages = [];
      if (payload.customizeproductImageList?.length > 0) {
        customizeProductImages = await Promise.all(
          payload.customizeproductImageList.map((img) =>
            prisma.customizeProductImage.create({
              data: {
                productId: productId,
                customizeProductId: newCustomizeProduct.id,
                link: img.link,
                linkType: img.linkType,
              },
            }),
          ),
        );
      }

      // await prisma.factoriesCart.create({
      //   data: {
      //     userId: adminId || undefined,
      //     deviceId: undefined,
      //     productId: productId || undefined,
      //     customizeProductId: newCustomizeProduct.id || undefined,
      //     quantity: quantity > 0 ? quantity : 1 // Default to 1 if not provided
      //   }
      // })

      return {
        status: true,
        message: 'Created Successfully',
        data: {
          ...newCustomizeProduct,
          customizeProductImages,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: 'error, in addCustomizeProduct',
        error: error.message,
      };
    }
  }

  async createFactoriesRequest(payload, req) {
    try {
      const {
        address,
        city,
        province,
        postCode,
        country,
        firstName,
        lastName,
        phoneNumber,
        cc,
        factoriesCartIds,
        factoriesDate,
      } = payload;

      if (
        !factoriesCartIds ||
        !Array.isArray(factoriesCartIds) ||
        factoriesCartIds.length === 0
      ) {
        return {
          status: false,
          message: 'Invalid factoriesCartIds. It must be a non-empty array.',
        };
      }

      // Fetch all factoriesCart details in one query
      const factoriesCartDetails = await prisma.factoriesCart.findMany({
        where: { id: { in: factoriesCartIds } },
      });

      if (factoriesCartDetails.length !== factoriesCartIds.length) {
        return {
          status: false,
          message: 'One or more factoriesCartIds are invalid.',
        };
      }

      const userId = req.user?.id; // Assuming user ID is stored in req.user
      if (!userId) {
        return {
          status: false,
          message: 'User authentication required.',
        };
      }

      const createdRequests = await Promise.all(
        factoriesCartIds.map(async (factoriesCartId) => {
          let factoriesCartDetail = await prisma.factoriesCart.findUnique({
            where: {
              id: factoriesCartId,
            },
          });
          let customizeProductDetail = await prisma.customizeProduct.findUnique(
            {
              where: {
                id: factoriesCartDetail.customizeProductId,
              },
            },
          );
          return await prisma.factoriesRequest.create({
            data: {
              buyerId: userId,
              sellerId: customizeProductDetail.sellerId,
              productId: factoriesCartDetail.productId,
              customizeProductId: factoriesCartDetail.customizeProductId,
              quantity: factoriesCartDetail.quantity,
              fromPrice: customizeProductDetail.fromPrice,
              toPrice: customizeProductDetail.toPrice,
              address,
              city,
              province,
              postCode,
              country,
              firstName,
              lastName,
              phoneNumber,
              cc,
              factoriesDate: new Date(factoriesDate),
              status: 'ACTIVE',
            },
          });
        }),
      );

      await Promise.all(
        factoriesCartIds.map((cartId) =>
          prisma.factoriesCart.delete({ where: { id: cartId } }),
        ),
      );

      return {
        status: true,
        message: 'Factories requests created successfully.',
        data: createdRequests,
      };
    } catch (error) {
      console.error('Error in createFactoriesRequest:', error);
      return {
        status: false,
        message: 'Error in createFactoriesRequest API',
        error: error.message,
      };
    }
  }

  /* ---------------------------------------------------------- Buy Group Product --------------------------------------------------------  */

  async getAllBuyGroupProduct(
    page: any,
    limit: any,
    req: any,
    term: any,
    sort: any,
    brandIds: any,
    priceMin: any,
    priceMax: any,
    userId: any,
    categoryIds: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : '';
      const sortType = sort ? sort : 'desc';
      const userID = parseInt(userId);

      // Parse categoryIds string into an array of integers
      // const categoryIdsArray = categoryIds.split(',').map((id: string) => parseInt(id.trim()));

      let myProduct;
      if (req.query.isOwner == 'me') {
        myProduct = userID;
      } else {
        myProduct = undefined;
      }

      let whereCondition: any = {
        productType: {
          in: ['P'],
        },
        status: 'ACTIVE',
        productName: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        categoryId: categoryIds
          ? {
              in: categoryIds.split(',').map((id) => parseInt(id.trim())),
            }
          : undefined,
        brandId: brandIds
          ? {
              in: brandIds.split(',').map((id) => parseInt(id.trim())),
            }
          : undefined,
        product_productPrice: {
          some: {
            sellType: 'BUYGROUP',
            status: 'ACTIVE',
          },
        },
        adminId: myProduct,
      };

      if (priceMin && priceMax) {
        whereCondition.offerPrice = {
          gte: parseFloat(priceMin),
          lte: parseFloat(priceMax),
        };
      }

      let getAllBuyGroupProduct = await prisma.product.findMany({
        where: whereCondition,
        include: {
          category: { where: { status: 'ACTIVE' } },
          brand: { where: { status: 'ACTIVE' } },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          productImages: { where: { status: 'ACTIVE' } },
          productReview: {
            where: { status: 'ACTIVE' },
            select: {
              rating: true,
            },
          },
          product_wishlist: {
            where: { userId: userID },
            select: {
              userId: true,
              productId: true,
            },
          },
          product_productPrice: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              productPrice_productSellerImage: true,
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
                      companyName: true,
                    },
                  },
                },
              },
            },
          },
          product_sellCountry: { where: { status: 'ACTIVE' } },
          product_sellState: { where: { status: 'ACTIVE' } },
          product_sellCity: { where: { status: 'ACTIVE' } },
          orderProducts: true,
        },
        orderBy: { createdAt: sortType },
        skip, // Offset
        take: pageSize, // Limit
      });

      let getAllBuyGroupProductCount = await prisma.product.count({
        where: whereCondition,
      });

      if (!getAllBuyGroupProduct) {
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
        data: getAllBuyGroupProduct,
        totalCount: getAllBuyGroupProductCount,
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error in getAllBuyGroupProduct',
        error: error.message,
      };
    }
  }

  /* --------------------------------------------------------- Share Link Product -------------------------------------------------------  */

  async createSellerRewardProduct(payload: any, req: any) {
    try {
      // const userId = req?.user?.id;
      let userId = req?.user?.id;
      userId = await this.helperService.getAdminId(userId);
      console.log('admin_id: ', userId);

      const {
        productId,
        startTime,
        endTime,
        rewardPercentage,
        rewardFixAmount,
        minimumOrder,
        stock,
      } = req.body;

      let productDetail = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
        select: {
          id: true,
          adminId: true,
        },
      });
      if (userId != productDetail?.adminId) {
        return {
          status: false,
          message:
            'Cannot create reward, you are not the seller of the product',
          data: [],
        };
      }
      let existSellerReward = await prisma.sellerReward.findFirst({
        where: {
          productId: productId,
          adminId: userId,
        },
      });
      if (existSellerReward) {
        return {
          status: false,
          message: 'Seller Reward already added.',
          data: existSellerReward,
        };
      }

      let productPrice = await prisma.productPrice.findFirst({
        where: {
          productId: productId,
        },
        select: {
          id: true,
          stock: true,
        },
      });
      if (stock > productPrice.stock) {
        return {
          status: false,
          message: 'Reward Stock cannot be more than product stock',
          data: [],
        };
      }

      let newSellerReward = await prisma.sellerReward.create({
        data: {
          adminId: userId,
          productId: productId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          rewardPercentage: rewardPercentage,
          rewardFixAmount: rewardFixAmount,
          minimumOrder: minimumOrder,
          stock: stock,
        },
      });

      return {
        status: true,
        message: 'Seller Reward Added Successfully',
        data: newSellerReward,
        selectedAdminId: userId,
      };
    } catch (error) {
      console.log('error: ', error);
      return {
        status: false,
        message: 'error in createSharelinkProduct',
        error: error.message,
      };
    }
  }

  async getAllSellerReward(page: any, limit: any, term: any, req: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : '';
      const sortType = req.query.sortType ? req.query.sortType : 'desc';

      // const adminId = req.user.id; // owner/creator of the
      let adminId = req.user.id;
      adminId = await this.helperService.getAdminId(adminId);
      console.log('admin_id: ', adminId);

      let whereCondition: any = {
        status: 'ACTIVE',
        adminId: adminId,
        productId: req?.query?.productId
          ? parseInt(req.query.productId)
          : undefined,
      };

      let getAllSellerReward = await prisma.sellerReward.findMany({
        where: whereCondition,
        include: {
          productDetail: {
            include: {
              productImages: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
        orderBy: { createdAt: sortType },
        skip,
        take: pageSize,
      });

      let getAllSellerRewardCount = await prisma.sellerReward.count({
        where: whereCondition,
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllSellerReward,
        totalCount: getAllSellerRewardCount,
        selectedAdminId: adminId,
      };
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error, in getAllSellerReward',
        error: error.message,
      };
    }
  }

  /** --------------------------------------------------------- Generate Link Product --------------------------------------------------- */

  async generateLink(payload: any, req: any) {
    try {
      // const userId = req.user.id;
      let userId = req?.user?.id;
      userId = await this.helperService.getAdminId(userId);
      console.log('admin_id: ', userId);

      const { sellerRewardId, generatedLink } = req.body;

      let sellerRewardDetail = await prisma.sellerReward.findUnique({
        where: {
          id: parseInt(sellerRewardId),
        },
      });

      if (!sellerRewardDetail) {
        return {
          status: false,
          message: 'Not Found',
          data: [],
        };
      }

      let existGenerateLink = await prisma.sharedLink.findFirst({
        where: {
          sellerRewardId: sellerRewardId,
          productId: sellerRewardDetail.productId,
          linkGeneratedBy: userId,
        },
      });

      if (existGenerateLink) {
        return {
          status: false,
          message: 'Already Exist',
          data: existGenerateLink,
        };
      }

      let newGenerateLink = await prisma.sharedLink.create({
        data: {
          sellerRewardId: sellerRewardId,
          productId: sellerRewardDetail.productId,
          adminId: sellerRewardDetail.adminId,
          generatedLink: generatedLink,
          linkGeneratedBy: userId,
        },
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: newGenerateLink,
        selectedAdminId: userId,
      };
    } catch (error) {
      console.log('error generateLink: ', error);
      return {
        status: false,
        message: 'error, in generateLink',
        error: error.message,
      };
    }
  }

  async getAllGenerateLink(page: any, limit: any, term: any, req: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : '';
      const sortType = req.query.sortType ? req.query.sortType : 'desc';

      // const userId = req.user.id;
      let userId = req.user.id;
      userId = await this.helperService.getAdminId(userId);
      console.log('admin_id: ', userId);

      let whereCondition: any = {
        linkGeneratedBy: parseInt(userId),
        productId: req?.query?.productId
          ? parseInt(req.query.productId)
          : undefined,
      };

      let getAllGenerateLink = await prisma.sharedLink.findMany({
        where: whereCondition,
        include: {
          productDetail: {
            include: {
              productImages: { where: { status: 'ACTIVE' } },
            },
          },
        },
        orderBy: { createdAt: sortType },
        skip,
        take: pageSize,
      });

      let getAllGenerateLinkCount = await prisma.sharedLink.count({
        where: whereCondition,
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllGenerateLink,
        totalCount: getAllGenerateLinkCount,
        selectedAdminId: userId,
      };
    } catch (error) {
      console.log('error getAllGenerateLink: ', error);
      return {
        status: false,
        message: 'error, in getAllGenerateLink',
        error: error.message,
      };
    }
  }

  async getAllGenerateLinkBySellerRewardId(
    page: any,
    limit: any,
    term: any,
    req: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : '';
      const sortType = req.query.sortType ? req.query.sortType : 'desc';

      const sellerRewardId = req.query.sellerRewardId;

      let whereCondition: any = {
        sellerRewardId: parseInt(sellerRewardId),
        productId: req?.query?.productId
          ? parseInt(req.query.productId)
          : undefined,
      };

      let getGeneratedLink = await prisma.sharedLink.findMany({
        where: whereCondition,
        include: {
          linkGeneratedByDetail: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              tradeRole: true,
              userType: true,
              profilePicture: true,
              cc: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { createdAt: sortType },
        skip,
        take: pageSize,
      });

      let getAllGeneratedLinkCount = await prisma.sharedLink.count({
        where: whereCondition,
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getGeneratedLink,
        totalCount: getAllGeneratedLinkCount,
      };
    } catch (error) {
      console.log('error getAllGenerateLinkBySellerRewardId: ', error);
      return {
        status: false,
        message: 'error, in getAllGenerateLinkBySellerRewardId',
        error: error.message,
      };
    }
  }

  /***
   *  DELETE ALL PRODUCT ONLY USED BY BACKEND MANUALLY
   */
  async deleteProductFromBackend2(req: any) {
    try {
      let productIds = req.body.productIds;

      await prisma.productTags.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.productImages.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.cart.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.orderProducts.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });

      await prisma.productReview.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.rFQCart.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.rfqQuotesProducts.deleteMany({
        where: {
          rfqProductId: { in: productIds },
        },
      });
      await prisma.wishlist.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.productPrice.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.productShortDescription.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.productSpecification.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });

      await prisma.customizeProduct.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.factoriesCart.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.productSellCountry.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.productSellState.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });

      await prisma.productSellCity.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.sellerReward.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });
      await prisma.sharedLink.deleteMany({
        where: {
          productId: { in: productIds },
        },
      });

      let productDetail = await prisma.product.deleteMany({
        where: { id: { in: productIds } },
      });

      return {
        status: true,
        message: 'Products deleted successfully',
      };
    } catch (error) {
      console.log('error deleteProductFromBackend: ', error);
      return {
        status: false,
        message: 'error, in deleteProductFromBackend',
        error: error.message,
      };
    }
  }

  async deleteProductFromBackend(req: any) {
    try {
      let productIds = req.body.productIds;

      const deleteAndLog = async (modelName: string, deleteOperation: any) => {
        const result = await deleteOperation;
        console.log(`Deleted ${result.count} records from ${modelName}`);
      };

      await deleteAndLog(
        'productTags',
        prisma.productTags.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'productImages',
        prisma.productImages.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'cart',
        prisma.cart.deleteMany({ where: { productId: { in: productIds } } }),
      );
      await deleteAndLog(
        'orderProducts',
        prisma.orderProducts.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'productReview',
        prisma.productReview.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'rFQCart',
        prisma.rFQCart.deleteMany({ where: { productId: { in: productIds } } }),
      );
      await deleteAndLog(
        'rfqQuotesProducts',
        prisma.rfqQuotesProducts.deleteMany({
          where: { rfqProductId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'wishlist',
        prisma.wishlist.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'productPrice',
        prisma.productPrice.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'productShortDescription',
        prisma.productShortDescription.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'productSpecification',
        prisma.productSpecification.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'customizeProduct',
        prisma.customizeProduct.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'factoriesCart',
        prisma.factoriesCart.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'productSellCountry',
        prisma.productSellCountry.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'productSellState',
        prisma.productSellState.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'productSellCity',
        prisma.productSellCity.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'sellerReward',
        prisma.sellerReward.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'sharedLink',
        prisma.sharedLink.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );
      await deleteAndLog(
        'productDuplicateRfq',
        prisma.productDuplicateRfq.deleteMany({
          where: { productId: { in: productIds } },
        }),
      );

      const productDeletion = await prisma.product.deleteMany({
        where: { id: { in: productIds } },
      });
      console.log(`Deleted ${productDeletion.count} records from product`);

      return {
        status: true,
        message: 'Products deleted successfully',
      };
    } catch (error) {
      console.log('error deleteProductFromBackend: ', error);
      return {
        status: false,
        message: 'Error in deleteProductFromBackend',
        error: error.message,
      };
    }
  }
}
