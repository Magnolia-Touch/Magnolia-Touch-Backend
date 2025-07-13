import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { JwtAuthGuard } from '../jwt-auth.guard'; // if using JWT guard

@Controller('auth')
export class AuthController {
    constructor(private authservice: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.authservice.register(body.email, body.password, body.name, body.phone);
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
  @Get('users')
//   @UseGuards(JwtAuthGuard) // optional: protect route
  getAllUsers() {
    return this.authservice.getAllUsers();
  }

  // ✅ GET current logged-in user
  @Get('me')
//   @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    return req.user; // populated by JwtStrategy
  }

  // ✅ GET user by ID
  @Get('users/:id')
//   @UseGuards(JwtAuthGuard)
  getUserById(@Param('id') id: string) {
    return this.authservice.getUserById(Number(id));
  }
}




