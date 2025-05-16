import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { GameEvent, ConditionConfig } from '../domain/game-event.domain';

export type GameEventDocument = GameEventEntity & Document;

const GAME_EVENT_COLLECTION_NAME = 'game_events';

@Schema({ timestamps: true, collection: GAME_EVENT_COLLECTION_NAME })
export class GameEventEntity {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, trim: true })
  conditionsDescription: string;

  @Prop({ type: String, index: true })
  conditionType?: string;

  @Prop({ type: Object, required: true, default: {} })
  conditionConfig: ConditionConfig;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ required: true, default: false, index: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const GameEventSchema = SchemaFactory.createForClass(GameEventEntity);

export const toGameEventDomain = (doc: GameEventDocument): GameEvent => ({
  id: doc._id.toString(),
  name: doc.name,
  description: doc.description,
  conditionsDescription: doc.conditionsDescription,
  conditionType: doc.conditionType,
  conditionConfig: doc.conditionConfig,
  startDate: doc.startDate,
  endDate: doc.endDate,
  isActive: doc.isActive,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
