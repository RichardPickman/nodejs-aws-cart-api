import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { randomUUID } from 'crypto';
import { User } from '../models';

@Injectable()
export class UsersService {
  private readonly users: Record<string, User>;

  constructor() {
    this.users = {};
  }

  findOne(userId: string): User {
    const createDummyUser = () => ({
      id: userId,
      name: randomUUID(),
      password: randomUUID(),
    });

    if (!this.users[userId]) {
      this.users[userId] = createDummyUser();
    }

    return this.users[userId];
  }

  createOne({ name, password }: User): User {
    const id = v4();
    const newUser = { id: name || id, name, password };

    this.users[id] = newUser;

    return newUser;
  }
}
