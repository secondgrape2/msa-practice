import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, Controller, Get } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLE } from '../constants/role.constants';
import { Roles } from '../decorators/roles.decorator';

@Controller('test')
class TestController {
  @Get('public')
  publicRoute() {
    return 'public';
  }

  @Get('user')
  @Roles(ROLE.USER)
  userRoute() {
    return 'user';
  }

  @Get('admin')
  @Roles(ROLE.ADMIN)
  adminRoute() {
    return 'admin';
  }

  @Get('multi-role')
  @Roles(ROLE.USER, ROLE.ADMIN)
  multiRoleRoute() {
    return 'multi-role';
  }
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let module: TestingModule;
  let controller: TestController;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [TestController],
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    controller = module.get<TestController>(TestController);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        user: {
          roles: [ROLE.USER],
        },
      };

      mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: () => controller.publicRoute,
        getClass: () => TestController,
      } as unknown as ExecutionContext;
    });

    it('should allow access to public route', () => {
      mockContext.getHandler = () => controller.publicRoute;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      mockContext.getHandler = () => controller.userRoute;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      mockContext.getHandler = () => controller.adminRoute;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(false);
    });

    it('should deny access when user is not authenticated', () => {
      mockContext.getHandler = () => controller.userRoute;
      mockRequest.user = null;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(false);
    });

    it('should deny access when user has no roles', () => {
      mockContext.getHandler = () => controller.userRoute;
      mockRequest.user = {};

      const result = guard.canActivate(mockContext);
      expect(result).toBe(false);
    });

    it('should allow access when user has one of the required roles', () => {
      mockContext.getHandler = () => controller.multiRoleRoute;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow access when user has all required roles', () => {
      mockContext.getHandler = () => controller.multiRoleRoute;
      mockRequest.user.roles = [ROLE.USER, ROLE.ADMIN];

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });
});
