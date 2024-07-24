import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { CartEntity, CartItemEntity } from '../../cart/models/cart.entity';

@Entity()
export class OrderEntity extends BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar' })
  userId: string;

  @OneToOne(() => CartEntity)
  cartId: string;

  @ManyToOne(() => CartEntity, (cart) => cart.items)
  items: CartItemEntity[];

  @Column({ type: 'json' })
  payment: {
    type: string;
    address?: any;
    creditCard?: any;
  };

  @Column({ type: 'json' })
  delivery: {
    type: string;
    address: any;
  };

  @Column({ type: 'varchar', nullable: true })
  comments: string;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'integer' })
  total: number;
}
