export interface User {
  id: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface SignUpDto {
  email: string;
  password: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface AuthService {
  signUp(signUpDto: SignUpDto): Promise<User>;
  signIn(signInDto: SignInDto): Promise<AuthResponse>;
  validateUser(email: string, password: string): Promise<User>;
  refreshToken(
    refresh_token: string,
  ): Promise<{ access_token: string; user: User }>;
}
