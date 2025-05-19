import { Module } from '@nestjs/common';
import {
  GameEventManagementService,
  USER_STATE_SERVICE,
} from './application/game-event-management.service';
import { GAME_EVENT_SERVICE } from './application/interfaces/game-event.interface';
import { REWARD_REQUEST_SERVICE } from './application/interfaces/reward-request.interface';
import { REWARD_SERVICE } from './application/interfaces/reward.interface';
import { MockUserStateService } from './application/mock-user-state.service';
import { RewardRequestServiceImpl } from './application/reward-request.service';
import { GameEventController } from './game-event.controller';
import { GameEventServiceImpl } from './game-event.service';
import { RewardServiceImpl } from './reward.service';

@Module({
  controllers: [GameEventController],
  providers: [
    GameEventManagementService,
    {
      provide: GAME_EVENT_SERVICE,
      useClass: GameEventServiceImpl,
    },
    {
      provide: REWARD_SERVICE,
      useClass: RewardServiceImpl,
    },
    {
      provide: REWARD_REQUEST_SERVICE,
      useClass: RewardRequestServiceImpl,
    },
    {
      provide: USER_STATE_SERVICE,
      useClass: MockUserStateService,
    },
  ],
})
export class GameEventModule {}
