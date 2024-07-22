import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CartEntity } from '../models/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
  ) {}

  async findByUserId(userId: string): Promise<CartEntity> {
    const user = await this.cartRepository.findOne({
      where: { user_id: userId },
    });

    return user;
  }

  async createByUserId(userId: string) {
    const id = randomUUID();

    const newCart = new CartEntity();

    newCart.id = id;
    newCart.user_id = userId;

    const userCart = await this.cartRepository.save(newCart);

    return userCart;
  }

  async findOrCreateByUserId(userId: string): Promise<CartEntity> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(
    userId: string,
    { items }: CartEntity,
  ): Promise<CartEntity> {
    const cart = await this.findOrCreateByUserId(userId);

    cart.items = [...items];

    const updatedCart = await this.cartRepository.save(cart);

    return updatedCart;
  }

  async removeByUserId(userId): Promise<CartEntity> {
    const cart = await this.cartRepository.findOne({
      where: { user_id: userId },
    });

    const result = await this.cartRepository.remove(cart);

    return result;
  }
}
