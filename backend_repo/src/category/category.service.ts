import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';

const prisma = new PrismaClient();

@Injectable()
export class CategoryService {

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      let addCategory = await prisma.category.create({
        data: {
          name: createCategoryDto?.name,
          type: createCategoryDto?.type,
          parentId: createCategoryDto?.parentId,
          menuId: createCategoryDto?.menuId
        }
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: []
      }

    } catch (error) {
      console.log('error: ', error);
      
      return {
        status: false,
        message: 'error in createCategory',
        error: error.message
      }
    }
  }
  async create2(payload: any) {
    try {
      let addCategory = await prisma.category.create({
        data: {
          name: payload?.name,
          icon: payload?.icon,
          type: payload?.type,
          parentId: payload?.parentId,
          menuId: payload?.menuId
        }
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: []
      }

    } catch (error) {
      console.log('error: ', error);
      
      return {
        status: false,
        message: 'error in createCategory',
        error: error.message
      }
    }
  }
  
  // async createMultiple(payload: any) {
  //   try {

  //     if (payload?.categoryList && payload?.categoryList.length > 0) {
  //       for (let i = 0; i<payload.categoryList.length; i++) {
  //         console.log({
  //           name: payload.categoryList[i].name,
  //           icon: payload.categoryList[i].icon,
  //           type: payload?.type,
  //           parentId: payload?.parentId,
  //           menuId: payload?.menuId
  //         });
          
  //         let addCategory = await prisma.category.create({
  //           data: {
  //             name: payload.categoryList[i].name,
  //             icon: payload.categoryList[i].icon,
  //             type: payload?.type,
  //             parentId: payload?.parentId,
  //             menuId: payload?.menuId
  //           }
  //         });
  //       }
  //     } else {
  //       return {
  //         status: false,
  //         message: 'CategoryList is Empty',
  //         data: []
  //       }
  //     }
    
  //     return {
  //       status: true,
  //       message: 'Created Successfully',
  //       data: []
  //     }

  //   } catch (error) {
  //     console.log('error: ', error);
      
  //     return {
  //       status: false,
  //       message: 'error in createCategory',
  //       error: error.message
  //     }
  //   }
  // }

  async createMultiple(payload: any) {
    try {
      if (payload?.categoryList && payload?.categoryList.length > 0) {
        const formattedData = payload.categoryList.map(({ id, ...item }: any) => ({
          name: item.name,
          icon: item.icon,
          type: payload?.type,
          parentId: payload?.parentId,
          menuId: payload?.menuId
        }));
  
        await prisma.category.createMany({
          data: formattedData,
          skipDuplicates: true // optional: prevents failure on duplicate unique fields
        });
  
        return {
          status: true,
          message: 'Created Successfully',
          data: []
        };
      } else {
        return {
          status: false,
          message: 'CategoryList is Empty',
          data: []
        };
      }
    } catch (error) {
      console.log('error: ', error);
  
      return {
        status: false,
        message: 'Error in createCategory',
        error: error.message
      };
    }
  }

  
  // Get all Child 
  async findOne(categoryId: any, menuId: any) {
    try {
      const categoryID = parseInt(categoryId);
      const menuID = parseInt(menuId);
      let categoryDetails = await prisma.category.findUnique({
        where: { 
          id: categoryID, 
          // menuId: menuID, 
          status: 'ACTIVE' 
        },
        include: {
          category_dynamicFormCategory: {
            include: {
              formIdDetail: {
                include: {
                  elements: true
                }
              }
            }
          },
          children: {
            where: {
              status: 'ACTIVE'
            },
            include: {
              children: {
                where: {
                  status: 'ACTIVE'
                },
                include: {
                  children: {
                    where: {
                      status: 'ACTIVE'
                    },
                    include: {
                      children: {
                        where: {
                          status: 'ACTIVE'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          category_categoryIdDetail: {
            include: {
              connectToDetail: true
            }
          },
          categoryStore_fees: true,
          categoryCustomer_fees: true,
          categoryRfq_fees: true,
          category_policy: true
        },
        // orderBy: {
        //   createdAt: 'desc' as const// Sort by createdAt in descending order
        // }
      })
      if (!categoryDetails) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }
      return {
        status: true,
        message: 'Fetch Successfully',
        data: categoryDetails
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in findAll',
        error: error.message
      }
    }
  }


  async findCategoryDepth(categoryId: number, depth: number = 0): Promise<number> {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId
      },
      include: {
        children: true
      }
    });

    if (!category || !category.children || category.children.length === 0) {
      return depth;
    }

    let maxDepth = depth;
    for (const child of category.children) {
      const childDepth = await this.findCategoryDepth(child.id, depth + 1);
      if (childDepth > maxDepth) {
        maxDepth = childDepth;
      }
    }

    return maxDepth;
  }
  
  async categoryRecusive(categoryId: any, menuId: any) {
    try {
      const categoryID = parseInt(categoryId);
      const menuID = parseInt(menuId);

      // const maxDepth = await this.findCategoryDepth(categoryID);
      // console.log('maxDepth: ', maxDepth);
      let categoryDetails = await prisma.category.findUnique({
        where: { 
          id: categoryID, 
          status: 'ACTIVE' 
        },
        include: {
          children: {
            where: { status: 'ACTIVE'},
            ...this.recursive(50)
          }
        }
      })
      if (!categoryDetails) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }
      return {
        status: true,
        message: 'Fetch Successfully',
        data: categoryDetails
      }
    } catch (error) {
      console.log('error: ', error);
      
      return {
        status: false,
        message: 'error in findAll',
        error: error.message
      }
    }
  }

  private recursive(level: number) {
    if (level === 0) {
      return {
        include: {
          children: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
    return {
      include: {
        children: {
          where: { status: 'ACTIVE' },
          ...this.recursive(level - 1)
        }
      }
    };
  }

  async findUnique(payload: any, req: any) {
    try {
      const categoryId = payload.categoryId;
      // const menuId = payload.menuId;
      let categoryDetails = await prisma.category.findUnique({
        where: { 
          id: categoryId,
          // menuId: menuId
        }
      })
      if (!categoryDetails) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }
      return {
        status: true,
        message: 'Fetch Successfully',
        data: categoryDetails
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in findUnique',
        error: error.message
      }
    }
  }

  async update(payload: any, req: any) {
    try {
      const categoryId = payload.categoryId;
      let existCategory = await prisma.category.findUnique({
        where: { id: categoryId }
      });
      // const menuId = payload.menuId;
      let updatedCategory = await prisma.category.update({
        where: { id: categoryId,
          //  menuId: menuId
        },
        data: { 
          name: payload.name || existCategory.name,
          icon: payload.icon || existCategory.icon,
          connectTo: payload?.connectTo || existCategory.connectTo,
          store: payload.store || existCategory.store,
          customer: payload.customer || existCategory.customer,
          rfq: payload.rfq || existCategory.rfq,
          policy: payload.policy || existCategory.policy,
        }
      });
      return {
        status: true,
        message: 'Updated Successfully',
        data: updatedCategory
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in update',
        error: error.message
      }
    }
  }

  async delete(categoryId: any, req: any) {
    try {
      let ID = parseInt(categoryId)

      let whereCondition: any = {
        // OR: [
        //   { categoryId: ID },
        //   { categoryLocation: { contains: String(ID), mode: "insensitive" } }
        // ],
        categoryLocation: {
          contains: categoryId,
          mode: 'insensitive'
        },
      }

      let categoryUsedInProduct = await prisma.product.findMany({
        where: whereCondition,
        select: { id: true, categoryId: true, categoryLocation: true }
      });

      if (categoryUsedInProduct.length > 0) {
        for (let product of categoryUsedInProduct) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              categoryId: product.categoryId === ID ? null : product.categoryId,
              categoryLocation: null
            }
          });
        }
      }

      let updatedCategory = await prisma.category.update({
        where: { id: ID },
        data: { 
          status: 'DELETE',
          deletedAt: new Date()
        }
      });
      return {
        status: true,
        message: 'Deleted Successfully',
        data: updatedCategory
      }
    } catch (error) {
      console.log('error: ', error);
      
      return {
        status: false,
        message: 'error in delete',
        error: error.message
      }
    }
  }

  async findAll(page: any, limit: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset
      
      let findAll = await prisma.category.findMany({
        where: { 
          status: 'ACTIVE',
          menuId: { not: null },
        },
        include: {
          parent: {
            where: {
              status: 'ACTIVE'
            }
          },
          menuParent: {
            where: {
              status: 'ACTIVE'
            }
          }
        },
        orderBy: { id: 'asc' },
        skip, // Offset
        take: pageSize, // Limit
      });

      let findAllCount = await prisma.category.count({
        where: { 
          status: 'ACTIVE',
          menuId: { not: null },
        }
      });

      if (!findAll) {
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
        data: findAll,
        totalCount: findAllCount,
        page: Page,
        limit: pageSize
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in findAll',
        error: error.message
      }
    }
  }

  async getMenu(categoryId: any ) {
    try {
      const categoryID = parseInt(categoryId);
      let menuDetails = await prisma.category.findUnique({
        where: { 
          id: categoryID, 
          status: 'ACTIVE' 
        },
        include: {
          children: {
            where: {
              status: 'ACTIVE'
            }
          }
        }
      });

      if (!menuDetails) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: menuDetails
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in getMenu',
        error: error.message
      }
    }
  }
  async getCategoryLevelOne() {
    try {
      let getCategoryLevelOne = await prisma.category.findMany({
        where: { 
          status: 'ACTIVE',
          menuId: 1,
        },
        include: {
          children: {
            where: {
              status: 'ACTIVE'
            }
          },
        },
        orderBy: { id: 'asc' }
      });

      if(!getCategoryLevelOne) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getCategoryLevelOne
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in getCategoryLevelOne',
        error: error.message
      }
    }
  }

  async updateWhiteBlackList(payload: any, req: any) {
    try {
      if (payload.whiteList && payload.whiteList.length > 0) {
        for (let i=0; i<payload.whiteList.length; i++) {
          let updatedCategory = await prisma.category.update({
            where: { id: payload.whiteList[i].id },
            data: {
              whiteList: payload.whiteList[i].status
            }
          })
        }
      }

      if (payload.blackList && payload.blackList.length > 0) {
        for (let i=0; i<payload.blackList.length; i++) {
          let updatedCategory = await prisma.category.update({
            where: { id: payload.blackList[i].id },
            data: {
              blackList: payload.blackList[i].status
            }
          })
        }
      }

      return {
        status: true,
        message: 'Updated Successfully',
        data: []
      }
    } catch (error) {
      return {
        status: false,
        message: 'error, in updateWhiteBlackList',
        error: error.message
      }
    }
  }

  // create multiple connectTo
  async createCategoryConnectTo(payload: any, req: any) {
    try {
      let createdConnections = [];
      const categoryId = payload.categoryId;
      const categoryLocation = payload.categoryLocation;
  
      if (payload?.connectToList && payload?.connectToList.length > 0) {
        for (let i = 0; i < payload.connectToList.length; i++) {
          const { connectTo, connectToLocation, connectToType } = payload.connectToList[i];
  
          // Check if categoryId and connectTo already exist in the categoryConnectTo table
          const existingConnection = await prisma.categoryConnectTo.findFirst({
            where: {
              categoryId: categoryId,
              connectTo: connectTo
            }
          });
  
          // If no existing connection, create a new one
          if (!existingConnection) {
            const newConnection = await prisma.categoryConnectTo.create({
              data: {
                categoryId: categoryId,
                categoryLocation: categoryLocation,
                connectTo: connectTo,
                connectToLocation: connectToLocation,
                connectToType: connectToType
              }
            });
  
            // Add the newly created connection to the response array
            createdConnections.push(newConnection);
          }
        }
      }
  
      return {
        status: true,
        message: 'Process completed successfully',
        data: createdConnections.length > 0 ? createdConnections : 'No new connections created'
      };
  
    } catch (error) {
      return {
        status: false,
        message: 'Error in createCategoryConnectTo',
        error: error.message
      };
    }
  }
  

  async deleteCategoryConnectTo(categoryConnectToId: any, req: any) {
    try {
      const categoryConnectToID = parseInt(categoryConnectToId);

      let deleteCategoryConnectTo = await prisma.categoryConnectTo.delete({
        where: { id: categoryConnectToID }
      });
      // let updateCategoryConnectTo = await prisma.categoryConnectTo.update({
      //   where: { id: categoryConnectToID },
      //   data: {
      //     status: 'DELETE',  // Assuming you have a `status` field to mark deletion
      //     deletedAt: new Date()  // Marking the deletion time
      //   }
      // });

      return {
        status: true,
        message: 'Deleted Successfully',
        data: deleteCategoryConnectTo
      }

    } catch (error) {
      return {
        status: false,
        message: 'error, in deleteCategoryConnectTo',
        error: error.message
      }
    }
  }
}
