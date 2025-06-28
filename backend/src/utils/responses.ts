import { Request, Response } from 'express';
import { logger } from '../libs';
import { ResponsesOptions } from './types';

export async function SuccessResponses<TData>(req: Request, res: Response, data: TData, options: ResponsesOptions) {

  return res.status(options?.statusCode || 200).json({
    success: true,
    result: data,
    ...(options?.pagination ? { pagination: options.pagination } : {})
  });
}

export function FailureResponses<TError extends Error>(
  req: Request,
  res: Response,
  err: TError,
  options?: ResponsesOptions,
) {
  if (err)
    logger.error(`Error detected! - ${err?.message}`, {
      error: {
        stack: err,
        message: err?.message,
      },
    });
  return res.status(options?.statusCode || 500).json({
    success: false,
    message: err?.message?.trim(),
    ...(options?.errors?.length ? { errors: options.errors } : {}),
  });
}

import { Response as ExpressRes } from 'express';
import { AppError } from './errors';

export class ApiResponse {
  private readonly _res: ExpressRes;

  constructor(res: ExpressRes) {
    this._res = res;
  }

  ok<T>(data: T) {
    return this._res.status(200).json({
      success: true,
      data,
    });
  }

  created<T>(data: T) {
    return this._res.status(201).json({
      success: true,
      data,
    });
  }

  error<T extends AppError>(err: T) {
    return this._res.status(err.statusCode).json({
      success: false,
      message: err.statusCode === 500 ? 'Something went wrong' : err.message,
      errors: err.errors,
      stack: err.stack,
    });
  }
}
