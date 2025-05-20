import { HttpStatus } from '@nestjs/common';
import { BaseHttpException } from '@app/common/exceptions/base-http.exception';
import { CommonErrorCodes } from '@app/common/constants/error-codes.enum';

export class EventNotFoundException extends BaseHttpException {
  constructor() {
    super(
      'Event not found',
      HttpStatus.UNPROCESSABLE_ENTITY,
      CommonErrorCodes.EventNotFound.toString(),
    );
  }
}

export class EventCreationFailedException extends BaseHttpException {
  constructor() {
    super(
      'Failed to create event',
      HttpStatus.UNPROCESSABLE_ENTITY,
      CommonErrorCodes.EventCreationFailed.toString(),
    );
  }
}

export class EventUpdateFailedException extends BaseHttpException {
  constructor() {
    super(
      'Failed to update event',
      HttpStatus.UNPROCESSABLE_ENTITY,
      CommonErrorCodes.EventUpdateFailed.toString(),
    );
  }
}

export class EventDeletionFailedException extends BaseHttpException {
  constructor() {
    super(
      'Failed to delete event',
      HttpStatus.UNPROCESSABLE_ENTITY,
      CommonErrorCodes.EventDeletionFailed.toString(),
    );
  }
}

export class RewardNotFoundException extends BaseHttpException {
  constructor() {
    super(
      'Reward not found',
      HttpStatus.UNPROCESSABLE_ENTITY,
      CommonErrorCodes.RewardNotFound.toString(),
    );
  }
}

export class InvalidRewardEventException extends BaseHttpException {
  constructor() {
    super(
      'Reward does not belong to this event',
      HttpStatus.BAD_REQUEST,
      CommonErrorCodes.InvalidRewardEvent.toString(),
    );
  }
}

export class RewardConditionNotMetException extends BaseHttpException {
  constructor() {
    super(
      'Reward conditions not met',
      HttpStatus.FORBIDDEN,
      CommonErrorCodes.RewardConditionNotMet.toString(),
    );
  }
}

export class RewardRequestNotFoundException extends BaseHttpException {
  constructor() {
    super(
      'Reward request not found',
      HttpStatus.UNPROCESSABLE_ENTITY,
      CommonErrorCodes.RewardRequestNotFound.toString(),
    );
  }
}

export class DuplicateRewardRequestException extends BaseHttpException {
  constructor() {
    super(
      'Reward request already in progress',
      HttpStatus.CONFLICT,
      CommonErrorCodes.DuplicateRewardRequest.toString(),
    );
  }
}

export class RewardAlreadyReceivedException extends BaseHttpException {
  constructor() {
    super(
      'Reward already received',
      HttpStatus.CONFLICT,
      CommonErrorCodes.RewardAlreadyReceived.toString(),
    );
  }
}

export class RewardRequestUpdateFailedException extends BaseHttpException {
  constructor() {
    super(
      'Failed to update reward request status',
      HttpStatus.UNPROCESSABLE_ENTITY,
      CommonErrorCodes.RewardRequestUpdateFailed.toString(),
    );
  }
}
