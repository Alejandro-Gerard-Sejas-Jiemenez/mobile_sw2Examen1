/**
 * Base Application Error class with code and context
 */
export abstract class AppError extends Error {
  public abstract readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
