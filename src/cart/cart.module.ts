import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import {
  CartEntity,
  CartItemEntity,
  ProductEntity,
} from './models/cart.entity';
import { CartService } from './services';

@Module({
  imports: [
    OrderModule,
    TypeOrmModule.forFeature([CartItemEntity, CartEntity, ProductEntity]),
  ],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
