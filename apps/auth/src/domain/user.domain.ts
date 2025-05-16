export interface User {
  id: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

export interface DomainEntity<T> {
  toDomain(): T;
}
