import { User } from '../../interfaces/auth.interface';

/** @description Symbol for dependency injection of UserRepository */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

/**
 * @description Repository interface for user data operations
 */
export interface UserRepository {
  /** @description Find a user by their email address */
  findByEmail(email: string): Promise<User | null>;

  /** @description Find a user by their unique identifier */
  findById(id: string): Promise<User | null>;

  /** @description Create a new user with email and hashed password */
  create(email: string, hashedPassword: string): Promise<User>;

  /** @description Update an existing user's information */
  update(id: string, data: Partial<User>): Promise<User>;

  /** @description Delete a user by their unique identifier */
  delete(id: string): Promise<void>;
}
