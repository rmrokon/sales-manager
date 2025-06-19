import { Router } from 'express';
import { asyncCatchHandler, isAuthenticated, validateRequestBody } from '../../middlewares';
import { userController } from '../bootstrap';
import { UserBodyValidationSchema } from './validations';

export const UserRouter = Router();

UserRouter.route('/')
  .post([validateRequestBody(UserBodyValidationSchema)], asyncCatchHandler(userController.createUser))

UserRouter.route('/:userId')
  .get([], asyncCatchHandler(userController.getUserWithAllInfo))