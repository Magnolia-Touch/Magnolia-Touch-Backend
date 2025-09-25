import { Controller, Post, Get, Body, Param, UseGuards, Request, Query, Put, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { Roles } from 'src/common/decoraters/roles.decorator';
import { PaginationQueryDto } from 'src/common/dto/paginationquery.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authservice: AuthService) { }


  @Post('register')
  register(@Body() registerdto: RegisterDto) {
    return this.authservice.register(registerdto);
  }


  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Post('adminregister')
  adminregister(@Body() registerdto: RegisterDto) {
    return this.authservice.adminregister(registerdto);
  }


  @Post('login')
  login(@Body() body: any) {
    return this.authservice.login(body.identifier, body.password); // supports email or phone
  }


  @Post('logout')
  logout() {
    return this.authservice.logout();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  async getAllUsers(
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.authservice.getAllUsers({ search, page, limit });
  }


  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    const customer_id = req.user.customer_id;
    return this.authservice.userProfile(customer_id);
  }

  @UseGuards(JwtAuthGuard)
  @Put("profile")
  async updateUser(
    @Request() req,
    @Body() data: UpdateUserDto,
  ) {
    const user = req.user.customer_id
    return this.authservice.updateUser(user, data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    const userId = req.user.customer_id; // assuming JWT payload has { id }
    return this.authservice.changePassword(userId, dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authservice.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authservice.resetPassword(dto);
  }

}




