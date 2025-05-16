export const JWT_SIGNING_KEY_PROVIDER = Symbol('JWT_SIGNING_KEY_PROVIDER');
export const JWT_VERIFICATION_KEY_PROVIDER = Symbol(
  'JWT_VERIFICATION_KEY_PROVIDER',
);

export type JwtAlgorithm = 'HS256' | 'RS256';

export interface JwtSigningKeyProvider {
  /**
   * JWT 서명에 사용할 키를 반환합니다.
   * - HS256: 시크릿 키 반환
   * - RS256: 개인키 반환
   */
  getSigningKey(algorithm: JwtAlgorithm): string | Promise<string>;
}

export interface JwtVerificationKeyProvider {
  /**
   * JWT 검증에 사용할 키를 반환합니다.
   * - HS256: 시크릿 키 반환
   * - RS256: 공개키 반환
   */
  getVerificationKey(algorithm: JwtAlgorithm): string | Promise<string>;
}
