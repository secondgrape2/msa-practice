import { ConditionConfig, BaseConditionRule } from './game-event.domain';

/**
 * Represents the state of a user in the game system
 * @property level - The current level of the user
 * @property loginStreak - The number of consecutive days the user has logged in
 * @property [key: string] - Additional user state properties
 */
interface UserState {
  level?: number;
  loginStreak?: number;
  [key: string]: unknown;
}

/**
 * Parameters for level-based conditions
 * @property minLevel - The minimum level required to satisfy the condition
 * @property [key: string] - Additional parameters
 */
interface LevelParams {
  minLevel: number;
  [key: string]: unknown;
}

/**
 * Parameters for login streak conditions
 * @property days - The minimum number of consecutive login days required
 * @property [key: string] - Additional parameters
 */
interface LoginStreakParams {
  days: number;
  [key: string]: unknown;
}

/**
 * Type guard to check if the parameters are for a level condition
 * @param params - The parameters to check
 * @returns True if the parameters contain a valid minLevel
 */
function isLevelParams(params: Record<string, unknown>): params is LevelParams {
  return typeof params.minLevel === 'number';
}

/**
 * Type guard to check if the parameters are for a login streak condition
 * @param params - The parameters to check
 * @returns True if the parameters contain a valid days value
 */
function isLoginStreakParams(
  params: Record<string, unknown>,
): params is LoginStreakParams {
  return typeof params.days === 'number';
}

/**
 * Utility class for checking if a user meets event conditions
 */
export class ConditionChecker {
  /**
   * Checks if a user meets all conditions specified in the config
   * @param config - The condition configuration to check against
   * @param userState - The current state of the user
   * @returns True if the user meets all conditions
   */
  static checkCondition(
    config: ConditionConfig,
    userState: UserState,
  ): boolean {
    const { operator, rules } = config;

    if (operator === 'AND') {
      return rules.every((rule) => this.checkRule(rule, userState));
    } else if (operator === 'OR') {
      return rules.some((rule) => this.checkRule(rule, userState));
    }

    return false;
  }

  /**
   * Checks if a user meets a single condition rule
   * @param rule - The condition rule to check
   * @param userState - The current state of the user
   * @returns True if the user meets the condition
   */
  private static checkRule(
    rule: BaseConditionRule,
    userState: UserState,
  ): boolean {
    switch (rule.type) {
      case 'level':
        if (isLevelParams(rule.params)) {
          return this.checkUserLevel(rule.params, userState);
        }
        return false;
      case 'login_streak':
        if (isLoginStreakParams(rule.params)) {
          return this.checkLoginStreak(rule.params, userState);
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * Checks if a user meets a level-based condition
   * @param params - The level condition parameters
   * @param userState - The current state of the user
   * @returns True if the user's level meets or exceeds the minimum requirement
   */
  private static checkUserLevel(
    params: LevelParams,
    userState: UserState,
  ): boolean {
    return userState.level !== undefined && userState.level >= params.minLevel;
  }

  /**
   * Checks if a user meets a login streak condition
   * @param params - The login streak condition parameters
   * @param userState - The current state of the user
   * @returns True if the user's login streak meets or exceeds the required days
   */
  private static checkLoginStreak(
    params: LoginStreakParams,
    userState: UserState,
  ): boolean {
    return (
      userState.loginStreak !== undefined &&
      userState.loginStreak >= params.days
    );
  }
}
