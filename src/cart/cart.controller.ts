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
  UseGuards,
} from '@nestjs/common';

import { BasicAuthGuard } from '../auth';
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

  @Get('products')
  async getProducts(@Req() req: AppRequest) {
    const products = await this.cartService.getProducts();

    return products;
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    const cart = await this.cartService.findOrCreateByUserId(req.user.id);
    const cartExistAndNotEmpty = cart && cart.items.length;

    return {
      cart,
      total: cartExistAndNotEmpty ? calculateCartTotal(cart) : 0,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: Partial<CartEntity>,
  ) {
    const cart = await this.cartService.updateByUserId(req.user.id, body);

    return {
      cart,
      total: calculateCartTotal(cart),
    };
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
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
  @UseGuards(BasicAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: AppRequest, @Body() body) {
    const cart = await this.cartService.findByUserId(req.user.id);
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
      userId: req.user.id,
      cartId,
      items,
      total,
    });

    try {
      await this.cartService.updateByUserId(req.user.id, {
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
