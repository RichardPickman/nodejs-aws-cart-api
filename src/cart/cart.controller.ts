import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Req,
} from '@nestjs/common';

// import { BasicAuthGuard, JwtAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest } from '../shared';

import { calculateCartTotal } from './models-rules';
import { CartEntity, CartStatuses } from './models/cart.entity';
import { CartService } from './services';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart() {
    const userId = '123';

    const cart = await this.cartService.findOrCreateByUserId(userId);
    const cartExistAndNotEmpty = cart && cart.items.length;

    return {
      cart,
      total: cartExistAndNotEmpty ? calculateCartTotal(cart) : 0,
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: Partial<CartEntity>,
  ) {
    const userId = '123';
    // TODO: validate body payload...
    const cart = await this.cartService.updateByUserId(userId, body);

    return {
      cart,
      total: calculateCartTotal(cart),
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Delete()
  async clearUserCart(@Req() req: AppRequest, @Body() body) {
    const userId = '123';
    await this.cartService.removeByUserId(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: AppRequest, @Body() body) {
    const userId = '123';
    const cart = await this.cartService.findByUserId(userId);
    const cartExistAndNotEmpty = cart && cart.items.length;

    if (!cartExistAndNotEmpty) {
      return new HttpException('Cart is empty', HttpStatus.BAD_REQUEST);
    }

    const { id: cartId, items } = cart;
    const total = calculateCartTotal(cart);
    const order = await this.orderService.create({
      ...body, // TODO: validate and pick only necessary data
      payment: JSON.stringify({}),
      delivery: JSON.stringify({}),
      status: 'ORDERED',
      userId,
      cartId,
      items,
      total,
    });

    try {
      await this.cartService.updateByUserId(userId, {
        status: CartStatuses.ORDERED,
      });

      return order;
    } catch (error) {
      console.log(error);

      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }
}
