export const JWT_SIGNING_KEY_PROVIDER = Symbol('JWT_SIGNING_KEY_PROVIDER');
export const JWT_VERIFICATION_KEY_PROVIDER = Symbol(
  'JWT_VERIFICATION_KEY_PROVIDER',
);

export type JwtAlgorithm = 'HS256';

export interface JwtSigningKeyProvider {
  getSigningKey(algorithm: JwtAlgorithm): string | Promise<string>;
}

export interface JwtVerificationKeyProvider {
  getVerificationKey(algorithm: JwtAlgorithm): string | Promise<string>;
}
