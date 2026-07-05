const RETRYABLE_CODES = new Set([
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_SOCKET',
  'ECONNREFUSED',
  'ECONNRESET',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ETIMEDOUT',
]);

const RETRY_DELAYS_MS = [500, 1500];

function getErrorCode(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const withCode = error as Error & { code?: string };

  if (typeof withCode.code === 'string') {
    return withCode.code;
  }

  if (error.cause) {
    return getErrorCode(error.cause);
  }

  return null;
}

function isRetryableNetworkError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code !== null && RETRYABLE_CODES.has(code);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * A fetch wrapper for server-side Supabase clients that retries connection-level
 * failures (connect timeout, DNS failure, refused/reset before the request was
 * sent). These happen before any bytes reach the server, so retrying is safe for
 * every HTTP method.
 */
export async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;

      if (!isRetryableNetworkError(error) || attempt === RETRY_DELAYS_MS.length) {
        break;
      }

      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  if (isRetryableNetworkError(lastError)) {
    throw new Error(
      'Could not reach Supabase (connection failed after retries). Check your internet connection and try again.',
      { cause: lastError },
    );
  }

  throw lastError;
}
