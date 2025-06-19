import { Router } from 'express';
import {
  asyncCatchHandler,
  isAuthenticated,
  validateRequestBody,
} from '../../middlewares';
import { providerController } from '../bootstrap';
import { ProviderBodyValidationSchema } from './validations';

export const ProviderRouter = Router();

ProviderRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(providerController.findProviders))
  .post(
    [isAuthenticated, validateRequestBody(ProviderBodyValidationSchema)],
    asyncCatchHandler(providerController.createProvider),
  );

ProviderRouter.route('/:providerId')
  .patch(
    [isAuthenticated, validateRequestBody(ProviderBodyValidationSchema)],
    asyncCatchHandler(providerController.updateProvider),
  )
  .delete(
    [isAuthenticated],
    asyncCatchHandler(providerController.deleteProvider),
  );
