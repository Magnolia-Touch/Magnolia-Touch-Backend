import { Controller, Post, Get, Body, Param, UseGuards, Request, Query, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { Roles } from 'src/common/decoraters/roles.decorator';
import { PaginationQueryDto } from 'src/common/dto/paginationquery.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

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


  // ✅ GET all users (admin-level access)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('users')
  getAllUsers(@Query() query: PaginationQueryDto) {
    return this.authservice.getAllUsers(query);
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

}




