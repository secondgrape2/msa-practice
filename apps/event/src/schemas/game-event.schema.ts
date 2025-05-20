import { ModelOptions, Prop, buildSchema } from '@typegoose/typegoose';
import mongoose, { Document } from 'mongoose';
import { GameEvent } from '../domain/game-event.domain';

export type GameEventDocument = GameEventEntity & Document;

const GAME_EVENT_COLLECTION_NAME = 'game_events';

@ModelOptions({
  schemaOptions: {
    collection: GAME_EVENT_COLLECTION_NAME,
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
    },
  },
})
export class GameEventEntity {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, type: Date })
  startAt: Date;

  @Prop({ required: true, type: Date })
  endAt: Date;

  @Prop({ required: true, default: false, index: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const GameEventSchema = buildSchema(GameEventEntity);

export const toGameEventDomain = (doc: GameEventDocument): GameEvent => ({
  id: doc._id.toString(),
  name: doc.name,
  description: doc.description,
  startAt: doc.startAt,
  endAt: doc.endAt,
  isActive: doc.isActive,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
