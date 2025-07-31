
// cart.service.ts
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(productId: number, quantity: number, userId: number) {
    const product = await this.prisma.products.findUnique({ where: { product_id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const price = parseFloat(product.price);
    let cart = await this.prisma.cart.findFirst({ where: { userId }, include: { items: true } });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId, total_amount: '0' },
        include: {items: true}
      });
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.cartId, productId },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.cartId,
          productId,
          quantity,
          price,
        },
      });
    }
    const updatedItems = await this.prisma.cartItem.findMany({ where: { cartId: cart.cartId } });
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await this.prisma.cart.update({
      where: { cartId: cart.cartId },
      data: { total_amount: totalAmount.toString() },
    });

    return { message: 'Product added to cart successfully', status: HttpStatus.CREATED };
  }
  

  async getCart(userId: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  async removeFromCart(productId: number, userId: number) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const item = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.cartId, productId },
    });

    if (!item) throw new NotFoundException('Product not found in cart');

    if (item.quantity > 1) {
      // Decrease quantity by 1
      await this.prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: item.quantity - 1 },
      });
    } else {
      // Remove item from cart if quantity == 1
      await this.prisma.cartItem.delete({
        where: { id: item.id },
      });
    }

    // Recalculate total
    const updatedItems = await this.prisma.cartItem.findMany({
      where: { cartId: cart.cartId },
    });

    const totalAmount = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await this.prisma.cart.update({
      where: { cartId: cart.cartId },
      data: { total_amount: totalAmount.toString() },
    });

    return { message: 'Product removed from cart' };
  }


    async clearCart(userId: number) {
      const cart = await this.prisma.cart.findFirst({ where: { userId } });
      if (!cart) throw new NotFoundException('Cart not found');

      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.cartId } });
      await this.prisma.cart.update({ where: { cartId: cart.cartId }, data: { total_amount: '0' } });

      return { message: 'Cart cleared successfully' };
    }
}
