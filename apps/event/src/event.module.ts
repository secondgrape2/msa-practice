import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameEventController } from './game-event.controller';
import { GameEventService } from './game-event.service';
import { GameEventEntity, GameEventSchema } from './schemas/game-event.schema';
import { RewardEntity, RewardSchema } from './schemas/reward.schema';
import { MongooseGameEventRepository } from './infrastructure/repositories/mongoose-game-event.repository';
import { GAME_EVENT_REPOSITORY } from './infrastructure/repositories/game-event.repository.interface';
import { MongooseRewardRepository } from './infrastructure/repositories/mongoose-reward.repository';
import { REWARD_REPOSITORY } from './infrastructure/repositories/reward.repository.interface';
import { RewardService } from './reward.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameEventEntity.name, schema: GameEventSchema },
      { name: RewardEntity.name, schema: RewardSchema },
    ]),
  ],
  controllers: [GameEventController],
  providers: [
    GameEventService,
    RewardService,
    {
      provide: GAME_EVENT_REPOSITORY,
      useClass: MongooseGameEventRepository,
    },
    {
      provide: REWARD_REPOSITORY,
      useClass: MongooseRewardRepository,
    },
  ],
})
export class EventModule {}
