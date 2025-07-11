import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from "express"
import { Roles } from "../shared/middleware/role.decorators";
import { userTypes } from "../shared/schema/user";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('checkJwt')
  async checkJwt(@Query('jwt') jwt: string) {
    return await this.usersService.checkJwt(jwt);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginUser: { email: string, password: string },
    @Res({ passthrough: true }) response: Response
  ) {
    const loginRes = await this.usersService.login(loginUser.email, loginUser.password);
    if (loginRes.success) {
      response.cookie('_digi_auth_token', loginRes.result?.token, { httpOnly: true });
    }
    return loginRes
  }

  @Get('/verify-email/:otp/:email')
  async verifyEmail(@Param('otp') otp: string, @Param('email') email: string) {
    return await this.usersService.verifyEmail(otp, email)
  }

  @Get('send-opt-email/:email')
  async sendOptEmail(@Param('email') email: string) {
    return await this.usersService.sendOptEmail(email)
  }

  @Put('/logout')
  async logout(@Res() res: Response) {
    res.clearCookie('_digi_auth_token');
    return res.status(HttpStatus.OK).json({
      success: true,
      message: "Logout successfully"
    })
  }

  @Get('forgot-password/:email')
  async forgotPasword(@Param('email') email: string) {
    return await this.usersService.forgotPassword(email)
  }

  @Get()
  @Roles(userTypes.ADMIN)
  async findAll(
    @Query('type') type: string,
  ) {
    return await this.usersService.findAll(type);
  }

  @Patch('/change-password/:email')
  changePassword(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.changePassword(email, updateUserDto);
  }

  @Get('/send-change-password/:email')
  async sendLinkchangePassowrd(@Param('email') email: string) {
    return await this.usersService.sendLinkChangePassword(email);
  }

  @Patch('/update-name-password/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updatePasswordOrName(id, updateUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
