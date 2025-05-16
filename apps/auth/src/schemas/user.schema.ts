import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { USER_ROLE, UserRole } from '../constants/user.constants';
import { User } from '../domain/user.domain';

export type UserDocument = UserEntity & Document;

@Schema({ timestamps: true })
export class UserEntity {
  _id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [String],
    enum: Object.values(USER_ROLE),
    default: [USER_ROLE.user],
  })
  roles: UserRole[];

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
});
