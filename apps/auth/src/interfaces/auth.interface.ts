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
  signIn(signInDto: SignInDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: User;
  }>;
  validateUser(email: string, password: string): Promise<User>;
  refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; user: User }>;
}
