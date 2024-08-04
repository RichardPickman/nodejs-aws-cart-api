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

  async getProducts(): Promise<ProductEntity[]> {
    return this.productRepository.find();
  }

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
    const product = await this.productRepository.findOne({
      where: { id: data.product_id },
    });

    cartItem.id = id;
    cartItem.product = product;
    cartItem.cart_id = data.cart_id;
    cartItem.product_id = product.id;
    cartItem.count = data.count;

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

    const result = await this.cartItemRepository.save(cartItem);

    return result;
  }

  async updateByUserId(
    userId: string,
    { items }: Partial<CartEntity>,
  ): Promise<CartEntity> {
    const cart = await this.findOrCreateByUserId(userId);

    if (items) {
      for (const item of items) {
        const existingProduct = cart.items.find(
          (product) => product.product_id === item.product_id,
        );

        const isNewCountEqualsZero = item.count === 0;

        if (isNewCountEqualsZero) {
          const product = await this.cartItemRepository.findOne({
            where: { id: existingProduct.id },
          });

          await this.cartItemRepository.remove(product);

          continue;
        }

        const isExist = !!existingProduct;

        if (isExist) {
          console.log('Item exists. Updating item');
          const cartItem = await this.updateItem(item.id, {
            ...existingProduct,
            ...item,
          });

          cart.items = cart.items.map((item) =>
            item.id === cartItem.id ? cartItem : item,
          );
        }

        if (!isExist) {
          console.log('Item does not exist. Creating item');
          const cartItem = await this.createItem({ ...item, cart_id: cart.id });

          cart.items.push(cartItem);
        }
      }
    }

    cart.user_id = userId;

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
