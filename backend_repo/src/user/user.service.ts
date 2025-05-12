import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { compare, hash, genSalt } from 'bcrypt';
import { compareSync } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notification/notification.service';
import { S3service } from './s3.service';
import { retry } from 'rxjs';
import * as randomstring from 'randomstring';
import { HelperService } from 'src/helper/helper.service';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly s3service: S3service,
    private readonly helperService: HelperService
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      if (createUserDto.loginType === 'MANUAL') {
        if (createUserDto.email) {
          let re =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
          // console.log(re.test(String(createUserDto.email)));
          if (!re.test(String(createUserDto.email))) {
            return {
              status: 'false',
              message: 'enter a valid email',
              data: [],
            };
          }
          createUserDto.email = createUserDto.email.toLowerCase();
        }

        const userExist = await prisma.user.findUnique({
          where: { email: createUserDto.email }
        });

        if (userExist) {
          return {
            status: 'false',
            message: 'email already exists',
            data: [],
          };
        }

        let tradeRole;
        if (createUserDto.tradeRole == 'COMPANY') {
          tradeRole = 'COMPANY'
        }
        if (createUserDto.tradeRole == 'FREELANCER') {
          tradeRole = 'FREELANCER'
        }
        let firstName = createUserDto.firstName;
        let lastName = createUserDto.lastName;
        let email = createUserDto.email;
        let cc = createUserDto.cc;
        let phoneNumber = createUserDto.phoneNumber;
        let otp = Math.floor(1000 + Math.random() * 9000);
        let otpValidTime = new Date(new Date().getTime() + 5 * 60000);
        const salt = await genSalt(10);
        const password = await hash(createUserDto.password, salt);

        let user = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            otp,
            otpValidTime,
            password,
            tradeRole,
            cc,
            phoneNumber,
            userType: 'USER'
          }
        });

        let idString = user.id.toString();
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
          where: { id: user.id },
          data: {
            uniqueId: requestId,
            userName: username
          }
        });
        let data = {
          email: createUserDto.email,
          name: createUserDto.firstName,
          otp: otp
        }
        this.notificationService.mailService(data)


        return {
          status: true,
          message: 'Register Successfully',
          otp: otp
        };

      } else {

        if (createUserDto.email) {
          let re =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
          // console.log(re.test(String(createUserDto.email)));
          if (!re.test(String(createUserDto.email))) {
            return {
              status: 'false',
              message: 'enter a valid email',
              data: [],
            };
          }
          createUserDto.email = createUserDto.email.toLowerCase();
        }

        const userExist = await prisma.user.findUnique({
          where: { email: createUserDto.email }
        });
        if (userExist) {
          return {
            status: 'false',
            message: 'email already exists',
            data: [],
          };
        }

        let tradeRole;
        if (createUserDto.tradeRole == 'COMPANY') {
          tradeRole = 'COMPANY'
        }
        if (createUserDto.tradeRole == 'FREELANCER') {
          tradeRole = 'FREELANCER'
        }
        let firstName = createUserDto.firstName;
        let lastName = createUserDto.lastName;
        let email = createUserDto.email;
        let cc = createUserDto.cc;
        let phoneNumber = createUserDto.phoneNumber;
        // let otp = Math.floor(1000 + Math.random() * 9000);
        // let otpValidTime = new Date(new Date().getTime() + 5 * 60000);
        const salt = await genSalt(10);
        const password = await hash(createUserDto.password, salt);

        let loginType;
        if (createUserDto.loginType === 'FACEBOOK') {
          loginType = 'FACEBOOK'
        } else {
          loginType = 'GOOGLE'
        }

        let user = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            // otp,
            // otpValidTime,
            status: 'ACTIVE',
            password,
            tradeRole,
            cc,
            phoneNumber,
            userType: 'USER',
            loginType
          }
        });

        let idString = user.id.toString();
        let requestId;

        if (idString.length >= 7) {
          requestId = idString;
        } else {
          // Pad with zeros to make it an 8-digit number
          requestId = "0".repeat(7 - idString.length) + idString;
        }

        let updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            uniqueId: requestId,
          }
        })
        // let data = {
        //   email: createUserDto.email,
        //   name: createUserDto.firstName,
        //   otp: otp
        // }
        // this.notificationService.mailService(data)

        let userAuth = {
          id: user.id,
        }
        let authToken = await this.authService.login(userAuth);
        const restokenData = authToken;
        return {
          status: true,
          message: 'Registered Successfully',
          accessToken: restokenData.accessToken,
          data: user,
        };

      }

    } catch (error) {
      return {
        status: true,
        message: 'error in register',
        error: error.message
      }
    }
  }

  async registerValidateOtp(payload: any) {
    try {
      let { email, otp } = payload;
      const userDetail = await prisma.user.findUnique({
        where: { email }
      });
      if (!userDetail) {
        return {
          status: false,
          message: 'User not found',
          data: [],
        };
      }
      if (otp != userDetail.otp) {
        return {
          status: false,
          message: 'Invalid OTP',
          data: [],
        };
      }
      if (new Date() > userDetail.otpValidTime) {
        return {
          status: false,
          message: 'Otp Expires',
          data: [],
        };
      }

      let updatedUserDetail = await prisma.user.update({
        where: { email },
        data: {
          otp: null,
          otpValidTime: null,
          status: 'ACTIVE',
        },
      });

      let userAuth = {
        id: userDetail.id,
      }
      let authToken = await this.authService.login(userAuth);
      const restokenData = authToken;
      return {
        status: true,
        message: 'OTP Verified Successfully',
        accessToken: restokenData.accessToken,
        data: updatedUserDetail,
      };

    } catch (error) {
      return {
        status: false,
        message: 'error in registerValidateOtp',
        error: error.message
      }
    }
  }

  async resendOtp(payload: any) {
    try {
      const userDetail = await prisma.user.findUnique({
        where: { email: payload.email },
      });
      if (!userDetail) {
        return {
          status: false,
          message: 'User not found',
          data: [],
        };
      }
      let otp = Math.floor(1000 + Math.random() * 9000);
      let otpValidTime = new Date(new Date().getTime() + 5 * 60000);
      // mailService
      // smsService
      const updateUser = await prisma.user.update({
        where: {
          email: payload.email,
        },
        data: {
          otp,
          otpValidTime
        },
      })
      let data = {
        email: payload.email,
        name: userDetail.firstName,
        otp: otp
      }
      this.notificationService.mailService(data);

      return {
        status: true,
        message: "Resend OTP Successfully",
        otp: otp
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in resendOtp',
        data: []
      }
    }
  }

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
          message: 'User not found',
          data: [],
        };
      }
      if (user && user.resetPassword == 1) {
        return {
          status: true,
          message: 'An OTP was sent to your email, for reset password.',
          data: []
        }
      }
      if (user && user.status == 'INACTIVE') {
        let otp = Math.floor(1000 + Math.random() * 9000);
        let otpValidTime = new Date(new Date().getTime() + 5 * 60000);
        // mailService
        // smsService
        const updateUser = await prisma.user.update({
          where: {
            email: payload.email,
          },
          data: {
            otp,
            otpValidTime
          },
        })
        let data = {
          email: payload.email,
          name: userEmail.firstName,
          otp: otp
        }
        this.notificationService.mailService(data);

        return {
          status: true,
          message: "An OTP was sent to your email.",
          data: {
            status: "INACTIVE"
          }
        };

        // return {
        //   status: false,
        //   message: 'User Inactive',
        //   data: [],
        // };
      }
      if (user && user.status == 'DELETE') {
        return {
          status: false,
          message: 'User Deleted',
          data: [],
        };
      }
      if (compareSync(payload.password, user.password)) {

        let userAuth = {
          id: user.id,
        }
        // console.log('userAuth: ', userAuth);

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
      console.log("error:: ", error);
      
      return {
        status: false,
        message: 'error in login',
        data: []
      }
    }
  }

  async socialLogin(payload: any) {
    try {
      const email = payload.email;
      let userEmail = await prisma.user.findUnique({
        where: { email }
      });

      let user = userEmail;
      if (!user) {

        return {
          status: false,
          message: 'Email Not Found',
          data: [],
        };

        // let firstName = payload.firstName;
        // let lastName = payload.lastName;
        // let email = payload.email;

        // let user = await prisma.user.create({
        //   data: { 
        //     firstName, 
        //     lastName, 
        //     email,
        //     status: 'ACTIVE',
        //     loginType: payload?.loginType ? payload?.loginType : 'GOOGLE',
        //     tradeRole: payload?.tradeRole ? payload?.tradeRole : 'BUYER',
        //     userType: 'USER'
        //   }
        // });

        // let idString = user.id.toString();
        // let requestId;

        // if (idString.length >= 7) {
        //   requestId = idString;
        // } else {
        //   // Pad with zeros to make it an 8-digit number
        //   requestId = "0".repeat(7 - idString.length) + idString;
        // }

        // let updatedUser = await prisma.user.update({
        //   where: { id: user.id },
        //   data: {
        //     uniqueId: requestId,
        //   }
        // })

        // let userAuth = {
        //   id: user.id,
        // }
        // let authToken = await this.authService.login(userAuth);
        // const restokenData = authToken;
        // return {
        //   status: true,
        //   message: 'Registered Successfully',
        //   accessToken: restokenData.accessToken,
        //   data: user,
        // };
      } else {
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
      }


    } catch (error) {
      return {
        status: false,
        message: 'error in socialLogin',
        data: []
      }
    }
  }

  async me(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      let userDetail = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userPhone: true,
          userSocialLink: true,
          userProfile: {
            include: {
              userProfileBusinessType: {
                include: {
                  userProfileBusinessTypeTag: true
                }
              }
            }
          },
          userBranch: {
            include: {
              userBranchBusinessType: {
                include: {
                  userBranch_BusinessType_Tag: true
                },
              },
              userBranchTags: {
                include: {
                  userBranchTagsTag: true
                }
              },
              userBranch_userBranchCategory: {
                include: {
                  userBranchCategory_category: true
                }
              }
            }
          },
          // user_productReview: {
          //   select: {
          //     productId: true
          //   }
          // }
          // userRoleDetail: {
          //   include: {
          //     userRolePermission: {
          //       include: {
          //         permissionDetail: true
          //       }
          //     }
          //   }
          // }
        },
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
          userRoleDetail: {
            select: {
              id: true,
              userRoleName: true,
              addedBy: true,
              status: true,
              createdAt: true,
              updatedAt: true,
              deletedAt: true,
      
              // Include permissions
              userRolePermission: {
                select: {
                  id: true,
                  userRoleId: true,
                  permissionId: true,
                  status: true,
                  createdAt: true,
                  updatedAt: true,
                  deletedAt: true,
                  permissionDetail: {
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

  async updateProfile(payload: any, req: any) {
    try {
      const userId = req.user.id;
      let userDetail = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (!userDetail) {
        return {
          status: false,
          message: "Not Found",
          data: []
        };
      }
      // if (payload.email) {
      //   let re =
      //     /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      //   console.log(re.test(String(payload.email)));
      //   if (!re.test(String(payload.email))) {
      //     return {
      //       status: 'false',
      //       message: 'enter a valid email',
      //       data: [],
      //     };
      //   }
      //   payload.email = payload.email.toLowerCase();
      // }
      // const userEmail = await prisma.user.findUnique({
      //   where: { email: payload.email },
      // });
      // if ( userEmail && userDetail.email != payload.email ) {
      //   return {
      //     status: false,
      //     message: 'Email already exists',
      //     data: [],
      //   };
      // }

      if (payload?.userName) {
        let existUserName = await prisma.user.findFirst({
          where: { userName: payload?.userName }
        });
        if (existUserName && userDetail?.userName != payload.userName) {
          return {
            status: false,
            message: 'userName already exists',
            data: [],
          };
        }
      }

      let updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: payload.firstName ? payload.firstName : userDetail.firstName,
          lastName: payload.lastName ? payload.lastName : userDetail.lastName,
          userName: payload.userName ? payload.userName : userDetail.userName,
          dateOfBirth: payload.dateOfBirth ? payload.dateOfBirth : userDetail.dateOfBirth,
          email: payload.email ? payload.email : userDetail.email,
          // profilePicture: payload.profilePicture ? await this.s3service.s3_upload(payload.profilePicture, userId) as string : userDetail.profilePicture,
          profilePicture: payload.profilePicture ? payload.profilePicture : userDetail.profilePicture,
          gender: payload.gender ? payload.gender : userDetail.gender,
          cc: payload.cc ? payload.cc : userDetail.cc,
          phoneNumber: payload.phoneNumber ? payload.phoneNumber : userDetail.phoneNumber,
          identityProof: payload?.identityProof,
          identityProofBack: payload?.identityProofBack,
          tradeRole: payload?.tradeRole ? payload?.tradeRole : userDetail.tradeRole
        }
      });
      if (payload.phoneNumberList) {
        // console.log("payload.phoneNumberList: ", payload.phoneNumberList);
        // let numberList = JSON.parse(payload.phoneNumberList);
        await prisma.userPhone.deleteMany({
          where: { userId: userId }
        });
        let numberList = payload.phoneNumberList;
        for (let i = 0; i < numberList.length; i++) {
          let addUserPhone = await prisma.userPhone.create({
            data: {
              userId: userId,
              cc: numberList[i]?.cc || '+91',
              phoneNumber: numberList[i].phoneNumber
            }
          });
        }
      }

      if (payload.socialLinkList) {
        await prisma.userSocialLink.deleteMany({
          where: { userId: userId }
        });
        let linkList = payload.socialLinkList;
        for (let j = 0; j < linkList.length; j++) {
          let addUserSocialLink = await prisma.userSocialLink.create({
            data: {
              userId: userId,
              linkType: linkList[j].linkType,
              link: linkList[j].link
            }
          });
        }
      }

      return {
        status: true,
        message: 'Updated Successfully',
        data: updatedUser
      }
    } catch (error) {
      console.log('error: ', error);

      return {
        status: false,
        message: 'error in updateProfile',
        error: error.message
      }
    }
  }

  async changePassword(payload: any, req: any) {
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

      if (compareSync(payload.password, userDetail.password)) {

        if (payload.newPassword != payload.confirmPassword) {
          return {
            status: false,
            message: 'Password Missmatch',
            data: []
          }
        }
        const salt = await genSalt(10);
        const password = await hash(payload.newPassword, salt);

        let updatedUserDetail = await prisma.user.update({
          where: { id: userId },
          data: { password: password },
        });

        return {
          status: true,
          message: 'The password has been updated successfully.',
          data: updatedUserDetail
        }

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
        message: 'error in changePassword',
        error: error.message
      }
    }
  }

  async findAll() {
    try {
      let page = 1;
      let pageSize = 10;
      const skip = (page - 1) * pageSize; // Calculate the offset
      let allUser = await prisma.user.findMany({
        include: {
          userPhone: true,
        },
        skip, // Offset
        take: pageSize, // Limit
      });
      if (!allUser) {
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
        data: allUser
      }
    } catch (error) {
      return {
        status: true,
        message: 'error in findAll',
        error: error.message
      }
    }
  }

  async findUnique(payload: any) {
    try {
      const userId = payload.userId;
      let userDetail = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userPhone: true,
          userSocialLink: true,
          userProfile: {
            include: {
              userProfileBusinessType: {
                include: {
                  userProfileBusinessTypeTag: true
                }
              }
            }
          },
          userBranch: {
            include: {
              userBranchBusinessType: {
                include: {
                  userBranch_BusinessType_Tag: true
                },
              },
              userBranchTags: {
                include: {
                  userBranchTagsTag: true
                }
              }
            }
          }
        },
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
        status: true,
        message: 'error in findUnique',
        error: error.message
      }
    }
  }

  async addUserPhone(payload: any, req: any) {
    try {
      const userId = req?.user?.id
      const { phoneNumber } = payload;

      const newUserPhone = await prisma.userPhone.create({
        data: {
          phoneNumber,
          userId,
        }
      });

      return {
        status: true,
        message: 'User phone added successfully',
        data: newUserPhone,
      };
    } catch (error) {
      console.error('Error adding user phone:', error);
      return {
        status: false,
        message: 'Failed to add user phone',
        error: error.message,
      };
    }
  }

  async addUserSocialLink(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      let addUserSocialLink = await prisma.userSocialLink.create({
        data: {
          userId: userId,
          linkType: payload.linkType,
          link: payload.link
        }
      })
      return {
        status: true,
        message: 'Added Successfully',
        data: addUserSocialLink
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in addUserSocialLink',
        error: error.message
      }
    }
  }

  async viewOneUserPhone(payload: any) {
    try {
      const userId = payload.userId;
      let userDetail = await prisma.userPhone.findUnique({
        where: { id: userId },
        include: {
          user: true
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

    }
  }

  async forgetPassword(payload: any) {
    try {
      if (payload.email) {
        let re =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        console.log(re.test(String(payload.email)));
        if (!re.test(String(payload.email))) {
          return {
            status: 'false',
            message: 'enter a valid email',
            data: [],
          };
        }
        payload.email = payload.email.toLowerCase();
      }

      let userDetail = await prisma.user.findUnique({
        where: { email: payload.email },
      })
      if (!userDetail) {
        return {
          status: false,
          message: 'If you are register users you will get the instruction of reset password shortly',
          data: []
        }
      }

      if (userDetail && userDetail.status == 'ACTIVE') {
        let userAuth = {
          id: userDetail.id,
        }
        let otp = Math.floor(1000 + Math.random() * 9000);
        let otpValidTime = new Date(new Date().getTime() + 5 * 60000);
        await prisma.user.update({
          where: { id: userDetail.id },
          data: {
            resetPassword: 1,
            otp: otp,
            otpValidTime: otpValidTime
          },
        });
        let authToken = await this.authService.getToken(userAuth);
        const restokenData = authToken;
        var link = process.env.FRONTEND_SERVER + "/reset?token=" + restokenData.accessToken;

        let data = {
          email: userDetail.email,
          name: userDetail.firstName,
          otp: otp,
          link: link
        }
        this.notificationService.sendOtp(data)

        return {
          status: true,
          message: 'A verification OTP was sent to your email.',
          // data: link,
          otp: otp
        }
      } else if (userDetail && userDetail.status == 'INACTIVE') {
        return {
          status: false,
          message: 'User Account InActive',
          data: []
        }
      } else {
        return {
          status: false,
          message: 'User Account Deleted',
          data: []
        }
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in forgetPassword',
        error: error.message
      }
    }
  }

  async verifyOtp(payload: any) {
    try {
      const email = payload.email;
      const otp = payload.otp;
      const userDetail = await prisma.user.findUnique({
        where: { email }
      });
      if (!userDetail) {
        return {
          status: false,
          message: 'User not found',
          data: [],
        };
      }
      if (otp != userDetail.otp) {
        return {
          status: false,
          message: 'Invalid OTP',
          data: userDetail,
        };
      }
      if (new Date() > userDetail.otpValidTime) {
        return {
          status: false,
          message: 'Otp Expires',
          data: [],
        };
      }
      let updatedUserDetail = await prisma.user.update({
        where: { email },
        data: {
          otp: null,
          otpValidTime: null
        },
      });

      let userAuth = {
        id: userDetail.id,
      }
      let authToken = await this.authService.login(userAuth);
      const restokenData = authToken;
      return {
        status: true,
        message: 'OTP Verified Successfully',
        accessToken: restokenData.accessToken,
      };
    } catch (error) {
      return {
        status: false,
        message: 'error in verfityOtp',
        error: error.message
      }
    }
  }

  async resetPassword(payload: any, req: any) {
    try {
      let userDetail = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      if (userDetail && userDetail.resetPassword == 1) {
        if (payload.newPassword != payload.confirmPassword) {
          return {
            status: false,
            message: 'PassWord Mismatch',
            data: [],
          }
        }
        const salt = await genSalt(10);
        const password = await hash(payload.newPassword, salt);

        let updatedUserDetail = await prisma.user.update({
          where: { id: req.user.id },
          data: { resetPassword: 0, password: password },
        });

        return {
          status: true,
          message: 'The password has been updated successfully.',
          data: updatedUserDetail
        }
      } else {
        return {
          status: false,
          message: 'Invalid Link',
          data: []
        }
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in resetPassword',
        error: error.message
      }
    }
  }

  async userProfile(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      // console.log('userId: ', userId)
      // console.log("payload: ", payload);
      // return {
      //   status: true,
      //   message: 'TESTING',
      //   data: payload
      // }
      let addUserProfile = await prisma.userProfile.create({
        data: {
          userId: userId,
          profileType: payload.profileType,
          logo: payload.logo,
          companyName: payload.companyName,
          aboutUs: payload.aboutUs,
          annualPurchasingVolume: payload.annualPurchasingVolume,
          address: payload.address,
          city: payload.city,
          province: payload.province,
          country: payload.country,
          cc: payload?.cc,
          phoneNumber: payload?.phoneNumber,
          yearOfEstablishment: parseInt(payload.yearOfEstablishment),
          totalNoOfEmployee: payload.totalNoOfEmployee
        }
      });

      if (payload.businessTypeList) {
        let obj1: any = {};
        obj1.businessTypeList = payload.businessTypeList;
        obj1.userProfileId = addUserProfile.id;
        obj1.userId = userId;
        await this.businessTypeAdd(obj1);
      }

      if (payload.branchList) {
        console.log('AddBranch: ');

        let obj: any = {};
        obj.branchList = payload.branchList;
        obj.userProfileId = addUserProfile.id;
        obj.userId = userId;
        await this.branchAdd(obj)
      }

      return {
        status: true,
        message: 'User Profile Created Successfully',
        data: addUserProfile
      }
    } catch (error) {
      console.log('error: ', error);
      return {
        status: false,
        message: 'error in userprofile',
        error: error.message
      }
    }
  }

  async updateUserProfile(payload: any, req: any) {
    try {
      const userProfileId = payload.userProfileId;
      let userProfileDetail = await prisma.userProfile.findUnique({
        where: { id: userProfileId }
      });
      let updateUserProfile = await prisma.userProfile.update({
        where: { id: userProfileId },
        data: {
          logo: payload.logo || userProfileDetail.logo,
          companyName: payload.companyName || userProfileDetail.companyName,
          aboutUs: payload.aboutUs || userProfileDetail.aboutUs,
          address: payload.address || userProfileDetail.address,
          city: payload.city || userProfileDetail.city,
          province: payload.province || userProfileDetail.province,
          country: payload.country || userProfileDetail.country,
          yearOfEstablishment: payload.yearOfEstablishment || userProfileDetail.yearOfEstablishment,
          totalNoOfEmployee: payload.totalNoOfEmployee || userProfileDetail.totalNoOfEmployee,
          cc: payload?.cc || userProfileDetail.cc,
          phoneNumber: payload?.phoneNumber || userProfileDetail.phoneNumber,
        }
      });
      if (payload.businessTypeList) {
        await prisma.userProfileBusinessType.deleteMany({
          where: { userProfileId: userProfileId }
        });
        let obj1: any = {};
        obj1.businessTypeList = payload.businessTypeList;
        obj1.userProfileId = userProfileId;
        obj1.userId = userProfileDetail.userId;
        await this.businessTypeAdd(obj1);
      }
      return {
        status: true,
        message: 'Updated Successfully',
        data: updateUserProfile,
        // payload: payload
      }
    } catch (error) {
      console.log('error: ', error);
      return {
        status: false,
        message: 'error in updateUserProfile',
        error: error.message
      }
    }
  }

  async businessTypeAdd(obj1: any) {
    try {
      for (let i = 0; i < obj1.businessTypeList.length; i++) {
        // console.log('businessTypeAdd: ', i);
        let userProfileBusinessType = await prisma.userProfileBusinessType.create({
          data: {
            userId: obj1.userId,
            userProfileId: obj1.userProfileId,
            businessTypeId: obj1.businessTypeList[i].businessTypeId
          }
        });
        // console.log('businessTypeAdd: Created userProfileBusinessType', userProfileBusinessType);
      }
    } catch (error) {
      console.log('businessTypeAdd: Error occurred', error);
      return {
        status: false,
        message: 'error in businessTypeAdd',
        error: error.message
      }
    }
  }

  async branchAdd(obj: any) {
    try {
      for (let i = 0; i < obj.branchList.length; i++) {
        console.log('branchList: ', i);
        let addUserBranch = await prisma.userBranch.create({
          data: {
            userId: obj.userId,
            userProfileId: obj.userProfileId,
            mainOffice: obj.branchList[i].mainOffice,
            profileType: obj.branchList[i].profileType,
            branchFrontPicture: obj.branchList[i].branchFrontPicture,
            proofOfAddress: obj.branchList[i].proofOfAddress,
            address: obj.branchList[i].address,
            city: obj.branchList[i].city,
            province: obj.branchList[i].province,
            country: obj.branchList[i].country,
            cc: obj.branchList[i].cc,
            contactNumber: obj.branchList[i].contactNumber,
            contactName: obj.branchList[i].contactName,
            startTime: obj.branchList[i].startTime,
            endTime: obj.branchList[i].endTime,
            workingDays: JSON.stringify(obj.branchList[i].workingDays) // Convert object to string
          }
        })

        if (obj.branchList[i].businessTypeList && obj.branchList[i].businessTypeList.length) { // To add businessType
          for (let j = 0; j < obj.branchList[i].businessTypeList.length; j++) {
            console.log('branchList.businessTypeList: ', j);
            let addBranchBusniessType = await prisma.userBranchBusinessType.create({
              data: {
                userId: obj.userId,
                userBranchId: addUserBranch.id,
                businessTypeId: obj.branchList[i].businessTypeList[j].businessTypeId
              }
            })
          }
        }

        if (obj.branchList[i].tagList && obj.branchList[i].tagList.length) {
          for (let k = 0; k < obj.branchList[i].tagList.length; k++) {
            console.log('branchList.tagList: ', k);
            let addUserBranchTag = await prisma.userBranchTags.create({
              data: {
                userId: obj.userId,
                userBranchId: addUserBranch.id,
                tagId: obj.branchList[i].tagList[k].tagId
              }
            })
          }
        }

        if (obj.branchList[i].categoryList && obj.branchList[i].categoryList.length) {
          for (let m = 0; m < obj.branchList[i].categoryList.length; m++) {
            console.log('branchList.categoryList: ', m);
            let addUserBranchCategory = await prisma.userBranchCategory.create({
              data: {
                userId: obj.userId,
                userBranchId: addUserBranch.id,
                categoryId: obj.branchList[i].categoryList[m].categoryId,
                categoryLocation: obj.branchList[i].categoryList[m].categoryLocation
              }
            })
          }
        }

      }
    } catch (error) {
      console.log('branchAdd error occured: ', error);
      return {
        status: false,
        message: 'error in branchAdd',
        error: error.message
      }
    }
  }

  async updateBranch(payload: any, req: any) {
    try {
      const userId = req?.user?.id;

      if (payload?.mainOffice == 1) { // if mainOffice == 1, setting other mainOffice = 0
        let updateMainOffice = await prisma.userBranch.findMany({
          where: { userId: userId, mainOffice: 1 }
        })
        for (let i = 0; i < updateMainOffice.length; i++) {
          let updateBranch = await prisma.userBranch.update({
            where: { id: updateMainOffice[i].id },
            data: { mainOffice: 0 }
          })
        }
      }

      const branchId = payload.branchId;
      let branchDetail = await prisma.userBranch.findUnique({
        where: { id: branchId }
      })
      let updateBranch = await prisma.userBranch.update({
        where: { id: branchId },
        data: {
          mainOffice: payload.mainOffice || branchDetail.mainOffice,
          profileType: payload.profileType || branchDetail.profileType,
          branchFrontPicture: payload.branchFrontPicture || branchDetail.branchFrontPicture,
          proofOfAddress: payload.proofOfAddress || branchDetail.proofOfAddress,
          address: payload.address || branchDetail.address,
          city: payload.city || branchDetail.city,
          province: payload.province || branchDetail.province,
          country: payload.country || branchDetail.country,
          cc: payload.cc || branchDetail.cc,
          contactNumber: payload.contactNumber || branchDetail.contactNumber,
          contactName: payload.contactName || branchDetail.contactName,
          startTime: payload.startTime || branchDetail.startTime,
          endTime: payload.endTime || branchDetail.endTime,
          workingDays: JSON.stringify(payload.workingDays) || branchDetail.workingDays
        }
      });
      if (payload.businessTypeList && payload.businessTypeList.length > 0) {
        await prisma.userBranchBusinessType.deleteMany({
          where: { userBranchId: branchId }
        });
        let obj: any = {};
        obj.businessTypeList = payload.businessTypeList;
        obj.branchId = branchId;
        obj.userId = branchDetail.userId;
        await this.updateBranchBusinessType(obj)
      }

      if (payload.tagList && payload.tagList.length > 0) {
        await prisma.userBranchTags.deleteMany({
          where: { userBranchId: branchId }
        });
        let obj1: any = {};
        obj1.tagList = payload.tagList;
        obj1.branchId = branchId;
        obj1.userId = branchDetail.userId;
        await this.updateBranchTags(obj1)
      }

      if (payload.categoryList && payload.categoryList.length > 0) {
        await prisma.userBranchCategory.deleteMany({
          where: { userBranchId: branchId }
        });
        let obj2: any = {};
        obj2.categoryList = payload.categoryList;
        obj2.branchId = branchId;
        obj2.userId = branchDetail.userId;
        await this.updateBranchCategory(obj2)
      }

      return {
        status: true,
        message: 'Update Successfully',
        data: updateBranch
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in updateBranch',
        error: error.message
      }
    }
  }

  async updateBranchBusinessType(obj: any) {
    if (obj?.businessTypeList && obj.businessTypeList.length > 0) { // To add businessType
      for (let j = 0; j < obj.businessTypeList.length; j++) {
        let addBranchBusniessType = await prisma.userBranchBusinessType.create({
          data: {
            userId: obj.userId,
            userBranchId: obj.branchId,
            businessTypeId: obj.businessTypeList[j].businessTypeId
          }
        })
      }
    }
  }

  async updateBranchTags(obj1: any) {
    if (obj1?.tagList && obj1?.tagList?.length > 0) {
      for (let k = 0; k < obj1.tagList.length; k++) {
        let addUserBranchTag = await prisma.userBranchTags.create({
          data: {
            userId: obj1.userId,
            userBranchId: obj1.branchId,
            tagId: obj1.tagList[k].tagId
          }
        })
      }
    }
  }

  async updateBranchCategory(obj2: any) {
    if (obj2?.categoryList && obj2?.categoryList?.length > 0) {
      for (let m = 0; m < obj2.categoryList.length; m++) {
        let addUserBranchCategory = await prisma.userBranchCategory.create({
          data: {
            userId: obj2.userId,
            userBranchId: obj2.branchId,
            categoryId: obj2.categoryList[m].categoryId,
            categoryLocation: obj2.categoryList[m].categoryLocation
          }
        })
      }
    }
  }

  async viewTags() {
    try {
      let allTags = await prisma.tags.findMany({
        where: { status: 'ACTIVE' }
      });
      if (!allTags) {
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
        data: allTags,
        totalCount: allTags.length
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in viewTag',
        error: error.message
      }
    }
  }

  async createTag(payload: any, req: any) {
    try {
      const userId = req.user.id;
      let addTag = await prisma.tags.create({
        data: {
          tagName: payload.tagName,
          addedBy: userId
        }
      });

      return {
        status: true,
        message: 'Added Succesfully',
        data: addTag
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in createTag',
        error: error.message
      }
    }
  }

  async addBranchAfterEdit(payload: any, req: any) {
    try {
      const userId = req?.user?.id;

      if (payload?.mainOffice == 1) { // if mainOffice == 1, setting other mainOffice = 0
        let updateMainOffice = await prisma.userBranch.findMany({
          where: { userId: userId, mainOffice: 1 }
        })
        for (let i = 0; i < updateMainOffice.length; i++) {
          let updateBranch = await prisma.userBranch.update({
            where: { id: updateMainOffice[i].id },
            data: { mainOffice: 0 }
          })
        }
      }

      let addUserBranch = await prisma.userBranch.create({
        data: {
          userId: userId,
          userProfileId: payload.userProfileId,
          mainOffice: payload.mainOffice,
          profileType: payload.profileType,
          branchFrontPicture: payload.branchFrontPicture,
          proofOfAddress: payload.proofOfAddress,
          address: payload.address,
          city: payload.city,
          province: payload.province,
          country: payload.country,
          cc: payload.cc,
          contactNumber: payload.contactNumber,
          contactName: payload.contactName,
          startTime: payload.startTime,
          endTime: payload.endTime,
          workingDays: JSON.stringify(payload.workingDays) // Convert object to string
        }
      })

      if (payload.businessTypeList && payload.businessTypeList.length) { // To add businessType
        for (let j = 0; j < payload.businessTypeList.length; j++) {
          let addBranchBusniessType = await prisma.userBranchBusinessType.create({
            data: {
              userId: userId,
              userBranchId: addUserBranch.id,
              businessTypeId: payload.businessTypeList[j].businessTypeId
            }
          })
        }
      }

      if (payload.tagList && payload.tagList.length) {
        for (let k = 0; k < payload.tagList.length; k++) {
          let addUserBranchTag = await prisma.userBranchTags.create({
            data: {
              userId: userId,
              userBranchId: addUserBranch.id,
              tagId: payload.tagList[k].tagId
            }
          })
        }
      }

      if (payload.categoryList && payload.categoryList.length) {
        for (let k = 0; k < payload.categoryList.length; k++) {
          let addUserBranchCategory = await prisma.userBranchCategory.create({
            data: {
              userId: userId,
              userBranchId: addUserBranch.id,
              categoryId: payload.categoryList[k].categoryId,
              categoryLocation: payload.categoryList[k].categoryLocation,
            }
          })
        }
      }

      return {
        status: true,
        message: 'Branch Added Successfully',
        data: addUserBranch
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in addBranchAfterEdit',
        error: error.message
      }
    }
  }

  async changeEmail(payload: any, req: any) {
    try {
      const userId = req.user.id;
      let userDetail = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (!userDetail) {
        return {
          status: false,
          message: "Not Found",
          data: []
        };
      }
      if (payload.email) {
        let re =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        console.log(re.test(String(payload.email)));
        if (!re.test(String(payload.email))) {
          return {
            status: 'false',
            message: 'enter a valid email',
            data: [],
          };
        }
        payload.email = payload.email.toLowerCase();
      }
      const userEmail = await prisma.user.findUnique({
        where: { email: payload.email },
      });
      if (userEmail && userDetail.email != payload.email) {
        return {
          status: false,
          message: 'Email already exists',
          data: [],
        };
      }
      if (userDetail.email == payload.email) {
        return {
          status: false,
          message: 'Same email cannot be changed!',
          data: []
        }
      }

      let otp = Math.floor(1000 + Math.random() * 9000);
      let otpValidTime = new Date(new Date().getTime() + 5 * 60000);
      const updateUser = await prisma.user.update({
        where: { id: userId },
        data: {
          otp,
          otpValidTime
        },
      })
      let data = {
        email: payload.email,
        name: userDetail.firstName,
        otp: otp
      }
      this.notificationService.mailService(data);

      return {
        status: true,
        message: "An OTP was sent to your email.",
        otp: otp
      };

    } catch (error) {
      return {
        status: false,
        message: 'error in changeEmail',
        error: error.message
      }
    }
  }

  async verifyEmail(payload: any, req: any) {
    try {
      const { email, otp } = payload;
      const userId = req?.user?.id;
      let userDetail = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (!userDetail) {
        return {
          status: false,
          message: "Not Found",
          data: []
        };
      }
      if (otp != userDetail.otp) {
        return {
          status: false,
          message: 'Invalid OTP',
          data: [],
        };
      }
      if (new Date() > userDetail.otpValidTime) {
        return {
          status: false,
          message: 'Otp Expires',
          data: [],
        };
      }
      let updatedEmail = await prisma.user.update({
        where: { id: userId },
        data: { email: email }
      })

      return {
        status: true,
        message: 'Email Updated Successfully',
        data: updatedEmail
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in verifyEmail',
        error: error.message
      }
    }
  }

  async onlineOfflineStatus(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      let userDetail = await prisma.user.update({
        where: { id: userId },
        data: {
          onlineOffline: payload.onlineOffline,
          onlineOfflineDateStatus: new Date(payload.onlineOfflineDateStatus)
        }
      });
      return {
        status: true,
        message: 'Updated Successfully',
        data: userDetail
      }
    } catch (error) {
      console.log('error---: ', error);

      return {
        status: false,
        message: 'error in onlineOfflineStatus',
        error: error.message
      }
    }
  }

  async findOneBranch(branchId: any, req: any) {
    try {
      const branchID = parseInt(branchId);
      const userId = req?.user?.id;
      let branchDetail = await prisma.userBranch.findUnique({
        where: { id: branchID },
        include: {
          userBranchBusinessType: {
            include: {
              userBranch_BusinessType_Tag: true
            },
          },
          userBranchTags: {
            include: {
              userBranchTagsTag: true
            }
          },
          userBranch_userBranchCategory: {
            include: {
              userBranchCategory_category: true
            }
          }
        }
      });
      if (!branchDetail) {
        return {
          status: false,
          messasge: 'Branch Not Found',
          data: []
        }
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: branchDetail
      }
    } catch (error) {
      return {
        status: false,
        message: 'error in findOneBranch',
        error: error.message
      }
    }
  }

  async presignedUrlDelete(payload: any, req: any) {
    try {
      console.log('presignedUrlDelete: Service');
      return this.s3service.s3_deleteObject(payload)

    } catch (error) {
      return {
        status: false,
        message: 'error in presignedUrlDelete',
        error: error.message
      }
    }
  }

  /**
   * User Address
   */
  async addUserAddress(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      let addUserAddress = await prisma.userAddress.create({
        data: {
          address: payload?.address,
          city: payload?.city,
          province: payload?.province,
          country: payload?.country,
          postCode: payload?.postCode,
          userId: userId,
          firstName: payload?.firstName,
          lastName: payload?.lastName,
          phoneNumber: payload?.phoneNumber,
          cc: payload?.cc,
          countryId: payload?.countryId,
          stateId: payload?.stateId,
          cityId: payload?.cityId,
          town: payload?.town,
        }
      });

      return {
        status: true,
        message: 'Created Successfully',
        data: addUserAddress
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in addUserAddress',
        error: error.message
      }
    }
  }

  async updateUserAddress(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      const userAddressId = payload?.userAddressId
      let userAddressDetail = await prisma.userAddress.findUnique({
        where: { id: userAddressId }
      });

      if (!userAddressDetail) {
        return {
          status: true,
          message: 'Not Found',
          data: []
        }
      }
      let addUserAddress = await prisma.userAddress.update({
        where: { id: userAddressId },
        data: {
          address: payload?.address || userAddressDetail.address,
          city: payload?.city || userAddressDetail.city,
          province: payload?.province || userAddressDetail.province,
          country: payload?.country || userAddressDetail.country,
          postCode: payload?.postCode || userAddressDetail.postCode,
          firstName: payload?.firstName || userAddressDetail.firstName,
          lastName: payload?.lastName || userAddressDetail.lastName,
          phoneNumber: payload?.phoneNumber || userAddressDetail.phoneNumber,
          cc: payload?.cc || userAddressDetail.cc,
          countryId: payload?.countryId || userAddressDetail.countryId,
          stateId: payload?.stateId || userAddressDetail.stateId,
          cityId: payload?.cityId || userAddressDetail.cityId,
          town: payload?.town || userAddressDetail.town,
        }
      });

      return {
        status: true,
        message: 'Updated Successfully',
        data: addUserAddress
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in updateUserAddress',
        error: error.message
      }
    }
  }

  async getAllUserAddress(page: any, limit: any, req: any) {
    try {
      const userId = req?.user?.id;
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate the offset

      let getAllUserAddress = await prisma.userAddress.findMany({
        where: {
          status: 'ACTIVE',
          userId: userId
        },
        include: {
          countryDetail: true,
          stateDetail: true,
          cityDetail: true
        },
        orderBy: { id: 'desc' },
        skip, // Offset
        take: pageSize, // Limit
      });

      let getAllUserAddressCount = await prisma.userAddress.count({
        where: {
          status: 'ACTIVE',
          userId: userId
        },
      });

      return {
        status: true,
        messsage: 'Fetch Successfullly',
        data: getAllUserAddress,
        totalCount: getAllUserAddressCount
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in getAllUserAddress',
        error: error.message
      }
    }
  }

  async getOneUserAddress(userAddressId: any) {
    try {
      const userAddressID = parseInt(userAddressId);
      let getOneUserAddress = await prisma.userAddress.findUnique({
        where: { id: userAddressID },
        include: {
          countryDetail: true,
          stateDetail: true,
          cityDetail: true
        },
      });
      if (!getOneUserAddress) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getOneUserAddress
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in getOneUserAddress',
        error: error.message
      }
    }
  }

  async deleteUserAddress(userAddressId: any, req: any) {
    try {
      const userId = req?.user?.id;
      const userAddressID = parseInt(userAddressId)
      let userAddressDetail = await prisma.userAddress.findUnique({
        where: { id: userAddressID }
      });

      if (!userAddressDetail) {
        return {
          status: true,
          message: 'Not Found',
          data: []
        }
      }
      let addUserAddress = await prisma.userAddress.update({
        where: { id: userAddressID },
        data: {
          status: 'DELETE',
          deletedAt: new Date()
        }
      });

      return {
        status: true,
        message: 'Deleted Successfully',
        data: addUserAddress
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in deleteUserAddress',
        error: error.message
      }
    }
  }

  async userDelete(payload: any) {
    try {
      const userDetail = await prisma.user.findUnique({
        where: { id: payload?.userId }
      });

      if (!userDetail) {
        return {
          status: false,
          message: 'Not Found',
          data: []
        }
      }
      let random = randomstring.generate({
        length: 12,
        charset: "alphanumeric",
      });
      let email = random + "yopmail.com";

      let updatedUser = await prisma.user.update({
        where: { id: payload?.userId },
        data: { email: email }
      })

      return {
        status: true,
        message: 'Delete Successffully',
        data: updatedUser
      }

    } catch (error) {
      return {
        status: false,
        message: 'error in userDelete',
        error: error.message
      }
    }
  }

  /**
   * User Role
   */

  async createUserRole(payload: any, req: any) {
    try {
      const userId = req?.user?.id;
      if (!payload.userRoleName) {
        return {
          status: false,
          message: 'userRoleName is required',
        };
      }

      // Check if the user role already exists
      let existUserRole = await prisma.userRole.findFirst({
        where: { userRoleName: payload.userRoleName }
      });

      if (existUserRole) {
        return {
          status: true, // Still return true as it already exists
          message: 'Already exists',
          data: existUserRole
        };
      }

      // Create new user role
      let newUserRole = await prisma.userRole.create({
        data: {
          userRoleName: payload.userRoleName,
          addedBy: userId
        }
      });

      return {
        status: true,
        message: 'Created successfully',
        data: newUserRole
      };

    } catch (error) {
      return {
        status: false,
        message: 'Error in createUserRole',
        error: error.message
      };
    }
  }

  async getAllUserRole(page: any, limit: any, searchTerm: any, req: any) {
    try {
      // const userId = req?.user?.id;
      let userId = req?.user?.id;
      userId = await this.helperService.getAdminId(userId);
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
        whereCondition.userRoleName = {
          contains: searchTerm,
          mode: 'insensitive' // Case-insensitive search
        };
      }

      // Fetch paginated user roles
      let getAllUserRoles = await prisma.userRole.findMany({
        where: whereCondition,
        orderBy: { id: 'desc' },
        skip, // Offset
        take: pageSize, // Limit
      });

      // Count total user roles
      let totalUserRoles = await prisma.userRole.count({
        where: whereCondition,
      });

      return {
        status: true,
        message: 'Fetch Successfully',
        data: getAllUserRoles,
        totalCount: totalUserRoles
      };

    } catch (error) {
      return {
        status: false,
        message: 'Error in getAllUserRole',
        error: error.message
      };
    }
  }

  async updateUserRole(req: any) {
    try {
      const userRoleId = req.body.userRoleId;
      if (!userRoleId) {
        return {
          status: false,
          message: "userRoleId is required!"
        }
      }

      // updateing in user role table
      let updateUserRole = await prisma.userRole.update({
        where: { id: parseInt(userRoleId) },
        data: {
          userRoleName: req.body.userRoleName
        }
      });

      // // updating it in user table as well
      // let userWithUserRoleId = await prisma.user.findMany({
      //   where: { userRoleId: parseInt(userRoleId) }
      // });
      // if (userWithUserRoleId && userWithUserRoleId.length > 0) {
      //   let latestUserRoleDetail = await prisma.userRole.findUnique({
      //     where: { id: parseInt(userRoleId) }
      //   })
      //   await prisma.user.updateMany({
      //     where: { userRoleId: parseInt(userRoleId) },
      //     data: {
      //       userRoleName: latestUserRoleDetail.userRoleName
      //     }
      //   })
      // }

      return {
        status: true,
        message: 'Updated Successfully',
        data: updateUserRole
      };

    } catch (error) {
      return {
        status: false,
        message: 'Error in updateUserRole',
        error: error.message
      };
    }
  }

  async deleteUserRole(req: any) {
    try {
      const ID = parseInt(req.query.id);

      let userRoleExist = await prisma.userRole.findUnique({
        where: { id: ID }
      });
      if (!userRoleExist) {
        return {
          status: false,
          message: 'userRoleId not found',
          data: []
        };
      }
      let userRoleInUser = await prisma.user.findMany({
        where: { userRoleId: ID }
      });
      if (userRoleInUser && userRoleInUser.length > 0) {
        return {
          status: false,
          message: 'userRoleId is associated with user',
          data: []
        };
      }

      let updateUserRole = await prisma.userRole.update({
        where: { id: ID },
        data: {
          status: "DELETE"
        }
      })

      return {
        status: false,
        message: 'Deleted successfully',
        data: updateUserRole
      };

    } catch (error) {
      return {
        status: false,
        message: 'Error in deleteUserRole',
        error: error.message
      };
    }
  }

  /**
   *  Set Permission for 
   */
  async setPermission(payload: any, req: any) {
    try {
      const { userRoleId, permissionIdList } = payload;

      // Check if userRoleId is provided
      if (!userRoleId) {
        return {
          status: false,
          message: "userRoleId is required",
        };
      }

      // Check if permissionIdList is an array and not empty
      if (!Array.isArray(permissionIdList) || permissionIdList.length === 0) {
        return {
          status: false,
          message: "permissionIdList must be a non-empty array",
        };
      }

      // Validate each permissionId in the array
      for (const item of permissionIdList) {
        if (!item.permissionId) {
          return {
            status: false,
            message: "Each permissionIdList item must have a valid permissionId",
          };
        }
      }

      // Insert permissions one by one using a traditional for loop
      const createdPermissions = [];
      for (let i = 0; i < permissionIdList.length; i++) {
        const item = permissionIdList[i];
        const newPermission = await prisma.userRolePermission.create({
          data: {
            userRoleId,
            permissionId: item.permissionId,
            status: "ACTIVE",
          },
        });
        createdPermissions.push(newPermission);
      }

      return {
        status: true,
        message: "Permissions assigned successfully",
        data: createdPermissions,
      };

    } catch (error) {
      return {
        status: false,
        message: "Error in setPermission",
        error: error.message,
      };
    }
  }

  async getAllUserRoleWithPermission(page: any, limit: any, searchTerm: any, req: any) {
    try {
      const userId = req?.user?.id;
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate offset

      let whereCondition: any = {
        addedBy: userId,
      };

      // Apply search filter if searchTerm is provided
      if (searchTerm) {
        whereCondition.userRoleName = {
          contains: searchTerm,
          mode: 'insensitive', // Case-insensitive search
        };
      }

      // Fetch user roles with their permissions
      let userRoles = await prisma.userRole.findMany({
        where: whereCondition,
        include: {
          userRolePermission: {
            include: {
              permissionDetail: true, // Fetch details of each permission
            },
          },
        },
        orderBy: { id: 'desc' },
        skip, // Offset
        take: pageSize, // Limit
      });

      // Count total user roles
      let totalUserRoles = await prisma.userRole.count({
        where: whereCondition,
      });

      return {
        status: true,
        message: "Fetch Successfully",
        data: userRoles,
        totalCount: totalUserRoles,
      };

    } catch (error) {
      return {
        status: false,
        message: "Error in getAllUserRoleWithPermission",
        error: error.message,
      };
    }
  }

  async updateSetPermission(payload: any, req: any) {
    try {
      const { userRoleId, permissionIdList } = payload;
      const userId = req?.user?.id;

      // Validate userRoleId
      if (!userRoleId) {
        return {
          status: false,
          message: "userRoleId is required",
        };
      }

      // Validate permissionIdList
      if (!Array.isArray(permissionIdList) || permissionIdList.length === 0) {
        return {
          status: false,
          message: "permissionIdList must be a non-empty array",
        };
      }

      // Check if userRole exists
      const existingUserRole = await prisma.userRole.findUnique({
        where: { id: userRoleId, addedBy: userId },
      });

      if (!existingUserRole) {
        return {
          status: false,
          message: "UserRole not found or you don't have permission to update it",
        };
      }

      // Delete existing permissions for this userRoleId
      await prisma.userRolePermission.deleteMany({
        where: { userRoleId },
      });

      // Insert new permissions using a traditional loop
      for (let item of permissionIdList) {
        await prisma.userRolePermission.create({
          data: {
            userRoleId,
            permissionId: item.permissionId,
            status: "ACTIVE",
          },
        });
      }

      return {
        status: true,
        message: "Permissions updated successfully",
      };

    } catch (error) {
      return {
        status: false,
        message: "Error in updateSetPermission",
        error: error.message,
      };
    }
  }

  async getOneUserRoleWithPermission(userRoleId: any) {
    try {
      // Validate userRoleId
      if (!userRoleId) {
        return {
          status: false,
          message: "UserRoleId is required",
        };
      }

      // Fetch user role with associated permissions
      const userRole = await prisma.userRole.findUnique({
        where: { id: parseInt(userRoleId) },
        include: {
          userRolePermission: {
            include: {
              permissionDetail: true, // Fetch permission details
            },
          },
        },
      });

      // Check if the user role exists
      if (!userRole) {
        return {
          status: false,
          message: "User Role not found",
        };
      }

      return {
        status: true,
        message: "Fetch Successfully",
        data: userRole,
      };
    } catch (error) {
      return {
        status: false,
        message: "Error fetching user role with permissions",
        error: error.message,
      };
    }
  }

  async copyUserRoleWithPermission(payload: any, req: any) {
    try {
      const userRoleId = payload.userRoleId;

      let userId = req?.user?.id;
      userId = await this.helperService.getAdminId(userId);
      console.log("admin_id: ", userId);

      // Validate userRoleId
      if (!userRoleId) {
        return {
          status: false,
          message: "UserRoleId is required",
        };
      }

      // Fetch user role with associated permissions
      const userRole = await prisma.userRole.findUnique({
        where: { id: parseInt(userRoleId) },
        include: {
          userRolePermission: true, // Fetch associated permissions
        },
      });

      if (!userRole) {
        return {
          status: false,
          message: "User role not found",
        };
      }

      // Create a new user role with a unique name
      const newUserRole = await prisma.userRole.create({
        data: {
          userRoleName: `${userRole.userRoleName}_copy`,
          status: "ACTIVE",
          addedBy: userId
        },
      });

      // Copy permissions to the new role
      const newPermissions = [];
      for (const permission of userRole.userRolePermission) {
        const newPermission = await prisma.userRolePermission.create({
          data: {
            userRoleId: newUserRole.id,
            permissionId: permission.permissionId,
            status: "ACTIVE",
          },
        });
        newPermissions.push(newPermission);
      }

      return {
        status: true,
        message: "User role copied successfully with permissions",
        data: {
          newUserRole,
          newPermissions,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: "Error in copyUserRoleWithPermission",
        error: error.message,
      };
    }
  }




  /**
   *  Help Center
   */
  async createHelpCenter(payload: any, req: any) {
    try {
      const userId = payload.userId;  // Extract user ID from request (if authenticated)
      const userEmail = payload.email; // Extract email from payload
      const query = payload.query; // Extract message from payload

      // Validate required fields
      if (!query) {
        return {
          status: false,
          message: "Message is required",
        };
      }

      if (!userEmail) {
        return {
          status: false,
          message: "Email is required",
        };
      }

      // Create help center request
      const newHelpCenterEntry = await prisma.helpCenter.create({
        data: {
          userId: userId || null, // Store userId if available
          userEmail: userEmail || null, // Store email if available
          query: query,
          status: "ACTIVE",
        },
      });

      return {
        status: true,
        message: "Help center request created successfully",
        data: newHelpCenterEntry,
      };

    } catch (error) {
      return {
        status: false,
        message: "Error in createHelpCenter",
        error: error.message,
      };
    }
  }

  async getAllHelpCenterResponse(page: any, limit: any, searchTerm: any, req: any) {
    try {
      let Page = parseInt(page) || 1;
      let pageSize = parseInt(limit) || 10;
      const skip = (Page - 1) * pageSize; // Calculate offset

      const adminId = req.user.id;

      let whereCondition: any = {
        userId: adminId
      };

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
        totalCount: totalHelpCenterRequests,
        selectedAdminId: adminId
      };

    } catch (error) {
      return {
        status: false,
        message: 'Error in getAllHelpCenter',
        error: error.message
      };
    }
  }




}
