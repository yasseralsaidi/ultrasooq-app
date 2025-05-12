import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notification/notification.service';
import { S3service } from 'src/user/s3.service';
import { PrismaClient } from '@prisma/client';
import * as randomstring from 'randomstring';
import { compare, hash, genSalt } from 'bcrypt';
import { HelperService } from 'src/helper/helper.service';

const prisma = new PrismaClient();

@Injectable()
export class AdminMemberService {

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly s3service: S3service,
    private readonly helperService: HelperService
  ) { }

  /**
   *  Admin Role
   */

  async createAdminRole(payload: any, req: any) {
    try {
      // const adminId = req?.user?.id;
      let adminId = req?.user?.id;
      adminId = await this.helperService.getSuperAdminORSubAdminId(adminId);
      console.log("admin_id: ", adminId);

      if (!payload.adminRoleName) {
        return {
          status: false,
          message: 'adminRoleName is required',
        };
      }

      let existAdminRole = await prisma.adminRole.findFirst({
        where: { adminRoleName: payload.adminRoleName }
      });

      if (existAdminRole) {
        return {
          status: true,
          message: 'Already exists',
          data: existAdminRole
        };
      }

      let newAdminRole = await prisma.adminRole.create({
        data: {
          adminRoleName: payload.adminRoleName,
          addedBy: adminId
        }
      });

      return {
        status: true,
        message: 'Created successfully',
        data: newAdminRole,
        selectedSuperAdminId: adminId
      };
    } catch (error) {
      return {
        status: false,
        message: 'Error in createAdminRole',
        error: error.message
      };
    }
  }

  async getAllAdminRole(page: any, limit: any, searchTerm: any, req: any) {
    try {
      // const userId = req?.user?.id;
      let userId = req?.user?.id;
      userId = await this.helperService.getSuperAdminORSubAdminId(userId);
      console.log("admin_id: ", userId);

      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize;

      let whereCondition: any= {
        addedBy: userId,
        status: { in: ["ACTIVE", "INACTIVE"] }
      };

      if (searchTerm) {
        whereCondition.adminRoleName = {
          contains: searchTerm,
          mode: 'insensitive'
        };
      }

      let getAllAdminRoles = await prisma.adminRole.findMany({
        where: whereCondition,
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
      });

      let totalAdminRoles = await prisma.adminRole.count({
        where: whereCondition,
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllAdminRoles,
        totalCount: totalAdminRoles,
        selectedAdminId: userId
      };

    } catch (error) {
      return {
        status: false,
        message: 'Error in getAllAdminRole',
        error: error.message
      };
    }
  }

  async updateAdminRole(req: any) {
    try {
      const adminRoleId = req.body.adminRoleId;
      if (!adminRoleId) {
        return {
          status: false,
          message: "adminRoleId is required!"
        };
      }

      let updateAdminRole = await prisma.adminRole.update({
        where: { id: parseInt(adminRoleId) },
        data: {
          adminRoleName: req.body.adminRoleName
        }
      });

      return {
        status: true,
        message: 'Updated Successfully',
        data: updateAdminRole
      };

    } catch (error) {
      return {
        status: false,
        message: 'Error in updateAdminRole',
        error: error.message
      };
    }
  }

  async deleteAdminRole(req: any) {
    try {
      const ID = parseInt(req.query.id);

      let adminRoleExist = await prisma.adminRole.findUnique({
        where: { id: ID }
      });
      if (!adminRoleExist) {
        return {
          status: false,
          message: 'adminRoleId not found',
          data: []
        };
      }

      let adminRoleInMember = await prisma.adminMember.findMany({
        where: { adminRoleId: ID }
      });
      if (adminRoleInMember.length > 0) {
        return {
          status: false,
          message: 'adminRoleId is associated with admin members',
          data: []
        };
      }

      let updateAdminRole = await prisma.adminRole.update({
        where: { id: ID },
        data: {
          status: "DELETE"
        }
      });

      return {
        status: true,
        message: 'Deleted successfully',
        data: updateAdminRole
      };

    } catch (error) {
      return {
        status: false,
        message: 'Error in deleteAdminRole',
        error: error.message
      };
    }
  }

  /**
   *  Admin Permission
   */
  async createAdminPermission(payload: any, req: any) {
    try {
      // const userId = req?.user?.id;
      let userId = req?.user?.id;
      userId = await this.helperService.getSuperAdminORSubAdminId(userId);
      console.log("admin_id: ", userId);

      if (!payload.name) {
        return {
          status: false,
          message: 'name is required',
        };
      }

      // Check if the admin permission already exists
      let existPermission = await prisma.adminPermission.findFirst({
        where: { name: payload.name }
      });

      if (existPermission) {
        return {
          status: true,
          message: 'Already exists',
          data: existPermission
        };
      }

      // Create new admin permission
      let newPermission = await prisma.adminPermission.create({
        data: {
          name: payload.name,
          addedBy: userId
        }
      });
  
      return {
        status: true,
        message: 'Created successfully',
        data: newPermission,
        selectedSuperAdminId: userId
      };

    } catch (error) {
      console.log("error:", error);
      
      return {
        status: false,
        message: 'Error in createAdminPermission',
        error: error.message
      };
    }
  }

  async getAllAdminPermission(page: any, limit: any, searchTerm: any, req: any) {
    try {
      // const userId = req?.user?.id;
      let userId = req?.user?.id;
      userId = await this.helperService.getSuperAdminORSubAdminId(userId);
      console.log("admin_id: ", userId);

      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate offset
  
      let whereCondition: any = {
        addedBy: userId,
        status: { in: ["ACTIVE", "INACTIVE"] }
      };
  
      // Apply search filter if searchTerm is provided
      if (searchTerm) {
        whereCondition.name = {
          contains: searchTerm,
          mode: 'insensitive' // Case-insensitive search
        };
      }
  
      // Fetch paginated admin permissions
      let getAllPermissions = await prisma.adminPermission.findMany({
        where: whereCondition,
        orderBy: { id: 'desc' },
        skip, // Offset
        take: pageSize // Limit
      });
  
      // Count total admin permissions
      let totalPermissions = await prisma.adminPermission.count({
        where: whereCondition
      });
  
      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllPermissions,
        totalCount: totalPermissions,
        selectedSuperAdminId: userId
      };
  
    } catch (error) {
      return {
        status: false,
        message: 'Error in getAllAdminPermission',
        error: error.message
      };
    }
  }


  /**
   *  Set Admin Permission
   */

  async setAdminRolePermission(payload: any, req: any) {
    try {
      const { adminRoleId, permissionIdList } = payload;

      // Validate adminRoleId
      if (!adminRoleId) {
        return { status: false, message: "adminRoleId is required" };
      }

      // Validate permissionIdList
      if (!Array.isArray(permissionIdList) || permissionIdList.length === 0) {
        return { status: false, message: "permissionIdList must be a non-empty array" };
      }

      // Insert permissions
      const createdPermissions = await Promise.all(
        permissionIdList.map(async (item) => {
          return await prisma.adminRolePermission.create({
            data: {
              adminRoleId,
              adminPermissionId: item.permissionId,
              status: "ACTIVE",
            },
          });
        })
      );

      return {
        status: true,
        message: "Permissions assigned successfully",
        data: createdPermissions,
      };

    } catch (error) {
      return {
        status: false,
        message: "Error in setAdminRolePermission",
        error: error.message,
      };
    }
  }

  async getAllAdminRoleWithPermission(page: any, limit: any, searchTerm: any, req: any) {
    try {
      const Page = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize;

      let whereCondition: any = {};

      if (searchTerm) {
        whereCondition.adminRoleDetail = {
          name: { 
            contains: searchTerm, 
            mode: "insensitive" 
          },
        };
      }

      const adminRoles = await prisma.adminRole.findMany({
        where: whereCondition,
        include: {
          adminRolePermission: {
            include: {
              adminPermissionDetail: true,
            },
          },
        },
        orderBy: { id: "desc" },
        skip,
        take: pageSize,
      });

      const totalAdminRoles = await prisma.adminRole.count({ where: whereCondition });

      return {
        status: true,
        message: "Fetched successfully",
        data: adminRoles,
        totalCount: totalAdminRoles,
      };

    } catch (error) {
      return {
        status: false,
        message: "Error in getAllAdminRoleWithPermission",
        error: error.message,
      };
    }
  }

  async updateAdminRolePermission(payload: any, req: any) {
    try {
      const { adminRoleId, permissionIdList } = payload;

      // Validate adminRoleId
      if (!adminRoleId) {
        return { status: false, message: "adminRoleId is required" };
      }

      // Validate permissionIdList
      if (!Array.isArray(permissionIdList) || permissionIdList.length === 0) {
        return { status: false, message: "permissionIdList must be a non-empty array" };
      }

      // Check if admin role exists
      const existingAdminRole = await prisma.adminRole.findUnique({
        where: { id: adminRoleId },
      });

      if (!existingAdminRole) {
        return { status: false, message: "Admin role not found" };
      }

      // Delete existing permissions
      await prisma.adminRolePermission.deleteMany({
        where: { adminRoleId },
      });

      // Insert new permissions
      await Promise.all(
        permissionIdList.map(async (item) => {
          await prisma.adminRolePermission.create({
            data: {
              adminRoleId,
              adminPermissionId: item.permissionId,
              status: "ACTIVE",
            },
          });
        })
      );

      return {
        status: true,
        message: "Permissions updated successfully"
      };

    } catch (error) {
      return {
        status: false,
        message: "Error in updateAdminRolePermission",
        error: error.message,
      };
    }
  }

  async getOneAdminRoleWithPermission(adminRoleId: any) {
    try {
      // Validate adminRoleId
      if (!adminRoleId) {
        return {
          status: false,
          message: "AdminRoleId is required",
        };
      }

      // Fetch admin role with associated permissions
      const adminRole = await prisma.adminRole.findUnique({
        where: { id: parseInt(adminRoleId) },
        include: {
          adminRolePermission: {
            include: {
              adminPermissionDetail: true, // Fetch permission details
            },
          },
        },
      });

      // Check if the admin role exists
      if (!adminRole) {
        return {
          status: false,
          message: "Admin Role not found",
        };
      }

      return {
        status: true,
        message: "Fetch Successfully",
        data: adminRole,
      };
    } catch (error) {
      return {
        status: false,
        message: "Error fetching admin role with permissions",
        error: error.message,
      };
    }
  }



  /**
   * Admin Member
   */
  async create(payload: any, req: any) {
    try {
      if (!payload?.email) {
        return { status: false, message: 'Email is required!' };
      }
      // const userId = req?.user?.id;
      let userId = req?.user?.id;
      userId = await this.helperService.getSuperAdminORSubAdminId(userId);
      console.log("admin_id: ", userId);


      const adminRoleId = parseInt(payload.adminRoleId);

      const userExist = await prisma.user.findUnique({ where: { email: payload.email } });
      if (userExist) {
        return { 
          status: false, 
          message: 'Email already exists', 
          data: [] 
        };
      }

      const adminRoleDetail = await prisma.adminRole.findUnique({ where: { id: adminRoleId } });

      const salt = await genSalt(10);
      const password = payload?.password || randomstring.generate({ length: 8, charset: 'alphanumeric' });
      const employeeId = randomstring.generate({ length: 8, charset: 'alphanumeric' });
      const hashedPassword = await hash(password, salt);
      
      let newUser = await prisma.user.create({
        data: {
          firstName: payload?.firstName || null,
          lastName: payload?.lastName || null,
          email: payload.email,
          password: hashedPassword,
          tradeRole: "ADMINMEMBER",
          cc: payload?.cc || null,
          phoneNumber: payload?.phoneNumber || null,
          userType: 'ADMIN',
          status: 'ACTIVE',
          // userRoleName: userRoleDetail?.userRoleName,
          // userRoleId: userRoleID,
          employeeId,
          addedBy: userId,
          adminRoleId: adminRoleId
        }
      });

      let idString = newUser.id.toString();
      let requestId;

      if (idString.length >= 7) {
        requestId = idString;
      } else {
        // Pad with zeros to make it an 8-digit number
        requestId = "0".repeat(7 - idString.length) + idString;
      }

      const username = (payload?.firstName || 'Sub-Admin') + randomstring.generate({ length: 8, charset: 'alphanumeric' });
      await prisma.user.update({
        where: { id: newUser.id },
        data: { 
          uniqueId: requestId, 
          userName: username 
        }
      });

      let data = {
        email: payload.email,
        name: payload?.firstName || 'Admin',
        password: password
      }
      this.notificationService.addMemberMail(data);

      let newAdminMember = await prisma.adminMember.create({
        data: {
          userId: newUser.id,
          adminRoleId: adminRoleId,
          addedBy: userId,
          status: payload?.status || 'ACTIVE'
        }
      });

      return { 
        status: true, 
        message: 'Admin member created successfully', 
        data: newAdminMember,
        selectedSuperAdminId: userId
      };
    } catch (error) {
      return { 
        status: false, 
        message: 'Error creating admin member', 
        error: error.message 
      };
    }
  }

  async getAll(page: any, limit: any, req: any) {
    try {
      // const userId = req?.user?.id;
      let userId = req?.user?.id;
      userId = await this.helperService.getSuperAdminORSubAdminId(userId);
      console.log("admin_id: ", userId);

      const Page = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10000;
      const skip = (Page - 1) * pageSize;
      
      const adminMembers = await prisma.adminMember.findMany({
        where: { addedBy: userId },
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
        include: { 
          userDetail: true, 
          adminRolDetail: true 
        },
      });
      
      const totalCount = await prisma.adminMember.count({ 
        where: { 
          addedBy: userId, 
          status: 'ACTIVE' 
        } 
      });
      
      return { 
        status: true, 
        message: 'Fetched successfully', 
        data: adminMembers, 
        totalCount ,
        selectedSuperAdminId: userId
      };
    } catch (error) {
      return { 
        status: false, 
        message: 'Error fetching admin members', 
        error: error.message 
      };
    }
  }

  async getOne(adminMemberId: any, req: any) {
    try {
      if (!adminMemberId) return { status: false, message: 'Admin member ID is required' };
      
      const adminMember = await prisma.adminMember.findUnique({
        where: { id: parseInt(adminMemberId) },
        include: { 
          userDetail: true, 
          adminRolDetail: true 
        },
      });
      
      if (!adminMember) return { status: false, message: 'Admin member not found' };

      return { 
        status: true, 
        message: 'Fetched successfully', 
        data: adminMember 
      };
    } catch (error) {
      return { 
        status: false, 
        message: 'Error fetching admin member', 
        error: error.message 
      };
    }
  }

  async update(payload: any, req: any) {
    try {
      if (!payload.adminMemberId) return { status: false, message: 'Admin member ID is required' };
      
      const existingAdminMember = await prisma.adminMember.findUnique({ 
        where: { 
          id: parseInt(payload.adminMemberId)
        }
      });

      if (!existingAdminMember) return { status: false, message: 'Admin member not found' };

      let updateData: any = {};
      if (payload.adminRoleId) updateData.adminRoleId = payload.adminRoleId;
      if (payload.status) updateData.status = payload.status;

      const updatedAdminMember = await prisma.adminMember.update({
        where: { 
          id: parseInt(payload.adminMemberId) 
        },
        data: { 
          ...updateData, 
          updatedAt: new Date() 
        },
      });
      
      if (payload.firstName || payload.lastName || payload.cc || payload.phoneNumber) {
        await prisma.user.update({
          where: { id: existingAdminMember.userId },
          data: {
            firstName: payload.firstName,
            lastName: payload.lastName,
            cc: payload.cc,
            phoneNumber: payload.phoneNumber,
          }
        });
      }
      
      return { 
        status: true, 
        message: 'Updated successfully', 
        data: updatedAdminMember
      };
      
    } catch (error) {
      return { 
        status: false, 
        message: 'Error updating admin member', 
        error: error.message 
      };
    }
  }



}