import { Injectable } from '@nestjs/common';
import { UserState, UserStateService } from '../domain/user-state.domain';

@Injectable()
export class MockUserStateService implements UserStateService {
  async getUserState(userId: string): Promise<UserState> {
    // Return the same mock state for all users
    return {
      level: 15,
      loginStreak: 10,
    };
  }
}
