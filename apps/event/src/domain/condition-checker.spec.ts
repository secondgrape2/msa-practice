import { ConditionChecker } from './condition-checker';
import { ConditionConfig } from './game-event.domain';

describe('ConditionChecker', () => {
  describe('checkCondition', () => {
    it('should return true when all conditions are met with AND operator', () => {
      const config: ConditionConfig = {
        operator: 'AND',
        rules: [
          { type: 'level', params: { minLevel: 10 } },
          { type: 'login_streak', params: { days: 7 } },
        ],
      };

      const userState = {
        level: 15,
        loginStreak: 10,
      };

      expect(ConditionChecker.checkCondition(config, userState)).toBe(true);
    });

    it('should return false when any condition is not met with AND operator', () => {
      const config: ConditionConfig = {
        operator: 'AND',
        rules: [
          { type: 'level', params: { minLevel: 10 } },
          { type: 'login_streak', params: { days: 7 } },
        ],
      };

      const userState = {
        level: 5,
        loginStreak: 10,
      };

      expect(ConditionChecker.checkCondition(config, userState)).toBe(false);
    });

    it('should return true when any condition is met with OR operator', () => {
      const config: ConditionConfig = {
        operator: 'OR',
        rules: [
          { type: 'level', params: { minLevel: 10 } },
          { type: 'login_streak', params: { days: 7 } },
        ],
      };

      const userState = {
        level: 5,
        loginStreak: 10,
      };

      expect(ConditionChecker.checkCondition(config, userState)).toBe(true);
    });

    it('should return false when no condition is met with OR operator', () => {
      const config: ConditionConfig = {
        operator: 'OR',
        rules: [
          { type: 'level', params: { minLevel: 10 } },
          { type: 'login_streak', params: { days: 7 } },
        ],
      };

      const userState = {
        level: 5,
        loginStreak: 3,
      };

      expect(ConditionChecker.checkCondition(config, userState)).toBe(false);
    });

    it('should handle unknown condition types', () => {
      const config: ConditionConfig = {
        operator: 'AND',
        rules: [{ type: 'UNKNOWN_TYPE', params: {} }],
      };

      const userState = {
        level: 15,
        loginStreak: 10,
      };

      expect(ConditionChecker.checkCondition(config, userState)).toBe(false);
    });

    it('should handle missing user state values', () => {
      const config: ConditionConfig = {
        operator: 'AND',
        rules: [
          { type: 'level', params: { minLevel: 10 } },
          { type: 'login_streak', params: { days: 7 } },
        ],
      };

      const userState = {};

      expect(ConditionChecker.checkCondition(config, userState)).toBe(false);
    });
  });
});
