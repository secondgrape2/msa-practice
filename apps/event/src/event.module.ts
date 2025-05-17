import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameEventController } from './game-event.controller';
import { GameEventServiceImpl } from './game-event.service';
import { RewardServiceImpl } from './reward.service';
import { GameEventManagementService } from './application/game-event-management.service';
import { GAME_EVENT_SERVICE } from './application/interfaces/game-event.interface';
import { REWARD_SERVICE } from './application/interfaces/reward.interface';
import { GameEventSchema } from './schemas/game-event.schema';
import { GameEventEntity } from './schemas/game-event.schema';
import { RewardEntity } from './schemas/reward.schema';
import { RewardSchema } from './schemas/reward.schema';
import { GAME_EVENT_REPOSITORY } from './infrastructure/repositories/game-event.repository.interface';
import { MongooseGameEventRepository } from './infrastructure/repositories/mongoose-game-event.repository';
import { REWARD_REPOSITORY } from './infrastructure/repositories/reward.repository.interface';
import { MongooseRewardRepository } from './infrastructure/repositories/mongoose-reward.repository';
import {
  AuthCoreModule,
  JWT_SIGNING_KEY_PROVIDER,
  JwtSigningKeyProvider,
} from '@app/common/auth-core';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthCoreModule,
    MongooseModule.forFeature([
      { name: GameEventEntity.name, schema: GameEventSchema },
      { name: RewardEntity.name, schema: RewardSchema },
    ]),
    JwtModule.registerAsync({
      imports: [AuthCoreModule],
      useFactory: async (jwtKeyProvider: JwtSigningKeyProvider) => ({
        secret: await jwtKeyProvider.getSigningKey('HS256'),
      }),
      inject: [JWT_SIGNING_KEY_PROVIDER],
    }),
  ],
  controllers: [GameEventController],
  providers: [
    {
      provide: GAME_EVENT_SERVICE,
      useClass: GameEventServiceImpl,
    },
    {
      provide: REWARD_SERVICE,
      useClass: RewardServiceImpl,
    },
    {
      provide: GAME_EVENT_REPOSITORY,
      useClass: MongooseGameEventRepository,
    },
    {
      provide: REWARD_REPOSITORY,
      useClass: MongooseRewardRepository,
    },
    GameEventManagementService,
  ],
})
export class EventModule {}
