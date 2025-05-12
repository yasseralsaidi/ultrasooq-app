import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { compareSync } from 'bcrypt';
import { UpdateProductTypeDTO } from './dto/updateProductType.dto';
import { NotificationService } from 'src/notification/notification.service';

const prisma = new PrismaClient();

@Injectable()
export class AdminService {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
  ) { }

  async login(payload: any) {
    try {
      const email = payload.email;
      let userEmail = await prisma.user.findUnique({
        where: { email }
      });
      let user = userEmail;
      if (!user) {
        return {
          status: false,
          message: 'Admin not found',
          data: [],
        };
      }

      // AdminId Checking
      if (user.userType != 'ADMIN') {
        return {
          status: false,
          message: "Not An Admin",
          data: [] 
        };
      }

      if (compareSync(payload.password, user.password)) {

        let userAuth = {
          id: user.id,
        }
        
        let authToken = await this.authService.login(userAuth);
        const restokenData = authToken;
        return {
          status: true,
          message: "Login Successfully",
          accessToken: restokenData.accessToken,
          data: user 
        };
      } else {
        return {
          status: false,
          message: "Invalid Credential",
          data: []
        };
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in login',
        error: error.message
      }
    }
  }

  async findOne(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      let userDetail = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (!userDetail) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: userDetail
      }
    } catch (error) {
      return {
        status: false,
        error: error.message,
        message: 'error in findOne'
      }
    }
  }

  async getPermission(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      let userDetail = await prisma.user.findFirst({
        where: { id: userId },
        select: { 
          id: true,
          uniqueId: true,
          email: true,
          firstName: true,
          lastName: true,
          userName: true,
          gender: true,
          status: true,
          dateOfBirth: true,
          phoneNumber: true,
          cc: true,
          tradeRole: true,
          otp: true,
          otpValidTime: true,
          resetPassword: true,
          profilePicture: true,
          identityProof: true,
          identityProofBack: true,
          onlineOffline: true,
          onlineOfflineDateStatus: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          userType: true,
          loginType: true,
          employeeId: true,
          userRoleName: true,
          userRoleId: true,
          customerId: true,
          stripeAccountId: true,
          addedBy: true,
      
          // Nested relation
          adminRoleDetail: {
            select: {
              id: true,
              adminRoleName: true,
              addedBy: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
      
              // Include permissions
              adminRolePermission: {
                select: {
                  id: true,
                  adminRoleId: true,
                  adminPermissionId: true,
                  status: true,
                  createdAt: true,
                  updatedAt: true,
                  deletedAt: true,
                  adminPermissionDetail: {
                    select: {
                      id: true,
                      name: true,
                      addedBy: true,
                      status: true,
                      createdAt: true,
                      updatedAt: true,
                      deletedAt: true,
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      if (!userDetail) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: userDetail
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in me',
        error: error.message
      }
    }
  }

  // ---------- ADMIN PRODUCT MANAGE ----------
  async getAllProduct(page: any, limit: any, req: any, term: any, sortType: any, sortOrder: any, brandIds: any, priceMin: any, priceMax: any, status: any, productType: any, categoryId: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let searchTerm = term?.length > 2 ? term : ''
      const SORTTYPE = sortType ? sortType : 'createdAt';
      const SORTORDER = sortOrder ? sortOrder : 'desc'

      let orderBy = {};
      orderBy[SORTTYPE] = SORTORDER;

      let whereCondition: any = {
        // status: status,
        productType: productType === 'ALL' ? {
          in: ['P', 'R', 'F']
        } : productType ? {
          in: [productType]
        } : undefined,
        productName: {
          contains: searchTerm,
          mode: 'insensitive'
        },
        brandId: brandIds ? {
          in: brandIds.split(',').map(id => parseInt(id.trim()))
        } : undefined,
        categoryLocation: {
          contains: categoryId, // Checks if categoryId exists in categoryLocation
          mode: 'insensitive'
        },
      };

      if (priceMin && priceMax) {
        whereCondition.offerPrice = {
          gte: parseFloat(priceMin),
          lte: parseFloat(priceMax)
        };
      }

      if (status) {
        whereCondition.status = status
      }

      let productDetailList = await prisma.product.findMany({
        // where: { 
        //   status: 'ACTIVE', 
        //   productName: {
        //     contains: searchTerm,
        //     mode: 'insensitive'
        //   },
        //   brandId: brandIds ? {
        //     in: brandIds.split(',').map(id => parseInt(id.trim()))
        //   } : undefined
        // },
        where: whereCondition,
        include: {
          // userBy: { where: { status: 'ACTIVE' } },
          // adminBy: { where: { status: 'ACTIVE' } },
          category: { where: { status: 'ACTIVE' } },
          brand: { where: { status: 'ACTIVE' } },
          placeOfOrigin: { where: { status: 'ACTIVE' } },
          productTags: { 
            where: { 
              status: 'ACTIVE' 
            },
            include: {
              productTagsTag: true
            }
          },
          productImages: { where: { status: 'ACTIVE' } },
          product_productPrice: true
        },
        orderBy: orderBy,
        skip, // Offset
        take: pageSize, // Limit
      });

      let productDetailListCount = await prisma.product.count({
        where: whereCondition,
        // where: { 
        //   status: 'ACTIVE', 
        //   productName: {
        //     contains: searchTerm,
        //     mode: 'insensitive'
        //   },
        //   brandId: brandIds ? {
        //     in: brandIds.split(',').map(id => parseInt(id.trim()))
        //   } : undefined
        // },
      });

      if (!productDetailList) {
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
        data: productDetailList,
        totalCount: productDetailListCount
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in getAllProduct',
        error: error.message
      }
    }
  }

  async updateProductType(payload: UpdateProductTypeDTO, req: any) {
    try {
      const productId = payload.productId;
      let updateProductType = await prisma.product.update({
        where: {
          id: productId
        },
        data: {
          typeProduct: payload?.typeProduct
        }
      });
    
      return {
        status: true,
        message: 'Updated SuccessFully',
        data: updateProductType
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in updateProductType',
        error: error.message
      }
    }
  }

  async updateProduct(payload: any, req: any) {
    try {
      const userId = req?.user?.id
      const productId = payload.productId;
      let productDetail = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          product_productPrice: {
            where: { status: 'ACTIVE' },
            orderBy: {
              offerPrice: 'asc'
            },
            take: 1
          }
        }
      });

      if (!productDetail) {
        return {
          status: false,
          message: 'Updated SuccessFully',
          data: []
        }
      }

      // if (productDetail?.product_productPrice.length === 0) {
      //   return {
      //     status: false,
      //     message: 'Cannot update due to price being 0',
      //     data: productDetail
      //   }
      // }

      // if (productDetail?.product_productPrice[0]?.offerPrice.toNumber() === 0.00) {
      //   return {
      //     status: false,
      //     message: 'Cannot update due to price being 0',
      //     data: productDetail
      //   }
      // }
      
      let updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          status: payload?.status || productDetail.status,
          productName: payload.productName || productDetail.productName,
          categoryId: payload.categoryId || productDetail.categoryId,
          brandId: payload.brandId || productDetail.brandId,
          placeOfOriginId: payload.placeOfOriginId || productDetail.placeOfOriginId,
          skuNo: payload.skuNo || productDetail.skuNo,
          productPrice: payload.productPrice || productDetail.productPrice,
          offerPrice: payload.offerPrice || productDetail.offerPrice,
          description: payload.description || productDetail.description,
          specification: payload.specification || productDetail.specification,
          categoryLocation: payload?.categoryLocation || productDetail.categoryLocation
        }
      });

      if (payload.productTagList && payload.productTagList.length > 0) {
        await prisma.productTags.deleteMany({
          where: { productId: productId }
        });
        for (let i=0; i<payload.productTagList.length; i++) {
          let addProductTags = await prisma.productTags.create({
            data: {
              productId: productId,
              tagId: payload.productTagList[i].tagId
            }
          })
        }
      }

      if (payload.productImagesList && payload.productImagesList.length > 0) {
        await prisma.productImages.deleteMany({
          where: { productId: productId }
        })
        for (let j=0; j<payload.productImagesList.length; j++) {
          let addProductImages = await prisma.productImages.create({
            data: {
              productId: productId,
              imageName: payload?.productImagesList[j]?.imageName,
              image: payload?.productImagesList[j]?.image,
              videoName: payload?.productImagesList[j]?.videoName,
              video: payload?.productImagesList[j]?.video
            }
          })
        }
      }

      return {
        status: true,
        message: 'Updated SuccessFully',
        data: updatedProduct
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in updateProductt',
        error: error.message
      }
    }
  }

  // not in use
  async getOneProductOld(productId: any, req: any) {
    try {
      const productID = parseInt(productId);
      let productDetail = await prisma.product.findUnique({
        where: { id: productID },
        include: {
          category: { where: { status: 'ACTIVE' } },
          brand: { where: { status: 'ACTIVE' } },
          placeOfOrigin: { where: { status: 'ACTIVE' } },
          productTags: { 
            where: { 
              status: 'ACTIVE' 
            },
            include: {
              productTagsTag: true
            }
          },
          productImages: { where: { status: 'ACTIVE' } },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          product_productSpecification: { where: { status: 'ACTIVE' } },
          product_productPrice: {
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
            }
          }
        },
      });
      if (!productDetail) {
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
        data: productDetail,
        totalCount: 1
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in getOneProduct',
        error: error.message
      }
    }
  }

  async getOneProduct(productId: any, req: any) {
    try {
      const productID = parseInt(productId);
      let productDetail = await prisma.product.findUnique({
        where: { id: productID },
        include: {
          category: { where: { status: 'ACTIVE' } },
          brand: { where: { status: 'ACTIVE' } },
          placeOfOrigin: { where: { status: 'ACTIVE' } },
          productTags: { 
            where: { 
              status: 'ACTIVE' 
            },
            include: {
              productTagsTag: true
            }
          },
          productImages: { where: { status: 'ACTIVE' } },
          product_productShortDescription: { where: { status: 'ACTIVE' } },
          product_productSpecification: { where: { status: 'ACTIVE' } },
          product_productPrice: {
            include: {
              productCountryDetail: { where: { status: "ACTIVE" } },
              productStateDetail: { where: { status: "ACTIVE" } },
              productCityDetail: { where: { status: "ACTIVE" } },
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
            }
          },
          product_sellCountry: { where: { status: 'ACTIVE' } },
          product_sellState: { where: { status: 'ACTIVE' } },
          product_sellCity: { where: { status: 'ACTIVE' } },
          orderProducts: true,
        },
      });
      if (!productDetail) {
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
        data: productDetail,
        totalCount: 1
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in getOneProduct',
        error: error.message
      }
    }
  }

  async getOneProductAllQuestion (page: any, limit: any ,productId: any, sortType: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let productID = parseInt(productId);
      let sort = {};
      if (sortType == 'oldest') {
        sort = { createdAt: 'asc' }
      } else {
        sort = { createdAt: 'desc' }
      }

      let getAllQuestion = await prisma.productQuestion.findMany({
        where: {
          productId: productID,
          status: 'ACTIVE'
        },
        include: {
          answerByuserIdDetail: {
            select: { firstName: true, lastName: true, profilePicture: true }
          }
        },
        orderBy: sort,
        skip, // Offset
        take: pageSize, // Limit
      });

      let getAllQuestionCount = await prisma.productQuestion.count({
        where: {
          productId: productID,
          status: 'ACTIVE'
        }
      });

      if (!getAllQuestion) {
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
        data: getAllQuestion,
        totalcount: getAllQuestionCount
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in getOneProductAllQuestion',
        error: error.message
      }
    }
  }

  async deleteProductQuestion (productQuestionId: any) {
    try {
      const productQuestionID = parseInt(productQuestionId);

      let deleteProductQuestion = await prisma.productQuestion.delete({
        where: {
          id: productQuestionID,
        },
      });

      return {
        status: true,
        message: 'Deleted Successfully',
        data: []
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in getOneProductAllQuestion',
        error: error.message
      }
    }
  }

  async deleteProduct(productId: any, req: any) {
    try {
      let ID = parseInt(productId)
      let updatedProduct = await prisma.product.update({
        where: { id: ID },
        data: { 
          status: 'DELETE',
          deletedAt: new Date()
        }
      });
      return {
        status: true,
        message: 'Deleted Successfully',
        data: updatedProduct
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in delete product',
        error: error.message
      }
    }
  }

  // ---------- ADMIN PRODUCT MANAGE ENDS ----------

  async createDynamicForm(payload: any) {
    try { 
      let dynamicForm=await prisma.dynamicForm.create({
        data:{
          formData: payload.form,
          formName: payload.formName
        }
      })
      
      for(let i=0;i<payload.attributeList.length;i++){
        let parentElement=await prisma.dynamicFormElement.create({
          data:{
            keyName: payload.attributeList[i].keyName,
            label: payload.attributeList[i].label,
            typeField: payload.attributeList[i].typeField,
            // parentId: 0,
            formId: dynamicForm.id,
          }
        })
        for(let j=0;j<payload.attributeList[i].fields.length;j++){
          await prisma.dynamicFormElement.create({
            data:{
              keyName: payload.attributeList[i].fields[j].keyName,
              label: payload.attributeList[i].fields[j].label,
              typeField: payload.attributeList[i].fields[j].typeField,
              parentId: parentElement.id,
              formId: dynamicForm.id,
            }
          })
        }
      }
      return {
        status: true,
        message: 'Form created successfully',
        data: {}
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in create form',
        error: error.message
      }
    }
  }

  async dynamicFormDetails(payload: any) {
    try { 
      let dynamicForm=await prisma.dynamicForm.findUnique({
        where: { id: payload.id },
        include: {
          elements: true,
          dynamicForm_dynamicFormCategory: {
            include: {
              categoryIdDetail: true
            }
          }
        }
      })
      
      return {
        status: true,
        message: 'Form details',
        data: dynamicForm
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in create form',
        error: error.message
      }
    }
  }

  async dynamicFormDetailsList(payload: any) {
    try { 
      const skip = (payload.page - 1) * payload.limit; // Calculate the offset
      let pageSize = parseInt(payload.limit) || 10;
      let dynamicForm=await prisma.dynamicForm.findMany({
        where: { status: "ACTIVE" },
        include: {
          elements: true,
          dynamicForm_dynamicFormCategory: {
            include: {
              categoryIdDetail: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      })
      return {
        status: true,
        message: 'Form details',
        data: dynamicForm
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in create form',
        error: error.message
      }
    }
  }

  async dynamicFormDetailsDelete(payload: any) {
    try { 
      await prisma.dynamicForm.update({
        where: { id: payload.id },
        data:{
          status: "DELETE",
          deletedAt: new Date()
        }
      })
      return {
        status: true,
        message: 'deleted successfully',
        data: {}
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in create form',
        error: error.message
      }
    }
  }

  async dynamicFormDetailsEdit(payload: any) {
    try { 
      let dynamicForm=await prisma.dynamicForm.update({
        where: { id: payload.id },
        data:{
          formData: payload.form,
          formName: payload.formName
        }
      })
      await prisma.dynamicFormElement.deleteMany({
        where: { formId: payload.id },
      });

      for(let i=0;i<payload.attributeList.length;i++){
        let parentElement=await prisma.dynamicFormElement.create({
          data:{
            keyName: payload.attributeList[i].keyName,
            label: payload.attributeList[i].label,
            typeField: payload.attributeList[i].typeField,
            // parentId: 0,
            formId: dynamicForm.id,
          }
        })
        for(let j=0;j<payload.attributeList[i].fields.length;j++){
          await prisma.dynamicFormElement.create({
            data:{
              keyName: payload.attributeList[i].fields[j].keyName,
              label: payload.attributeList[i].fields[j].label,
              typeField: payload.attributeList[i].fields[j].typeField,
              parentId: parentElement.id,
              formId: dynamicForm.id,
            }
          })
        }
      }
      return {
        status: true,
        message: 'Form updated successfully',
        data: {}
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in create form',
        error: error.message
      }
    }
  }

  async assignFormToCategory(payload: any) {
    try {
      if (!payload?.categoryIdList || payload?.categoryIdList.length == 0) {
        return {
          status: false,
          meesaage: 'Atleast One categoryId and one formId is required',
          data: []
        }
      }

      for (let i=0; i<payload?.categoryIdList.length; i++) {
        let categoryExist = await prisma.dynamicFormCategory.findFirst({
          where: {
            formId: payload?.categoryIdList[i].formId,
            categoryId: payload?.categoryIdList[i].categoryId
          }
        });
        if (categoryExist) {
          console.log('exist: ', i);
          
        } else {
          let assignFormToCategory = await prisma.dynamicFormCategory.create({
            data: {
              formId: payload?.categoryIdList[i].formId,
              categoryId: payload?.categoryIdList[i].categoryId,
              categoryLocation: payload?.categoryIdList[i]?.categoryLocation
            }
          });
        }
        // let assignFormToCategory = await prisma.dynamicFormCategory.create({
        //   data: {
        //     formId: payload?.categoryIdList[i].formId,
        //     categoryId: payload?.categoryIdList[i].categoryId,
        //     categoryLocation: payload?.categoryIdList[i]?.categoryLocation
        //   }
        // });
      }

      return {
        status: true,
        message: 'Assigned Successfully',
        data: []
      }

    } catch (error) {
      return {
        status: false,
        message: 'error, in assignFormToCategory',
        error: error.message
      }
    }
  }

  async updateAssignFormToCategory(payload: any) {
    try {
      const ID = payload.id;

      let updateAssignFormToCategory = await prisma.dynamicFormCategory.update({
        where: { id: ID },
        data: {
          formId: payload?.formId,
          categoryId: payload?.categoryId,
          categoryLocation: payload?.categoryLocation
        }
      });

      return {
        status: true,
        message: 'Updated Successfully',
        data: updateAssignFormToCategory
      }
      
    } catch (error) {
      return {
        status: false,
        message: 'error, in updateAssignFormToCategory',
        error: error.message
      }
    }
  }

  // still not in use
  async editAssignFormToCategory(payload: any) {
    try {
      if(!payload?.formId) {
        return {
          status: false,
          message: 'formId is required',
          data: []
        }
      }
      const formId = payload?.formId;
      let deleteDynamicFormCategory = await prisma.dynamicFormCategory.deleteMany({
        where: { formId: formId }
      });

      for (let i=0; i<payload?.categoryIdList.length; i++) {
        let categoryExist = await prisma.dynamicFormCategory.findFirst({
          where: {
            categoryId: payload?.categoryIdList[i].categoryId
          }
        });
        if (categoryExist) {
          console.log('exist: ', i);
          
        } else {
          let assignFormToCategory = await prisma.dynamicFormCategory.create({
            data: {
              formId: payload?.categoryIdList[i].formId,
              categoryId: payload?.categoryIdList[i].categoryId
            }
          });
        }
        // let assignFormToCategory = await prisma.dynamicFormCategory.create({
        //   data: {
        //     formId: payload?.categoryIdList[i].formId,
        //     categoryId: payload?.categoryIdList[i].categoryId
        //   }
        // });
      }
      // for (let i=0; i<payload?.categoryIdList.length; i++) {
      //   let assignFormToCategory = await prisma.dynamicFormCategory.create({
      //     data: {
      //       formId: payload?.categoryIdList[i].formId,
      //       categoryId: payload?.categoryIdList[i].categoryId
      //     }
      //   });
      // }

      return {
        status: true,
        message: 'Assigned Update Successfully',
        data: []
      }

    } catch (error) {
      return {
        status: false,
        message: 'error, in editAssignFormToCategory',
        error: error.message
      }
    }
  }

  // Buyer, Company, Freelancer List
  async getAllUser(page: any, limit: any, tradeRole: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      // let searchTerm = term?.length > 2 ? term : ''
      const sortType = 'desc';

      let getAllUser = await prisma.user.findMany({
        where: {
          tradeRole: tradeRole
        },
        orderBy: { createdAt: sortType },
        skip, // Offset
        take: pageSize, // Limit
      });

      if(!getAllUser) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      let getAllUserCount = await prisma.user.count({
        where: { tradeRole: tradeRole }
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllUser,
        totalCount: getAllUserCount
      }

    } catch (error) {
      return {
        status: false,
        message: 'error, in getAllUser',
        error: error.message
      }
    }
  }

  async updateOneUser(req: any) {
    try {
      const userId = req.body.userId;

      let userExist = await prisma.user.findUnique({
        where: {
          id: userId
        }
      });
      if (!userExist) {
        return {
          status: false,
          message: 'user not found',
          data: []
        }
      }

      let updateUser = await prisma.user.update({
        where: { id: userId },
        data: {
          tradeRole: req.body.tradeRole
        }
      });

      return {
        status: true,
        message: 'Updated Successfully',
        data: updateUser
      }
      
    } catch (error) {
      return {
        status: false,
        message: 'error, in getAllUser',
        error: error.message
      }
    }
  }



  // RFQ SECTION BEGINS
  async getAllRfqQuotes (page: any, limit: any, req: any, sort: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      let sortType = sort ? sort : 'desc';

      let getAllRfqQuotes = await prisma.rfqQuotes.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          rfqQuotes_rfqQuoteAddress: true,
          rfqQuotesProducts: {
            include: {
              rfqProductDetails: {
                include: {
                  productImages: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: sortType },
        skip,
        take: pageSize
      });

      if (!getAllRfqQuotes) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      let getAllRfqQuotesCount = await prisma.rfqQuotes.count({
        where: {
          status: 'ACTIVE'
        },
      });

      return {
        status: true,
        message: 'Not Found',
        data: getAllRfqQuotes,
        totalCount: getAllRfqQuotesCount
      }
    } catch (error) {
      return {
        status: false,
        message: 'error, in getallRfqQuotes',
        error: error.message
      }
    }
  }

  // RFQ SECTION ENDS

  // ------------------------------------- Country & States ---------------------------------------
  async getAllCountry (page: any, limit: any, req: any, sort: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 100000;
      const skip = (Page - 1) * pageSize;
      const sortType = 'desc';

      let getAllCountry = await prisma.countries.findMany({
        where: {
          status: "ACTIVE"
        },
        orderBy: { createdAt: sortType },
        skip, // Offset
        take: pageSize, // Limit
      });

      if(!getAllCountry) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      let getAllCountryCount = await prisma.countries.count({
        where: { status: "ACTIVE" }
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllCountry,
        totalCount: getAllCountryCount
      }

    } catch (error) {
      return {
        status: false,
        message: 'error, in getAllCountry',
        error: error.message
      }
    }
  }

  async getAllStates (page: any, limit: any, req: any, sort: any, countryId: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 5000;
      const skip = (Page - 1) * pageSize;
      const sortType = 'desc';
      const countryID = parseInt(countryId) || 101;

      let getAllStates = await prisma.states.findMany({
        where: {
          status: "ACTIVE",
          countryId: countryID
        },
        orderBy: { createdAt: sortType },
        skip, // Offset
        take: pageSize, // Limit
      });

      if(!getAllStates) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      let getAllStatesCount = await prisma.states.count({
        where: {
          status: "ACTIVE",
          countryId: countryID
        },
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllStates,
        totalCount: getAllStatesCount
      }

    } catch (error) {
      console.log(" error: ", error);
      
      return {
        status: false,
        message: 'error, in getAllStates',
        error: error.message
      }
    }
  }

  async getAllCities (page: any, limit: any, req: any, sort: any, stateId: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 5000;
      const skip = (Page - 1) * pageSize;
      const sortType = 'desc';
      const stateID = parseInt(stateId) || 101;

      if (stateID === -1) {
        let getAllCities = await prisma.cities.findMany({
          where: {
            status: "ACTIVE",
          },
          orderBy: { createdAt: sortType },
          skip, // Offset
          take: pageSize, // Limit
        });
  
        if(!getAllCities) {
          return {
            status: false,
            message: 'Not Found',
            data: []
          }
        }
  
        let getAllCitiesCount = await prisma.cities.count({
          where: {
            status: "ACTIVE",
            stateId: stateID
          },
        });
  
        return {
          status: true,
          message: 'Fetch Successfully',
          data: getAllCities,
          totalCount: getAllCitiesCount
        }

      }
      
      let getAllCities = await prisma.cities.findMany({
        where: {
          status: "ACTIVE",
          stateId: stateID
        },
        orderBy: { createdAt: sortType },
        skip, // Offset
        take: pageSize, // Limit
      });

      if(!getAllCities) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      let getAllCitiesCount = await prisma.cities.count({
        where: {
          status: "ACTIVE",
          stateId: stateID
        },
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllCities,
        totalCount: getAllCitiesCount
      }

    } catch (error) {
      console.log(" error: ", error);
      
      return {
        status: false,
        message: 'error, in getAllCities',
        error: error.message
      }
    }
  }

  /**
   *  Permission CRUD
   */

  async createPermission (payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      if (!payload.name) {
        return {
          status: false,
          message: 'name is required',
        };
      }

      // Check if the user role already exists
      let existPermission = await prisma.permission.findFirst({
        where: { name: payload.name }
      });

      if (existPermission) {
        return {
          status: true, // Still return true as it already exists
          message: 'Already exists',
          data: existPermission
        };
      }

      // Create new permission
      let newPermission = await prisma.permission.create({
        data: {
          name: payload.name,
          addedBy: userId
        }
      });
  
      return {
        status: true,
        message: 'Created successfully',
        data: newPermission
      };
    } catch (error) {
      console.log(" error: ", error);
      
      return {
        status: false,
        message: 'error, in createPermission',
        error: error.message
      }
    }
  }

  async getAllPermission(page: any, limit: any, searchTerm: any, req: any) {
    try {
      const userId = req?.user?.id;
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate offset
  
      let whereCondition: any = {
        addedBy: userId
      };
  
      // Apply search filter if searchTerm is provided
      if (searchTerm) {
        whereCondition.name = {
          contains: searchTerm,
          mode: 'insensitive' // Case-insensitive search
        };
      }
  
      // Fetch paginated permissions
      let getAllPermissions = await prisma.permission.findMany({
        where: whereCondition,
        orderBy: { id: 'desc' },
        skip, // Offset
        take: pageSize // Limit
      });
  
      // Count total permissions
      let totalPermissions = await prisma.permission.count({
        where: whereCondition
      });
  
      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllPermissions,
        totalCount: totalPermissions
      };
  
    } catch (error) {
      return {
        status: false,
        message: 'Error in getAllPermission',
        error: error.message
      };
    }
  }

  /**
   * Help Center
   */

  async getAllHelpCenter(page: any, limit: any, searchTerm: any, req: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate offset

      let whereCondition: any = {};

      // Apply search filter if searchTerm is provided
      if (searchTerm) {
        whereCondition.query = {
          contains: searchTerm,
          mode: 'insensitive' // Case-insensitive search
        };
      }

      // Fetch paginated help center requests
      let helpCenterRequests = await prisma.helpCenter.findMany({
        where: whereCondition,
        include: {
          userDetail: true
        },
        orderBy: { id: 'desc' },
        skip, // Offset
        take: pageSize // Limit
      });

      // Count total help center requests
      let totalHelpCenterRequests = await prisma.helpCenter.count({
        where: whereCondition
      });

      return {
        status: true,
        message: 'Fetched successfully',
        data: helpCenterRequests,
        totalCount: totalHelpCenterRequests
      };

    } catch (error) {
      return {
        status: false,
        message: 'Error in getAllHelpCenter',
        error: error.message
      };
    }
  }

  async replyHelpCenterById(payload: any, req: any){
    try {
      const helpCenterId = parseInt(payload.helpCenterId);
      let helpCenterExist = await prisma.helpCenter.findUnique({
        where: { id: helpCenterId }
      });
      if (!helpCenterExist){
        return {
          status: false,
          message: 'Not Found',
          data: []
        };
      }

      const response = payload.response;
      let updateHelpCenter = await prisma.helpCenter.update({
        where: { id: helpCenterId },
        data: {
          response: response
        }
      });

      let data = {
        email: helpCenterExist.userEmail,
        name: 'User',
        userQuery: helpCenterExist.query,
        response: response
      }
      console.log("data: ", data);
      
      this.notificationService.replyHelpCenter(data)

      return {
        status: true,
        message: 'Replied Successfully',
        data: updateHelpCenter
      };

    } catch (error) {
      return {
        status: false,
        message: 'Error in replyHelpCenter',
        error: error.message
      };
    }
  }



  /**
   * Finance Management (Admin side transaction list)
   */
  async getAllTransaction(req: any) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 1000) || 10;
      const skip = (page - 1) * limit;
  
      const transactionStatus = req.query.transactionStatus;
      const whereCondition: any = {
        transactionStatus: { in: ['INCOMPLETE', 'PENDING', 'SUCCESS', 'FAILED'] }
      };

      if (req.query.transactionStatus) {
        whereCondition.transactionStatus = req.query.transactionStatus;
      }
  
      // Optionally handle searchTerm if needed
      if (req.query.searchTerm) {
        const searchTerm = req.query.searchTerm;
        whereCondition.OR = [
          { orderId: { contains: searchTerm, mode: 'insensitive' } },
          { paymobTransactionId: { contains: searchTerm, mode: 'insensitive' } }
          // Add more fields as needed
        ];
      }
  
      const [transactions, totalCount] = await Promise.all([
        prisma.transactionPaymob.findMany({
          where: whereCondition,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.transactionPaymob.count({ where: whereCondition })
      ]);
  
      return {
        status: true,
        message: 'Fetched transactions successfully',
        data: transactions,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      console.error('Error in getAllTransaction:', error);
      return {
        status: false,
        message: 'Error fetching transactions',
        error: error.message || error
      };
    }
  }

  async getOneTransaction(req: any) {
    try {
      const transactionId = req.params.id || req.query.transactionId;
  
      if (!transactionId) {
        return {
          status: false,
          message: 'Transaction ID is required',
        };
      }
  
      const transaction = await prisma.transactionPaymob.findUnique({
        where: {
          id: Number(transactionId),
        },
      });
  
      if (!transaction) {
        return {
          status: false,
          message: 'Transaction not found',
        };
      }
  
      return {
        status: true,
        message: 'Transaction fetched successfully',
        data: transaction,
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error fetching transaction',
        error: error.message || error,
      };
    }
  }
  
  

  /**
   * Order Details (Admin Side)
   */
  async getAllOrder(req: any) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;
      const searchTerm = req.query.searchTerm?.trim();
      const status = req.query.status; // optional status filter
  
      let whereCondition: any = {
        deletedAt: null,
      };
  
      if (searchTerm) {
        whereCondition.OR = [
          { orderNo: { contains: searchTerm, mode: 'insensitive' } },
          { paymobOrderId: { contains: searchTerm, mode: 'insensitive' } },
          // Add more searchable fields here
        ];
      }
  
      if (status) {
        whereCondition.orderStatus = status;
      }
  
      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          where: whereCondition,
          // include: {
            // order_orderProducts: {
            //   include: {
            //     orderProduct_product: true,
            //     orderProduct_productPrice: true
            //   }
            // }
          // },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.order.count({
          where: whereCondition,
        }),
      ]);
  
      return {
        status: true,
        message: 'Fetched successfully',
        data: orders,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
  
    } catch (error) {
      return {
        status: false,
        message: 'Error fetching orders',
        error: error.message || error
      };
    }
  }

  async getOneOrder(req: any) {
    try {
      const orderId = req.params.id || req.query.orderId;
  
      if (!orderId) {
        return {
          status: false,
          message: 'Order ID is required',
        };
      }
  
      const order = await prisma.order.findUnique({
        where: {
          id: Number(orderId),
        },
        include: {
          order_orderProducts: {
            include: {
              orderProduct_product: true,
              orderProduct_productPrice: true
            }
          },
          order_orderAddress: true,
        },
      });
  
      if (!order) {
        return {
          status: false,
          message: 'Order not found',
        };
      }
  
      return {
        status: true,
        message: 'Order fetched successfully',
        data: order,
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error fetching order',
        error: error.message || error,
      };
    }
  }
  
  async getAllOrderProduct(req: any) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;
  
      // Optional: Add searchTerm filter here if needed
      const searchTerm = req.query.searchTerm;
      const orderId = req.query.orderId;
  
      let whereCondition: any = {
        orderId: parseInt(orderId)
      };
  
      if (searchTerm) {
        // whereCondition = {
        //   OR: [
        //     { productName: { contains: searchTerm, mode: 'insensitive' } },
        //     { productCode: { contains: searchTerm, mode: 'insensitive' } },
        //   ],
        // };
      }
  
      const orderProducts = await prisma.orderProducts.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });
  
      const totalCount = await prisma.orderProducts.count({
        where: whereCondition,
      });
  
      return {
        status: true,
        message: 'Fetched order products successfully',
        data: orderProducts,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error fetching order products',
        error: error.message || error,
      };
    }
  }
  
  async getOneOrderProduct(req: any) {
    try {
      const orderProductId = parseInt(req.query.orderProductId);
  
      if (isNaN(orderProductId)) {
        return {
          status: false,
          message: 'Invalid order product ID',
        };
      }
  
      const orderProduct = await prisma.orderProducts.findUnique({
        where: { id: orderProductId },
      });
  
      if (!orderProduct) {
        return {
          status: false,
          message: 'Order product not found',
        };
      }
  
      return {
        status: true,
        message: 'Fetched order product successfully',
        data: orderProduct,
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error fetching order product',
        error: error.message || error,
      };
    }
  }

  /**
   *  Services
   */
  async getAllService (page: number, limit: number, req: any) {
    try {
      let Page = page || 1;
      let pageSize = limit || 100;
      const skip = (Page - 1) * pageSize;
      const searchTerm = req.query.searchTerm?.trim();

      let whereCondition: any = {
        status: { in : ['ACTIVE', 'INACTIVE'] },
        serviceName: {
          contains: searchTerm,
          mode: 'insensitive'
        },
      };

      const services = await prisma.service.findMany({
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

      const totalCount = await prisma.service.count({
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
      console.log("error: ", error);
      
      return {
        status: false,
        message: 'Error fetching getAllService',
        error: error.message || error,
      };
    }
  }

  async getServiceById(serviceId: number) {
    try {
      const serviceID = serviceId
      const service = await prisma.service.findUnique({
        where: { id: serviceID },
        include: {
          serviceTags: true,
          serviceFeatures: true,
          images: true,
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              email: true,
              cc: true,
              phoneNumber: true,
              tradeRole: true
            }
          },
          country: true,
          state: true,
          toCity: true,
          fromCity: true,
          rangeCity: true
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
  


  

  
  
}
