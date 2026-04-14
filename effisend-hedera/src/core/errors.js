/**
 * Custom error hierarchy for EffiSend Hedera.
 * Provides typed errors with codes, categories, and user-friendly messages.
 */

// Base application error
export class AppError extends Error {
  constructor(message, { code = "UNKNOWN", userMessage, details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.userMessage = userMessage || message;
    this.details = details || {};
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// Network / connectivity errors
export class NetworkError extends AppError {
  constructor(message = "Network request failed", details) {
    super(message, {
      code: "NETWORK_ERROR",
      userMessage: "Connection failed. Check your internet and try again.",
      details,
    });
  }
}

// API returned an error response
export class ApiError extends AppError {
  constructor(message, { status, endpoint, ...rest } = {}) {
    super(message, {
      code: `API_ERROR_${status || "UNKNOWN"}`,
      userMessage: status === 429
        ? "Too many requests. Please wait a moment."
        : status >= 500
          ? "Server error. Please try again later."
          : "Request failed. Please try again.",
      details: { status, endpoint, ...rest },
    });
    this.status = status;
  }
}

// Validation errors (user input)
export class ValidationError extends AppError {
  constructor(message, { field, ...rest } = {}) {
    super(message, {
      code: "VALIDATION_ERROR",
      userMessage: message,
      details: { field, ...rest },
    });
  }
}

// Authentication / biometric errors
export class AuthError extends AppError {
  constructor(message = "Authentication failed", details) {
    super(message, {
      code: "AUTH_ERROR",
      userMessage: "Authentication failed. Please try again.",
      details,
    });
  }
}

// Blockchain / Hedera transaction errors
export class TransactionError extends AppError {
  constructor(message, { hash, accountId, ...rest } = {}) {
    super(message, {
      code: "TRANSACTION_ERROR",
      userMessage: "Transaction failed. Please try again.",
      details: { hash, accountId, ...rest },
    });
  }
}

// --- Result type for explicit error handling ---

export function Ok(value) {
  return { ok: true, value, error: null };
}

export function Err(error) {
  return { ok: false, value: null, error };
}

/**
 * Wrap an async function in a Result type.
 * Returns { ok: true, value } on success, { ok: false, error } on failure.
 */
export async function trySafe(fn) {
  try {
    const value = await fn();
    return Ok(value);
  } catch (error) {
    return Err(error instanceof AppError ? error : new AppError(error.message));
  }
}

/**
 * Graceful degradation: try primary, fall back to fallback.
 */
export async function withFallback(primary, fallback, { silent = false } = {}) {
  try {
    return await primary();
  } catch (error) {
    if (!silent) {
      console.warn(`Primary failed, using fallback: ${error.message}`);
    }
    return await fallback();
  }
}

/**
 * Get a user-friendly error message from any error.
 */
export function getUserMessage(error) {
  if (error instanceof AppError) {
    return error.userMessage;
  }
  if (error?.message?.includes("Network request failed")) {
    return "Connection failed. Check your internet.";
  }
  if (error?.message?.includes("timeout")) {
    return "Request timed out. Please try again.";
  }
  return "Something went wrong. Please try again.";
}
