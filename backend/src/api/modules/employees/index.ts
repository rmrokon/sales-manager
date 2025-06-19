import { Router } from 'express';
import { asyncCatchHandler, isAuthenticated, validateRequestBody } from '../../middlewares';
import { employeeController } from '../bootstrap';
import { EmployeeCreationValidationSchema } from './validations';

export const EmployeeRouter = Router();

EmployeeRouter.route('/')
  .post([], asyncCatchHandler(employeeController.createEmployee));

// EmployeeRouter.route('/channels')
//   .post([validateRequestBody(EmployeeCreationValidationSchema)], asyncCatchHandler(employeeController.createEmployeeAndAssignToChannel));

