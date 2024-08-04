import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { OrderEntity } from '../models/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
  ) {}

  async findById(orderId: string): Promise<OrderEntity> {
    const order = await this.orders.findOneBy({ id: orderId });

    if (!order) {
      throw new Error('Order does not exist.');
    }

    return order;
  }

  async create(data: Partial<OrderEntity>) {
    const id = randomUUID();

    const order = new OrderEntity();

    for (const [key, value] of Object.entries(data)) {
      order[key] = value;
    }

    order.id = id;

    const result = await this.orders.save(order);

    return result;
  }

  update(orderId: string, data: Partial<OrderEntity>) {
    const order = this.findById(orderId);

    if (!order) {
      throw new Error('Order does not exist.');
    }

    return order;
  }
}
