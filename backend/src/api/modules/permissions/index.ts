import { Router } from 'express';
import {
  asyncCatchHandler,
  isAuthenticated,
  validateRequestBody,
} from '../../middlewares';
import { permissionController } from '../bootstrap';
import { PermissionBodyValidationSchema } from './validations';

export const PermissionRouter = Router();

PermissionRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(permissionController.findPermissions))
  .post(
    [isAuthenticated, validateRequestBody(PermissionBodyValidationSchema)],
    asyncCatchHandler(permissionController.createPermission),
  );

PermissionRouter.route('/:permissionId')
  .patch(
    [isAuthenticated, validateRequestBody(PermissionBodyValidationSchema)],
    asyncCatchHandler(permissionController.updatePermission),
  )
  .delete(
    [isAuthenticated],
    asyncCatchHandler(permissionController.deletePermission),
  );
