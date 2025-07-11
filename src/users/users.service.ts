import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { userTypes } from "../shared/schema/user";
import config from "config";
import { UserRepository } from "../shared/repositories/user.repository";
import { comparePassword, generateHashPassword } from "../shared/utility/security/password-manager";
import { MailerHandlerService } from "../shared/utility/mailer/mail-handler";
import { decodeAuthToken, generateAuthToken } from "../shared/utility/security/token-generator";
import { decrypt, encrypt } from "../shared/utility/security/key-generator";

@Injectable()
export class UsersService {

  constructor(
    @Inject(UserRepository) private readonly userDB: UserRepository,
    @Inject(MailerHandlerService) private readonly mailerService: MailerHandlerService
  ) { }
  async create(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = await generateHashPassword(
        createUserDto.password
      )
      if (
        createUserDto.type === userTypes.ADMIN
        && createUserDto.secretToken !== config.get('adminSecretToken')
      ) {
        throw new Error('Not allowed to create admin')
      } else if (createUserDto.type !== userTypes.CUSTOMER) {
        createUserDto.isVerified = true;
      }

      const user = await this.userDB.findOne({
        email: createUserDto.email
      });

      if (user) {
        throw new Error('User already exist');
      }

      const otp = Math.floor(Math.random() * 900000 + 100000);

      const otpExpiryTime = new Date;
      otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 10);

      const newUser = await this.userDB.create({
        ...createUserDto,
        otp,
        otpExpiryTime
      });

      if (newUser.type !== userTypes.ADMIN) {
        this.mailerService.sendEmail(
          [newUser.email],
          'Email Verification - Digizone',
          config.get('emailService.emailTemplates.verifyEmail'),
          {
            customerName: newUser.name,
            customerEmail: newUser.email,
            otp,
          }
        )
      }

      return {
        success: true,
        message:
          newUser.type === userTypes.ADMIN
            ? 'Admin created successfully'
            : 'Please activate your account by verifing yout email. We have sent you email with otp code',
        result: { email: newUser.email }
      }
    } catch (error) {
      throw error
    }
  }
  async checkJwt(token: string) {
    const decodedData: any = decodeAuthToken(token);
    if (!decodedData) {
      return false
    }
    const user = await this.userDB.findById(decodedData.id);

    return {
      success: true,
      message: 'Token valid',
      result: {
        user: {
          name: user.name,
          email: user.email,
        },
        token
      }
    }
  }
  async login(email: string, password: string) {
    try {
      const userExists = await this.userDB.findOne({
        email
      })

      if (!userExists) {
        throw new Error('User not Found')
      }
      if (!userExists.isVerified) {
        return {
          success: false,
          message: 'Login not successful',
          result: {
            user: {
              name: userExists.name,
              email: userExists.email,
              type: userExists.type,
              id: userExists._id.toString(),
              verified: false
            }
          }
        }
      }

      const isPasswordMatch = await comparePassword(password, userExists.password)

      if (!isPasswordMatch) {
        throw new Error('Invalid email or password')
      }

      const token = await generateAuthToken(userExists._id)

      return {
        success: true,
        message: 'Login successful',
        result: {
          user: {
            name: userExists.name,
            email: userExists.email,
            type: userExists.type,
            id: userExists._id.toString(),
            verified: true
          },
          token
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(otp: string, email: string) {
    try {
      const user = await this.userDB.findOne({
        email
      })
      if (!user) {
        throw new Error('User not found')
      }

      if (user.otp !== otp) {
        throw new Error('Invalid otp')
      }
      if (user.otpExpiryTime < new Date()) {
        throw new Error('Otp Expired')
      }
      user.isVerified = true
      await this.userDB.updateOne(
        {
          email,
        },
        {
          isVerified: true
        }
      );

      return {
        success: true,
        message: 'Email verified successfully. you can login now'
      }
    }
    catch (error) {
      throw error;
    }
  }

  async sendOptEmail(email: string) {
    try {
      const user = await this.userDB.findOne({
        email
      });

      if (!user) {
        throw new Error('User not found')
      }

      if (user.isVerified) {
        throw new Error("Email already verified")
      }

      const otp = Math.floor(Math.random() * 900000) + 100000;

      const otpExpiryTime = new Date();
      otpExpiryTime.setMinutes(otpExpiryTime.getMinutes() + 10)

      await this.userDB.updateOne(
        {
          email
        }, {
        otp,
        otpExpiryTime
      },
      );

      this.mailerService.sendEmail(
        [user.email],
        'Email Verification - Digizone',
        config.get('emailService.emailTemplates.verifyEmail'),
        {
          customerName: user.name,
          customerEmail: user.email,
          otp,
        }
      )

      return {
        success: true,
        message: 'Otp sent successfully'
      }
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userDB.findOne({
        email
      })
      if (!user) {
        throw new Error('User not found')
      }
      let password = Math.random().toString(36).substring(2, 12);
      const tempPassword = password;
      password = await generateHashPassword(password)
      await this.userDB.updateOne(
        {
          _id: user._id
        },
        {
          password
        },
      );

      this.mailerService.sendEmail(
        [user.email],
        'Reset Password - Digizone',
        config.get('emailService.emailTemplates.forgotPassword'),
        {
          customerName: user.name,
          customerEmail: user.email,
          newPassword: tempPassword,
          loginLink: config.get('loginLink')
        }
      )

      return {
        success: true,
        message: 'Password sent to your email',
        result: { email: user.email }
      }
    } catch (error) {
      throw error;
    }
  }

  async findAll(type: string) {
    try {
      const users = await this.userDB.findAll({
        type
      });

      return {
        success: true,
        message: "Users fetched successfully",
        result: users
      }
    } catch (error) {
      throw error;
    }
  }

  async updatePasswordOrName(id: string, updateUserDto: UpdateUserDto) {
    try {
      const { oldPassword, newPassword, name } = updateUserDto;

      if (!name && !newPassword) {
        throw new Error('Please provide name or password');
      }

      const user = await this.userDB.findOne({
        _id: id
      });

      if (!user) {
        throw new Error('User not found');
      }
      if (newPassword) {
        const isPasswordMatched = await comparePassword(
          oldPassword,
          user.password
        );
        if (!isPasswordMatched) {
          throw new Error('Invalid old password')
        }
        const password = await generateHashPassword(newPassword)
        await this.userDB.updateOne(
          {
            _id: id
          },
          {
            password
          },
        );

        if (name) {
          await this.userDB.updateOne(
            {
              _id: id
            },
            {
              name
            },
          );
        }

        return {
          success: true,
          message: 'User updated successfully',
          result: {
            name: user.name,
            email: user.email,
            type: user.type,
            id: user._id.toString(),
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }


  async changePassword(email: string, updateUserDto: UpdateUserDto) {
    try {
      const { oldPassword, newPassword, name } = updateUserDto;
      if (!name && !newPassword) {
        throw new Error('Please provide name or password');
      }

      const user = await this.userDB.findOne({
        email: email
      });

      if (!user) {
        throw new Error('User not found');
      }
      const emailHashed = decrypt(updateUserDto.token)
      if (emailHashed !== email) {
        throw new Error('Access invalid')
      }
      if (newPassword) {
        const isPasswordMatched = await comparePassword(
          oldPassword,
          user.password
        );
        if (!isPasswordMatched) {
          throw new Error('Invalid old password')
        }
        const password = await generateHashPassword(newPassword)
        await this.userDB.updateOne(
          {
            email: email
          },
          {
            password
          },
        );
        return {
          success: true,
          message: 'Password changed successfully',
          result: {
            name: user.name,
            email: user.email,
            type: user.type,
            id: user._id.toString(),
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async sendLinkChangePassword(email: string) {
    try {
      const user = await this.userDB.findOne({
        email: email
      });

      if (!user) {
        throw new Error('User not found');
      }
      const tokenHashed = encrypt(user.email)

      this.mailerService.sendEmail(
        [user.email],
        'Reset Password - Digizone',
        config.get('emailService.emailTemplates.changePassword'),
        {
          customerName: user.name,
          customerEmail: user.email,
          changePasswordLink: `${config.get('emailService.emailHost.emailChangePasswordHost')}#${tokenHashed}`,
          loginLink: config.get('loginLink')
        }
      )
      return {
        success: true,
        message: 'Correo de cambio de password enviado con exito',
        result: {
          email: user.email
        }
      }
    }
    catch (error) {
      throw error;
    }
  }
  async findOne(id: number) {
    try {
      return ''
    } catch (error) {
      throw error;
    }

  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }



}
