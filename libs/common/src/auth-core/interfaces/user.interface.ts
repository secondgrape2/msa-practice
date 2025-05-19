import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  roles: string[];
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
