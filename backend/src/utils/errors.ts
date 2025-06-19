export class AppError extends Error {
    readonly statusCode: number;
    errors: { path: unknown[]; msg: string }[] = [];
  
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class BadRequest extends AppError {
    constructor(message: string) {
      super(message, 400);
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class NotFound extends AppError {
    constructor(message: string) {
      super(message, 404);
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class InternalServerError extends AppError {
    constructor(message: string) {
      super(message, 500);
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class UnauthorizedError extends AppError {
    constructor(message: string) {
      super(message, 401);
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class UnprocessableFields extends AppError {
    constructor(message: string, errors: { path: unknown[]; msg: string }[]) {
      super(message, 422);
      this.errors = errors;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  