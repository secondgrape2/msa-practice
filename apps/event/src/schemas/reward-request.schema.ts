import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RewardRequest } from '../domain/reward-request.domain';
import { Index } from '@typegoose/typegoose';
import {
  REWARD_REQUEST_STATUS,
  RewardRequestStatus,
} from '../domain/reward.domain';
import mongoose from 'mongoose';

const REWARD_REQUEST_COLLECTION_NAME = 'reward.requests';
@Schema({ timestamps: true, collection: REWARD_REQUEST_COLLECTION_NAME })
@Index({ userId: 1, eventId: 1, rewardId: 1 }, { unique: true })
@Index({ userId: 1, requestedAt: 1 })
@Index({ userId: 1, completedAt: 1 })
export class RewardRequestEntity {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Types.ObjectId })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Types.ObjectId })
  eventId: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Types.ObjectId })
  rewardId: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(REWARD_REQUEST_STATUS),
    required: true,
    default: REWARD_REQUEST_STATUS.PENDING,
  })
  status: RewardRequestStatus;

  @Prop({ type: String, required: false })
  failureReason?: string;

  @Prop({ type: Date, required: false })
  completedAt?: Date;

  @Prop({ required: true })
  requestedAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type RewardRequestDocument = RewardRequestEntity & Document;
export const RewardRequestSchema =
  SchemaFactory.createForClass(RewardRequestEntity);

export const toRewardRequestDomain = (
  doc: RewardRequestDocument,
): RewardRequest => ({
  id: doc._id.toString(),
  userId: doc.userId.toString(),
  eventId: doc.eventId.toString(),
  rewardId: doc.rewardId.toString(),
  status: doc.status,
  failureReason: doc.failureReason,
  requestedAt: doc.requestedAt,
  completedAt: doc.completedAt,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
