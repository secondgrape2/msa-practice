export interface ErrorResponseInterface {
  /** @description HTTP status code indicating the type of error */
  statusCode: number;

  /** @description When the error occurred */
  timestamp: string;

  /** @description Human-readable error message */
  message: string;

  /** @description Unique error code that provides a stable identifier for specific error types.
   * This helps in:
   * 1. Categorizing errors beyond just HTTP status codes
   * 2. Reducing tight coupling with error messages
   * 3. Enabling consistent error handling across different parts of the application
   */
  code?: string;
}
