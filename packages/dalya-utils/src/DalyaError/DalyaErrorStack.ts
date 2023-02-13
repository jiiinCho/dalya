/**
 * DalyaError class provides a stack trace to debug the error and understand where it was thrown
 */
class DalyaStackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DalyaError';

    // Error.captureStackTrace is a non-standard V8 JavaScript engine (Google Chrome, Node.js). By setting second argument, the error can be removed from stack
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else if (!this.stack) {
      this.stack = new Error(message).stack;
    }
  }
}

export default DalyaStackError;
