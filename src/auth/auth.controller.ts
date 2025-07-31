import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RolesGuard } from 'src/common/decoraters/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { Roles } from 'src/common/decoraters/roles.decorator';


@Controller('auth')
export class AuthController {
    constructor(private authservice: AuthService) {}

    
  @Post('register')
  register(@Body() registerdto: RegisterDto) {
    return this.authservice.register(registerdto);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
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
  @UseGuards(JwtAuthGuard) // optional: protect route
  @Get('users')
  getAllUsers() {
    return this.authservice.getAllUsers();
  }


  // ✅ GET current logged-in user
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    return req.user; // populated by JwtStrategy
  }


  // ✅ GET user by ID
  @Get('users/:id')
  //@UseGuards(JwtAuthGuard)
  getUserById(@Param('id') id: string) {
    return this.authservice.getUserById(Number(id));
  }

  
}




