// ErrorFactory.ts
import { AppError, BadRequest, NotFound, InternalServerError, UnauthorizedError, UnprocessableFields } from './errors';

export enum ErrorTypes {
    BadRequest = 'BadRequest',
    NotFound = 'NotFound',
    Unauthorized = 'Unauthorized',
    UnprocessableFields = 'UnprocessableFields',
    InternalServerError = 'InternalServerError'
}

export class ErrorFactory {
  static createError(type: ErrorTypes, message: string, errors?: { path: unknown[]; msg: string }[]) {
    switch (type) {
      case 'BadRequest':
        return new BadRequest(message);
      case 'NotFound':
        return new NotFound(message);
      case 'Unauthorized':
        return new UnauthorizedError(message);
      case 'UnprocessableFields':
        return new UnprocessableFields(message, errors || []);
      case 'InternalServerError':
      default:
        return new InternalServerError(message);
    }
  }
}
