/**
 * Represents the state of a user in the game system
 * @property level - The current level of the user
 * @property loginStreak - The number of consecutive days the user has logged in
 * @property [key: string] - Additional user state properties
 */
export interface UserState {
  level?: number;
  loginStreak?: number;
  [key: string]: unknown;
}

/**
 * Service interface for retrieving user state information
 * @method getUserState - Retrieves the current state of a user
 * @param userId - The unique identifier of the user
 * @returns Promise<UserState> - A promise that resolves to the user's state
 */
export interface UserStateService {
  getUserState(userId: string): Promise<UserState>;
}
