import { GameEvent } from '../../domain/game-event.domain';

/**
 * Symbol token for dependency injection of the game event repository
 */
export const GAME_EVENT_REPOSITORY = Symbol('GAME_EVENT_REPOSITORY');

/**
 * Repository interface for managing game event data
 * Provides methods for CRUD operations and specific queries for game events
 */
export interface GameEventRepository {
  /**
   * Creates a new game event
   * @param data - Partial game event data to create
   * @returns Promise resolving to the created game event
   */
  create(data: Partial<GameEvent>): Promise<GameEvent>;

  /**
   * Retrieves all game events
   * @returns Promise resolving to an array of all game events
   */
  findAll(): Promise<GameEvent[]>;

  /**
   * Retrieves a game event by its ID
   * @param id - The unique identifier of the game event
   * @returns Promise resolving to the found game event or null if not found
   */
  findById(id: string): Promise<GameEvent | null>;

  /**
   * Retrieves all currently active game events
   * An event is considered active if:
   * - isActive flag is true
   * - current time is between startDate and endDate
   * @returns Promise resolving to an array of active game events
   */
  findActive(): Promise<GameEvent[]>;

  /**
   * Updates an existing game event
   * @param id - The unique identifier of the game event to update
   * @param data - Partial game event data containing the updates
   * @returns Promise resolving to the updated game event
   */
  update(id: string, data: Partial<GameEvent>): Promise<GameEvent>;

  /**
   * Deletes a game event by its ID
   * @param id - The unique identifier of the game event to delete
   * @returns Promise resolving when the game event is deleted
   */
  delete(id: string): Promise<void>;
}
