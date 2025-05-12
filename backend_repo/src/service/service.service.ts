import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { Prisma, PrismaClient } from '@prisma/client';
import { itxClientDenyList } from '@prisma/client/runtime/library';

@Injectable()
export class ServiceService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async createService(dto: CreateServiceDto, userId: number) {
    try {
      const { tags, features, images, ...rest } = dto;
      const data: Prisma.ServiceUncheckedCreateInput = {
        ...rest,
        sellerId: userId,
        serviceTags: {
          createMany: {
            data: tags,
          },
        },
        serviceFeatures: {
          createMany: {
            data: features,
          },
        },
        images: {
          createMany: {
            data: images,
          },
        },
      };

      const service = await this.prisma.service.create({
        data,
      });

      return {
        success: true,
        message: 'service created successfully',
        data: service,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in create service',
        error: error.message,
      };
    }
  }

  async getAllServices(
    page: number,
    limit: number,
    ownService: boolean,
    userId: number,
    term: any,
    sort: any,
  ) {
    try {
      const offset = (page - 1) * limit;
      const sortType = sort ? sort : 'desc';
      let searchTerm = term?.length > 2 ? term : '';

      let query: Prisma.ServiceWhereInput;
      query = {
        serviceName: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      };
      if (ownService) {
        query.sellerId = userId
      }
      
      const services = await this.prisma.service.findMany({
        where: query,
        orderBy: { createdAt: sortType },
        skip: offset,
        take: limit,
        include: {
          images: {
            take: 1,
          },
        },
        
      });
      const totalServices = await this.prisma.service.count({
        where: query,
      });
      return {
        success: true,
        message: 'services list fetched successfully',
        data: { services, total: totalServices, limit },
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in fetching services',
        error: error.message,
      };
    }
  }

  async getServiceById(serviceId: number) {
    try {
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
        include: {
          serviceTags: true,
          serviceFeatures: true,
          images: true,
        },
      });
      return {
        success: true,
        message: 'service fetched successfully',
        data: service,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in fetching service by id',
        error: error.message,
      };
    }
  }

  async updateService(
    serviceId: number,
    userId: number,
    dto: UpdateServiceDto,
  ) {
    try {
      const { tags, features, images, ...rest } = dto;
      const service = await this.prisma.service.findFirst({
        where: {
          id: serviceId,
          sellerId: userId,
        },
      });
      if (!service) {
        throw new BadRequestException('service not found');
      }
      const queries: Prisma.PrismaPromise<any>[] = [
        this.prisma.service.update({
          where: { id: serviceId },
          data: rest,
        }),
      ];
      if (tags && tags.length) {
        const serviceTagIds: number[] = [];
        const createTags = [];
        tags.forEach((tag) => {
          if (tag.id) {
            serviceTagIds.push(tag.id);
          } else {
            createTags.push({
              tagId: tag.tagId,
              serviceId: serviceId,
            });
          }
        });
        if (serviceTagIds.length) {
          queries.push(
            this.prisma.serviceTag.deleteMany({
              where: { serviceId, id: { notIn: serviceTagIds } },
            }),
          );
        }
        if (createTags.length) {
          queries.push(
            this.prisma.serviceTag.createMany({
              data: createTags,
            }),
          );
        }
      }

      if (features && features.length) {
        const serviceFeatureIds: number[] = [];
        const createFeatures = [];
        features.forEach((feature) => {
          if (feature.id) {
            serviceFeatureIds.push(feature.id);
          } else {
            const { name, serviceCost, serviceCostType } = feature;
            createFeatures.push({
              serviceId,
              name,
              serviceCost,
              serviceCostType,
            });
          }
        });
        if (serviceFeatureIds.length) {
          queries.push(
            this.prisma.serviceFeature.deleteMany({
              where: { serviceId, id: { notIn: serviceFeatureIds } },
            }),
          );
        }
        if (createFeatures.length) {
          queries.push(
            this.prisma.serviceFeature.createMany({
              data: createFeatures,
            }),
          );
        }
      }
      if (images && images.length) {
        const serviceImageIds: number[] = [];
        const createImages = [];

        images.forEach((image) => {
          if (image.id) {
            serviceImageIds.push(image.id);
          } else {
            const { url, fileName, fileType } = image;
            createImages.push({
              serviceId,
              url,
              fileName,
              fileType,
            });
          }
        });
        if (serviceImageIds.length) {
          queries.push(
            this.prisma.serviceImage.deleteMany({
              where: { serviceId, id: { notIn: serviceImageIds } },
            }),
          );
        }
        if (createImages.length) {
          queries.push(
            this.prisma.serviceImage.createMany({
              data: createImages,
            }),
          );
        }
      }

      const response = await this.prisma.$transaction(queries);

      return {
        status: true,
        message: 'service updated successfully',
        data: response,
      };
    } catch (error) {
      console.log(error);
      return {
        status: false,
        message: 'error in updating service by id',
        error: error.message,
      };
    }
  }

  // for shipping
  async getAllServiceBySeller(sellerId: any, page: any, limit: any, req: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 100;
      const skip = (Page - 1) * pageSize;

      let whereCondition: any = {
        status: 'ACTIVE',
        sellerId: parseInt(sellerId),
        serviceType: 'MOVING',
      };

      if (req.query.fromCityId && req.query.toCityId) {
        if (req.query.fromCityId !== req.query.toCityId) {
          (whereCondition.fromCityId = parseInt(req.query.fromCityId)),
            (whereCondition.toCityId = parseInt(req.query.toCityId));
        } else if (req.query.fromCityId === req.query.toCityId) {
          whereCondition.rangeCityId = parseInt(req.query.toCityId);
        }
      }

      const services = await this.prisma.service.findMany({
        where: whereCondition,
        include: {
          serviceFeatures: true,
          images: {
            take: 1,
          },
        },
        skip,
        take: pageSize,
      });

      const totalCount = await this.prisma.service.count({
        where: whereCondition,
      });

      if (!services || services.length === 0) {
        return {
          status: false,
          message: 'No services found for this seller',
          data: [],
        };
      }

      return {
        status: true,
        message: 'Fetched services successfully',
        data: services,
        totalCount: totalCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error in fetching getAllServiceBySeller',
        error: error.message,
      };
    }
  }

  // for shipping
  async getAllServiceOfOtherSeller(
    sellerId: any,
    page: any,
    limit: any,
    req: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 100;
      const skip = (Page - 1) * pageSize;

      let whereCondition: any = {
        status: 'ACTIVE',
        sellerId: { not: parseInt(sellerId) },
        serviceType: 'MOVING',
      };

      if (req.query.fromCityId && req.query.toCityId) {
        if (req.query.fromCityId !== req.query.toCityId) {
          (whereCondition.fromCityId = parseInt(req.query.fromCityId)),
            (whereCondition.toCityId = parseInt(req.query.toCityId));
        } else if (req.query.fromCityId === req.query.toCityId) {
          whereCondition.rangeCityId = parseInt(req.query.toCityId);
        }
      }

      console.log('whereCondition: ', whereCondition);

      const services = await this.prisma.service.findMany({
        where: whereCondition,
        include: {
          serviceFeatures: true,
          images: {
            take: 1,
          },
        },
        skip,
        take: pageSize,
      });

      const totalCount = await this.prisma.service.count({
        where: whereCondition,
      });

      if (!services || services.length === 0) {
        return {
          status: false,
          message: 'No services found for this seller',
          data: [],
        };
      }

      return {
        status: true,
        message: 'Fetched services successfully',
        data: services,
        totalCount: totalCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error in fetching getAllServiceBySeller',
        error: error.message,
      };
    }
  }

  async getProductService(serviceId: number, userId: number) {
    try {
      const page = 1;
      const limit = 100;
      const skip = (page - 1) * limit;
      const categoryConnect = await this.prisma.categoryConnectTo.findMany({
        where: { categoryId: serviceId },
      });
      if (!categoryConnect.length) {
        return {
          status: false,
          message: 'No connecting product found',
          data: categoryConnect,
        };
      }
      const prodCategoryIds: Set<number> = new Set();

      categoryConnect.forEach((item) => prodCategoryIds.add(item.connectTo));
      const whereCond: Prisma.ProductWhereInput = {
        status: 'ACTIVE',
        categoryId: { in: Array.from(prodCategoryIds) },
      };

      const products = await this.prisma.product.findMany({
        where: whereCond,
        include: {
          productImages: {
            take: 1,
          },
          product_productPrice: {
            include: {
              adminDetail: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePicture: true,
                  tradeRole: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalCount = await this.prisma.product.count({
        where: whereCond,
      });

      return {
        status: true,
        message: 'Fetched products  successfully',
        data: products,
        totalCount: totalCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error in fetching get product service',
        error: error.message,
      };
    }
  }

  async getAllServiceRelatedProductCategoryId(
    categoryId: any,
    page: any,
    limit: any,
    req: any,
  ) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 100;
      const skip = (Page - 1) * pageSize;
      const categoryID = parseInt(categoryId);

      let categoryConnect = await this.prisma.categoryConnectTo.findMany({
        where: { categoryId: categoryID },
      });

      if (!categoryConnect.length) {
        return {
          status: false,
          message: 'No Service',
          data: [],
        };
      }

      const categoryIds = [
        ...new Set(categoryConnect.map((item) => item.connectTo)),
      ];

      let whereCondition: any = {
        status: 'ACTIVE',
        serviceType: 'BOOKING',
        categoryId: { in: categoryIds },
      };

      const services = await this.prisma.service.findMany({
        where: whereCondition,
        include: {
          serviceFeatures: true,
          images: {
            take: 1,
          },
        },
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalCount = await this.prisma.service.count({
        where: whereCondition,
      });

      if (!services || services.length === 0) {
        return {
          status: false,
          message: 'No services found',
          data: [],
        };
      }

      return {
        status: true,
        message: 'Fetched services successfully',
        data: services,
        totalCount: totalCount,
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error in fetching getAllServiceRelatedProductCategoryId',
        error: error.message,
      };
    }
  }
}
