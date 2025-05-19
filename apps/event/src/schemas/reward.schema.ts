import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  CONDITION_TYPE,
  ConditionType,
  CouponRewardDetails,
  ItemRewardDetails,
  PointRewardDetails,
  Reward,
  REWARD_TYPE,
  RewardType,
} from '../domain/reward.domain';
import { ConditionConfig } from '../domain/game-event.domain';

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
  pointDetails?: PointRewardDetails;

  @Prop({ type: Object })
  itemDetails?: ItemRewardDetails;

  @Prop({ type: Object })
  couponDetails?: CouponRewardDetails;

  @Prop({ type: String, required: true, enum: Object.values(CONDITION_TYPE) })
  conditionType: ConditionType;

  @Prop({ type: Object, required: true, default: {} })
  conditionConfig: ConditionConfig;

  @Prop({ required: true, trim: true })
  conditionsDescription: string;

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
  pointDetails: doc.pointDetails,
  itemDetails: doc.itemDetails,
  couponDetails: doc.couponDetails,
  conditionConfig: doc.conditionConfig,
  conditionsDescription: doc.conditionsDescription,
  conditionType: doc.conditionType,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
