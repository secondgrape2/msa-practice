import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserEntity,
  UserDocument,
  toUserDomain,
} from '../../schemas/user.schema';
import { UserRepository } from './user.repository.interface';
import { User } from '../../domain/user.domain';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MongooseUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserEntity.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? toUserDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? toUserDomain(user) : null;
  }

  async create(email: string, hashedPassword: string): Promise<User> {
    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      roles: ['user'],
    });
    return toUserDomain(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!user) {
      throw new Error('User not found');
    }
    return toUserDomain(user);
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
