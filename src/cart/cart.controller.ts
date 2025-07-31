// cart.controller.ts
import { Controller, Post, Delete, Get, Query, Body, Request, UseGuards, Param } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add-to-cart')
  async addProductToCart(
    @Query('productId') productId: number,
    @Query('quantity') quantity: number,
    @Request() req
  ) {
    return this.cartService.addToCart(+productId, +quantity, req.user.customer_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-cart')
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.customer_id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('remove-from-cart')
  async removeProductFromCart(
    @Query('productId') productId: number,
    @Request() req
  ) {
    return this.cartService.removeFromCart(+productId, req.user.customer_id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear')
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.customer_id);
  }
}