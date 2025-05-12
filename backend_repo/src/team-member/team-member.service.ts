import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { compare, hash, genSalt } from 'bcrypt';
import * as randomstring from 'randomstring';
import { AuthService } from 'src/auth/auth.service';
import { HelperService } from 'src/helper/helper.service';
import { NotificationService } from 'src/notification/notification.service';
import { S3service } from 'src/user/s3.service';

const prisma = new PrismaClient();

@Injectable()
export class TeamMemberService {

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly s3service: S3service,
    private readonly helperService: HelperService
  ) { }

  async create(payload: any, req: any) {
    try {
      if (!payload?.email) {
        return {
          status: 'false',
          message: 'email is required!',
        };
      }
      const userId = req?.user?.id;
      const userRoleID = parseInt(payload.userRoleId);

      const userExist = await prisma.user.findUnique({
        where: { email: payload.email }
      });

      if (userExist) {
        return {
          status: 'false',
          message: 'email already exists',
          data: [],
        };
      }

      let userRoleDetail = await prisma.userRole.findUnique({
        where: { id: userRoleID }
      })

      const salt = await genSalt(10);
      const password = randomstring.generate({
        length: 8,
        charset: "alphanumeric",
      });
      // const dummyName = randomstring.generate({
      //   length: 8,
      //   charset: "alphanumeric",
      // });
      const employeeId = randomstring.generate({
        length: 8,
        charset: "alphanumeric",
      });
      const hashedPassword = await hash(password, salt);
      let firstName = payload?.firstName || null;
      let lastName = payload?.lastName || null;
      let email = payload.email;
      let cc = payload?.cc || null;
      let phoneNumber = payload?.phoneNumber || null;
      let userRoleName = userRoleDetail.userRoleName;
      let userRoleId = userRoleID

      let newUser = await prisma.user.create({
        data: {
          firstName, 
          lastName, 
          email,
          password: hashedPassword,
          tradeRole: 'MEMBER',
          cc,
          phoneNumber,
          userType: 'USER',
          status: 'ACTIVE',
          userRoleName,
          userRoleId,
          employeeId: employeeId,
          addedBy: userId
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

      // creating username from firstName
      const username = firstName + randomstring.generate({
        length: 8,
        charset: "alphanumeric",
      });

      let updatedUser = await prisma.user.update({
        where: { id: newUser.id },
        data: {
          uniqueId: requestId,
          userName: username
        }
      });
      
      let data = {
        email: email,
        name: firstName || 'User',
        password: password
      }
      this.notificationService.addMemberMail(data)

      // ------------------------------------------ Storing ---------------------------------
      let newMember = await prisma.teamMember.create({
        data: {
          userId: newUser.id,
          userRoleId: userRoleID,
          addedBy: userId,
          status: payload?.status || 'ACTIVE'
        }
      })
      

      return {
        status: true,
        message: 'Created Successfully',
        data: newMember
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in create team member',
        error: error.message
      }
    }
  }

  async getAllTeamMember (page: any, limit: any, req: any) {
    try {
      // const userId = req?.user?.id;

      let userId = req?.user?.id;
      // let adminDetail = await prisma.user.findUnique({
      //   where: { id: userId },
      //   select: { id: true, tradeRole: true, addedBy: true
      //   }
      // });
      // if (adminDetail && adminDetail.tradeRole === "MEMBER") {
      //   userId = adminDetail.addedBy;
      // }
      userId = await this.helperService.getAdminId(userId);
      console.log("admin_id: ", userId);

      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10000;
      const skip = (Page - 1) * pageSize; // Calculate the offset
  
      let getAllTeamMembers = await prisma.teamMember.findMany({
        where: {
          addedBy: userId,
        },
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
        include: {
          userDetail: true, 
          userRolDetail: true,
        },
      });
  
      let getAllTeamMemberCount = await prisma.teamMember.count({
        where: {
          addedBy: userId,
          status: 'ACTIVE',
        },
      });
  
      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllTeamMembers,
        totalCount: getAllTeamMemberCount,
        selectedAdminId: userId
      };
  
    } catch (error) {
      return {
        status: false,
        message: 'error in getAllTeamMember',
        error: error.message
      };
    }
  }

  async getOneTeamMember (memberId: any, req: any) {
    try {
      if (!memberId) {
        return {
          status: false,
          message: 'memberId is required',
        };
      }
  
      let teamMember = await prisma.teamMember.findUnique({
        where: { id: parseInt(memberId) },
        include: {
          userDetail: true, // Fetch associated user details
          userRolDetail: true, // Fetch associated user role details
        },
      });
  
      if (!teamMember) {
        return {
          status: false,
          message: 'Team member not found',
        };
      }
  
      return {
        status: true,
        message: 'Fetch Successfully',
        data: teamMember,
      };
  
    } catch (error) {
      return {
        status: false,
        message: 'Error in getOneTeamMember',
        error: error.message,
      };
    }
  }

  async update (payload: any, req: any) {
    try {
      const userId = req?.user?.id;
  
      if (!payload.memberId) {
        return {
          status: false,
          message: 'memberId is required',
        };
      }
  
      // Check if the team member exists
      let existingTeamMember = await prisma.teamMember.findUnique({
        where: { id: parseInt(payload.memberId) }
      });
  
      if (!existingTeamMember) {
        return {
          status: false,
          message: 'Team member not found',
        };
      }
  
      // Prepare update data (filter out undefined fields)
      let updateData: any = {};

      if (payload.userRoleId) updateData.userRoleId = payload.userRoleId;
      if (payload.status) updateData.status = payload.status;
  
      // Update the team member
      let updatedTeamMember = await prisma.teamMember.update({
        where: { id: parseInt(payload.memberId) },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      // if firstName, lastName etc is changed then update it in user
      if (payload.firstName || payload.lastName || payload.cc || payload.phoneNumber) {
        await prisma.user.update({
          where: { id: existingTeamMember.userId },
          data: {
            firstName: payload.firstName,
            lastName: payload.lastName,
            cc: payload.cc,
            phoneNumber: payload.phoneNumber,
          }
        })
      }

      // userRoleId is changed then update it in user table as well
      if (payload.userRoleId) {
        let userRoleDetail = await prisma.userRole.findUnique({
          where: { id: parseInt(payload.userRoleId) }
        });
        await prisma.user.update({
          where: { id: existingTeamMember.userId },
          data: {
            userRoleId: payload.userRoleId,
            userRoleName: userRoleDetail.userRoleName,
          }
        })
      }
  
      return {
        status: true,
        message: 'Updated Successfully',
        data: updatedTeamMember,
      };
  
    } catch (error) {
      return {
        status: false,
        message: 'Error in update',
        error: error.message,
      };
    }
  }
  
  
  

}
