import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
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

@Entity()
export class CartItemEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  cart_id: string;

  @Column({ type: 'varchar', default: null })
  product_id: string;

  @Column({ type: 'int', default: null })
  count: number;
}

@Entity()
export class CartEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', default: null })
  user_id: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column({ type: 'varchar', default: null })
  status: CartStatuses;

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.cart_id)
  items: CartItemEntity[];
}
