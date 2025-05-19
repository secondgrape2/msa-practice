import { GameEvent } from '../../domain/game-event.domain';
import { CreateGameEventDto } from '@app/common/event/dto/game-event.dto';

/**
 * @description Service interface for managing game events.
 */
export const GAME_EVENT_SERVICE = Symbol('GAME_EVENT_SERVICE');

/**
 * @description Interface defining the contract for game event operations.
 */
export interface GameEventService {
  /**
   * @description Creates a new game event.
   * @param createGameEventDto - Data for creating the game event
   * @returns Promise resolving to the created GameEvent
   */
  create(createGameEventDto: CreateGameEventDto): Promise<GameEvent>;

  /**
   * @description Retrieves all game events.
   * @returns Promise resolving to an array of GameEvent
   */
  findAll(): Promise<GameEvent[]>;

  /**
   * @description Retrieves a game event by its ID.
   * @param id - The unique identifier of the game event
   * @returns Promise resolving to the found GameEvent or null if not found
   */
  findOne(id: string): Promise<GameEvent | null>;

  /**
   * @description Retrieves all currently active game events.
   * @returns Promise resolving to an array of active GameEvent
   */
  findActive(): Promise<GameEvent[]>;
}
