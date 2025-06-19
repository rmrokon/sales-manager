import { NextFunction, Request, Response } from 'express';
import { ZodError, z } from 'zod';
import { ApiResponse, UnprocessableFields } from '../../utils';

export default function validateRequestBody<T>(schema: z.ZodType<T>) {
  return (req: Request<unknown, unknown, T>, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          path: issue?.path,
          msg: issue.message,
        }));
        new ApiResponse(res).error(new UnprocessableFields('Invalid fields', errors));
      } else {
        next(error);
      }
    }
  };
}
