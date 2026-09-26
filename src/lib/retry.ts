/**
 * Utility for executing asynchronous tasks with exponential backoff retries.
 * Ideal for database queries or external API calls that may experience transient failures.
 */

export interface RetryOptions {
  retries?: number; // Number of attempts before giving up (default: 3)
  delayMs?: number; // Starting delay in ms (default: 300ms)
  backoffFactor?: number; // Multiply delay by this on each failure (default: 2)
  shouldRetry?: (error: any) => boolean; // Filter which errors to retry
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    delayMs = 300,
    backoffFactor = 2,
    shouldRetry = () => true,
  } = options;

  let attempt = 0;
  let currentDelay = delayMs;

  while (true) {
    attempt++;
    try {
      return await fn();
    } catch (error: any) {
      const isLastAttempt = attempt >= retries;
      
      // Stop retrying if exhausted or error shouldn't be retried
      if (isLastAttempt || !shouldRetry(error)) {
        throw error;
      }

      console.warn(
        `[Retry Warning] Attempt ${attempt} failed: ${error.message || error}. Retrying in ${currentDelay}ms...`
      );

      // Wait before the next attempt
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= backoffFactor;
    }
  }
}
