import { Index, ModelOptions, Prop, buildSchema } from '@typegoose/typegoose';
import mongoose, { Document } from 'mongoose';
import { RewardRequest } from '../domain/reward-request.domain';
import {
  REWARD_REQUEST_STATUS,
  RewardRequestStatus,
} from '../domain/reward.domain';

const REWARD_REQUEST_COLLECTION_NAME = 'reward.requests';

@Index({ userId: 1, eventId: 1, rewardId: 1 }, { unique: true })
@Index({ userId: 1, requestedAt: 1 })
@Index({ userId: 1, completedAt: 1 })
@ModelOptions({
  schemaOptions: {
    collection: REWARD_REQUEST_COLLECTION_NAME,
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
    },
  },
})
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
export const RewardRequestSchema = buildSchema(RewardRequestEntity);

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
