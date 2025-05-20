import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ROLE, Role } from '@app/common/auth-core/constants/role.constants';
import { User } from '../interfaces/auth.interface';
import { Index } from '@typegoose/typegoose';

export type UserDocument = UserEntity & Document;

const USER_COLLECTION_NAME = 'users';
@Index({ email: 1 }, { unique: true })
@Schema({ timestamps: true, collection: USER_COLLECTION_NAME })
export class UserEntity {
  _id: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [String],
    enum: Object.values(ROLE),
    default: [ROLE.USER],
  })
  roles: Role[];

  @Prop({ required: false })
  lastLoginAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity);

export const toUserDomain = (doc: UserDocument): User => ({
  id: doc._id.toString(),
  email: doc.email,
  password: doc.password,
  roles: doc.roles,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  lastLoginAt: doc.lastLoginAt,
});
