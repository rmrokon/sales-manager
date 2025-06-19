import { Router } from 'express';
import {
  asyncCatchHandler,
  isAuthenticated,
  validateRequestBody,
} from '../../middlewares';
import { credentialController } from '../bootstrap';
import {
  CredentialBodyValidationSchema,
  LoginCredentialBodyValidationSchema,
  SwitchCompanyBodyValidationSchema,
} from './validations';

export const CredentialRouter = Router();

CredentialRouter.route('/').post(
  [validateRequestBody(CredentialBodyValidationSchema)],
  asyncCatchHandler(credentialController.createCredential),
);

CredentialRouter.route('/login').post(
  [validateRequestBody(LoginCredentialBodyValidationSchema)],
  asyncCatchHandler(credentialController.loginCredential),
);

CredentialRouter.route('/me')
  .get([isAuthenticated], asyncCatchHandler(credentialController.getMe))
  .post([isAuthenticated], asyncCatchHandler(credentialController.refreshCredential))
  .delete([isAuthenticated], asyncCatchHandler(credentialController.logout));

CredentialRouter.route('/switch-company').post(
  [validateRequestBody(SwitchCompanyBodyValidationSchema), isAuthenticated],
  asyncCatchHandler(credentialController.switchCompany),
);
