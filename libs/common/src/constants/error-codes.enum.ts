export enum CommonErrorCodes {
  /**
   * Common errors (1000 - 1099)
   */
  UserNotFound = 1000,
  UserInvalidPassword = 1001,
  UserAlreadyExists = 1002,
  InvalidRefreshToken = 1003,
  InvalidPasswordFormat = 1004,

  /**
   * Event related errors (1100 - 1199)
   */
  EventNotFound = 1100,
  EventCreationFailed = 1101,
  EventUpdateFailed = 1102,
  EventDeletionFailed = 1103,

  /**
   * Reward related errors (1200 - 1299)
   */
  RewardNotFound = 1200,
  InvalidRewardEvent = 1201,
  RewardConditionNotMet = 1202,

  /**
   * Reward request related errors (1300 - 1399)
   */
  RewardRequestNotFound = 1300,
  DuplicateRewardRequest = 1301,
  RewardAlreadyReceived = 1302,
  RewardRequestUpdateFailed = 1303,

  /**
   * System errors (9900 - 9999)
   */
  ServiceUnavailable = 9900,
  InternalServerError = 9901,
  UnknownError = 9902,
  UpdateFailed = 9903,
  InvalidUserAgent = 9904,
  InvalidField = 9905,
}
