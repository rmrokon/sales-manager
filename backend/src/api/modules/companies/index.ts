import { Router } from 'express';
import { asyncCatchHandler, isAuthenticated, validateRequestBody } from '../../middlewares';
import { companyController } from '../bootstrap';
import { CompanyCreationValidationSchema } from './validations';

export const CompanyRouter = Router();

CompanyRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(companyController.getCompanies))
  .post([isAuthenticated, validateRequestBody(CompanyCreationValidationSchema)], asyncCatchHandler(companyController.createCompany));

