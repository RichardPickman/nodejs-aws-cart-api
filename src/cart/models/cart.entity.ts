import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CartStatuses {
  OPEN = 'OPEN',
  ORDERED = 'ORDERED',
}

@Entity()
export class ProductEntity extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'integer' })
  price: number;
}

@Entity()
export class CartItemEntity extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar' })
  product_id: string;

  @Column({ type: 'integer' })
  count: number;

  @OneToOne(() => ProductEntity)
  @JoinColumn()
  product: ProductEntity;

  @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart_id: string;
}

@Entity()
export class CartEntity extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar' })
  user_id: string;

  @CreateDateColumn()
  created_at: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column({ type: 'varchar' })
  status: CartStatuses;

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.cart_id, {
    onDelete: 'CASCADE',
  })
  items: CartItemEntity[];
}
