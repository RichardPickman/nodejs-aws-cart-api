import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import {
  CartEntity,
  CartItemEntity,
  CartStatuses,
  ProductEntity,
} from '../models/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async findByUserId(userId: string): Promise<CartEntity> {
    console.log('Trying to find cart by user id');
    const user = await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: ['items', 'items.product'],
    });

    return user;
  }

  async createByUserId(userId: string) {
    console.log('Trying to create cart by user id');
    const id = randomUUID();

    const newCart = new CartEntity();

    newCart.id = id;
    newCart.user_id = userId;
    newCart.status = CartStatuses.OPEN;

    await this.cartRepository.save(newCart);

    try {
      const userCart = await this.cartRepository.findOne({
        where: { id: newCart.id },
        relations: ['items', 'items.product'],
      });

      return userCart;
    } catch (error) {
      console.log(error);

      return null;
    }
  }

  async findOrCreateByUserId(userId: string): Promise<CartEntity> {
    console.log('Starting to find or create cart by user id');
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async createItem(data: Partial<CartItemEntity>) {
    const id = randomUUID();

    const cartItem = new CartItemEntity();

    for (const [key, value] of Object.entries(data)) {
      cartItem[key] = value;
    }

    const product = await this.productRepository.findOne({
      where: { id: data.product_id },
    });

    cartItem.product = product;
    cartItem.id = id;

    console.log(
      'Finish constructing cart item. Proceed to save item: ',
      cartItem,
    );

    const result = await this.cartItemRepository.save(cartItem);

    return result;
  }

  async updateItem(itemId: string, data: Partial<CartItemEntity>) {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['product'],
    });

    for (const [key, value] of Object.entries(data)) {
      cartItem[key] = value;
    }

    console.log('Finish updating cart item: ', cartItem);

    const result = await this.cartItemRepository.save(cartItem);

    return result;
  }

  async updateByUserId(
    userId: string,
    { items, ...rest }: Partial<CartEntity>,
  ): Promise<CartEntity> {
    console.log('Starting to update cart by user id');
    const cart = await this.findOrCreateByUserId(userId);

    console.log('Cart before update: ', cart);

    if (items) {
      for (const item of items) {
        const isExist = !!item.id;

        if (isExist) {
          console.log('Item exists. Updating item');
          const cartItem = await this.updateItem(item.id, { ...item });

          cart.items = cart.items.map((item) =>
            item.id === cartItem.id ? cartItem : item,
          );
        }

        if (!isExist) {
          console.log('Item does not exist. Creating item');
          const cartItem = await this.createItem({ ...item });

          cart.items.push(cartItem);
        }
      }
    }

    for (const [key, value] of Object.entries(rest)) {
      cart[key] = value;
    }

    const updatedCart = await this.cartRepository.save(cart);

    console.log('Finish updating cart by user id. Result: ', updatedCart);

    return updatedCart;
  }

  async removeByUserId(userId: string): Promise<CartEntity> {
    const cart = await this.cartRepository.findOne({
      where: { user_id: userId },
    });

    const result = await this.cartRepository.remove(cart);

    return result;
  }
}
