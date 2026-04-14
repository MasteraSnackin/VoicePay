import { fetch } from "expo/fetch";

export async function fetchWithRetries(url, options = {}, retryOptions = {}) {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    maxDelay = 15000,
    timeout = 10000,
    nullOnStatuses = [],
  } = retryOptions;

  let attempts = 0;
  let currentDelay = delay;

  while (attempts < retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        return response; // Success!
      }

      if (nullOnStatuses.includes(response.status)) {
        console.warn(
          `Request failed with non-retryable status ${response.status}. Returning null.`
        );
        return { result: null };
      }

      console.warn(
        `Request failed with status ${response.status}. Attempting retry ${
          attempts + 1
        }/${retries}...`
      );
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      attempts++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Fetch attempt ${attempts} failed:`, errorMessage);

      if (attempts < retries) {
        console.log(`Retrying in ${currentDelay}ms...`);
        const jitter = 1 + Math.random() * 0.1;
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay = Math.min(currentDelay * backoff * jitter, maxDelay);
      } else {
        throw new Error(
          `Failed to fetch ${url} after ${retries} attempts. Last error: ${errorMessage}`
        );
      }
    }
  }

  return { result: null };
}
