import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GameEventManagementService,
  USER_STATE_SERVICE,
} from './application/game-event-management.service';
import { RewardRequestServiceImpl } from './application/reward-request.service';
import { GameEventController } from './game-event.controller';
import { GameEventServiceImpl } from './game-event.service';
import { MongooseGameEventRepository } from './infrastructure/repositories/mongoose-game-event.repository';
import { MongooseRewardRequestRepository } from './infrastructure/repositories/mongoose-reward-request.repository';
import { MongooseRewardRepository } from './infrastructure/repositories/mongoose-reward.repository';
import { RewardServiceImpl } from './reward.service';
import { GameEventEntity, GameEventSchema } from './schemas/game-event.schema';
import {
  RewardRequestEntity,
  RewardRequestSchema,
} from './schemas/reward-request.schema';
import { RewardEntity, RewardSchema } from './schemas/reward.schema';
import { GAME_EVENT_SERVICE } from './application/interfaces/game-event.interface';
import { REWARD_SERVICE } from './application/interfaces/reward.interface';
import { GAME_EVENT_REPOSITORY } from './infrastructure/repositories/game-event.repository.interface';
import { REWARD_REPOSITORY } from './infrastructure/repositories/reward.repository.interface';
import { REWARD_REQUEST_SERVICE } from './application/interfaces/reward-request.interface';
import { REWARD_REQUEST_REPOSITORY } from './domain/reward-request.domain';
import { JwtModule } from '@nestjs/jwt';
import { AuthCoreModule } from '@app/common/auth-core/auth-core.module';
import { JwtSigningKeyProvider } from '@app/common/auth-core/interfaces/jwt-key-provider.interface';
import { JWT_SIGNING_KEY_PROVIDER } from '@app/common/auth-core/interfaces/jwt-key-provider.interface';
import { MockUserStateService } from './application/mock-user-state.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameEventEntity.name, schema: GameEventSchema },
      { name: RewardEntity.name, schema: RewardSchema },
      { name: RewardRequestEntity.name, schema: RewardRequestSchema },
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
    {
      provide: REWARD_REQUEST_REPOSITORY,
      useClass: MongooseRewardRequestRepository,
    },
    {
      provide: REWARD_REQUEST_SERVICE,
      useClass: RewardRequestServiceImpl,
    },
    {
      provide: USER_STATE_SERVICE,
      useClass: MockUserStateService,
    },
    GameEventManagementService,
  ],
})
export class EventModule {}
