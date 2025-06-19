import { Router } from 'express';
import {
  asyncCatchHandler,
  isAuthenticated,
  validateRequestBody,
} from '../../middlewares';
import { roleController } from '../bootstrap';
import { RoleBodyValidationSchema } from './validations';

export const RoleRouter = Router();

RoleRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(roleController.findRoles))
  .post(
    [isAuthenticated, validateRequestBody(RoleBodyValidationSchema)],
    asyncCatchHandler(roleController.createRole),
  );

RoleRouter.route('/:roleId')
  .patch(
    [isAuthenticated, validateRequestBody(RoleBodyValidationSchema)],
    asyncCatchHandler(roleController.updateRole),
  )
  .delete([isAuthenticated], asyncCatchHandler(roleController.deleteRole));
