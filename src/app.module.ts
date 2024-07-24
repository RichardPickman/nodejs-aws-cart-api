import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
} from '../constants/credentials';
import { AuthModule } from './auth/auth.module';
import { CartEntity, CartItemEntity, ProductEntity } from './cart';
import { CartModule } from './cart/cart.module';
import { OrderEntity } from './order';
import { OrderModule } from './order/order.module';

dotenv.config();
@Module({
  imports: [
    AuthModule,
    CartModule,
    OrderModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DB_HOST,
      port: Number(DB_PORT) || 5432,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [CartItemEntity, CartEntity, ProductEntity, OrderEntity],
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
