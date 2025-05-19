import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HandleMongoClassErrors } from './mongo-error-class.decorator';

describe('HandleMongoClassErrors', () => {
  @HandleMongoClassErrors()
  class TestRepository {
    async findOne() {
      throw new Error('MongoDB Error');
    }

    async findWithValidationError() {
      const error = new Error('Validation Error') as any;
      error.name = 'ValidationError';
      error.errors = {
        email: { message: 'Invalid email', path: 'email', value: 'invalid' },
      };
      throw error;
    }

    async findWithCastError() {
      const error = new Error('Cast Error') as any;
      error.name = 'CastError';
      error.path = 'age';
      error.value = 'not-a-number';
      throw error;
    }

    async findWithDuplicateKey() {
      const error = new Error('Duplicate Key Error') as any;
      error.name = 'MongoServerError';
      error.code = 11000;
      error.keyValue = { email: 'test@example.com' };
      throw error;
    }

    async findWithUnknownError() {
      const error = new Error('Unknown Error') as any;
      error.name = 'UnknownError';
      throw error;
    }
  }

  let repository: TestRepository;

  beforeEach(() => {
    const DecoratedRepository = HandleMongoClassErrors()(TestRepository);
    repository = new DecoratedRepository();
  });

  it('should handle validation error', async () => {
    await expect(repository.findWithValidationError()).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should handle cast error', async () => {
    await expect(repository.findWithCastError()).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should handle duplicate key error', async () => {
    await expect(repository.findWithDuplicateKey()).rejects.toThrow(
      ConflictException,
    );
  });

  it('should handle unknown error', async () => {
    await expect(repository.findWithUnknownError()).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should handle general MongoDB error', async () => {
    await expect(repository.findOne()).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
