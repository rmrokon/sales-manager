import { Router } from 'express';
import { asyncCatchHandler, isAuthenticated, validateRequestBody } from '../../middlewares';
import { zoneController } from '../bootstrap';
import { ZoneCreationValidationSchema, ZoneUpdateValidationSchema } from './validations';

export const ZoneRouter = Router();

ZoneRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(zoneController.getZones))
  .post(
    [isAuthenticated, validateRequestBody(ZoneCreationValidationSchema)],
    asyncCatchHandler(zoneController.createZone)
  );

ZoneRouter.route('/:zoneId')
  .get([isAuthenticated], asyncCatchHandler(zoneController.getZoneById))
  .patch(
    [isAuthenticated, validateRequestBody(ZoneUpdateValidationSchema)],
    asyncCatchHandler(zoneController.updateZone)
  )
  .delete([isAuthenticated], asyncCatchHandler(zoneController.deleteZone));