import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Reward, RewardDetails } from '../domain/reward.domain';
import {
  REWARD_TYPE,
  RewardType,
} from '@app/common/event/interfaces/reward.interface';

export type RewardDocument = RewardEntity & Document;

const REWARD_COLLECTION_NAME = 'rewards';

@Schema({ timestamps: true, collection: REWARD_COLLECTION_NAME })
export class RewardEntity {
  _id: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  eventId: Types.ObjectId;

  @Prop({
    required: true,
    enum: Object.values(REWARD_TYPE),
    type: String,
  })
  type: RewardType;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ type: Object })
  details?: RewardDetails;

  createdAt: Date;
  updatedAt: Date;
}

export const RewardSchema = SchemaFactory.createForClass(RewardEntity);

export const toRewardDomain = (doc: RewardDocument): Reward => ({
  id: doc._id.toString(),
  eventId: doc.eventId.toString(),
  type: doc.type,
  name: doc.name,
  description: doc.description,
  quantity: doc.quantity,
  details: doc.details,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
