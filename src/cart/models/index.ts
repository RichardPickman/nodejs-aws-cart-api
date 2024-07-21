import {
  BaseEntity,
  Column,
  CreateDateColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum CartStatuses {
  OPEN = 'OPEN',
  STATUS = 'STATUS',
}

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export class CartItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  cart_id: string;

  @Column({ nullable: true })
  product_id: string;

  @Column()
  count: number;
}

export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  user_id: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column()
  status: CartStatuses;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart_id)
  items: CartItem[];
}
