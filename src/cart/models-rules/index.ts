import { CartEntity, CartItemEntity } from '../models/cart.entity';

/**
 * @param {Cart} cart
 * @returns {number}
 */
export function calculateCartTotal(cart: CartEntity): number {
  return cart
    ? cart.items.reduce(
        (acc: number, { product: { price }, count }: CartItemEntity) => {
          return (acc += price * count);
        },
        0,
      )
    : 0;
}
