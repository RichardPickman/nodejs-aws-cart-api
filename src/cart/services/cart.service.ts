import { Injectable } from '@nestjs/common';

import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { Cart } from '../models';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: Repository<Cart>) {}

  async findByUserId(userId: string): Promise<Cart> {
    const user = await this.cartRepository.findOne({
      where: { user_id: userId },
    });

    return user;
  }

  async createByUserId(userId: string) {
    const id = randomUUID();

    const newCart = new Cart();

    newCart.id = id;
    newCart.user_id = userId;

    const userCart = await this.cartRepository.save(newCart);

    return userCart;
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    const cart = await this.findOrCreateByUserId(userId);

    cart.items = [...items];

    const updatedCart = await this.cartRepository.save(cart);

    return updatedCart;
  }

  async removeByUserId(userId): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user_id: userId },
    });

    const result = await this.cartRepository.remove(cart);

    return result;
  }
}
