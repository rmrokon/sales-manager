import { NextFunction, Request, Response } from 'express';
import { ApiResponse, AppError, BadRequest, InternalServerError } from '../../utils';

export default function asyncCatchHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err) => {
      if (err?.name === 'SequelizeUniqueConstraintError') {
        new ApiResponse(res).error(new BadRequest(err?.errors?.[0]?.message));
      } else if (err instanceof AppError) {
        new ApiResponse(res).error(err);
      } else if (err?.name === 'TypeError') {
        new ApiResponse(res).error(new InternalServerError(err?.message));
      } else {
        next(err);
      }
    });
  };
}
