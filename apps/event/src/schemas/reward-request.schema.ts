import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RewardRequest } from '../domain/reward-request.domain';
import {
  REWARD_REQUEST_STATUS,
  RewardRequestStatus,
} from '@app/common/event/interfaces/reward.interface';

const REWARD_REQUEST_COLLECTION_NAME = 'reward.requests';
@Schema({ timestamps: true, collection: REWARD_REQUEST_COLLECTION_NAME })
export class RewardRequestEntity {
  _id: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  eventId: string;

  @Prop()
  rewardId?: string;

  @Prop({
    type: String,
    enum: Object.values(REWARD_REQUEST_STATUS),
    default: REWARD_REQUEST_STATUS.PENDING,
  })
  status: RewardRequestStatus;

  @Prop({ required: true })
  requestedAt: Date;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

export type RewardRequestDocument = RewardRequestEntity & Document;
export const RewardRequestSchema =
  SchemaFactory.createForClass(RewardRequestEntity);

export const toRewardRequestDomain = (
  doc: RewardRequestDocument,
): RewardRequest => ({
  id: doc._id.toString(),
  userId: doc.userId,
  eventId: doc.eventId,
  rewardId: doc.rewardId,
  status: doc.status,
  requestedAt: doc.requestedAt,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
