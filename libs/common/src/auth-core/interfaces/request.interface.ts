import { Request as ExpressRequest } from 'express';
import { Role } from '../constants/role.constants';

export interface RequestWithUser extends ExpressRequest {
  user: {
    id: string;
    roles: Role[];
  };
}
