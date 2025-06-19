import { Request, Response } from 'express';
import { SuccessResponses } from '../../../utils/responses';
import { IPermissionRequestBody } from './types';
import { IPermissionService } from './service';
import { BadRequest } from '../../../utils';

export default class PermissionController {
  _service: IPermissionService;

  constructor(service: IPermissionService) {
    this._service = service;
  }

  findPermissions = async (req: Request, res: Response) => {
    const companies = await this._service.findPermissions({
      company_id: req?.auth?.cid,
    });
    return SuccessResponses(req, res, companies, {
      statusCode: 200,
    });
  };

  createPermission = async (req: Request, res: Response) => {
    const body = req.body as IPermissionRequestBody;
    if (!req?.auth?.cid) throw new BadRequest('Company needs to be selected to create an employee');
    const company = await this._service.createPermission({
      ...body,
    });
    return SuccessResponses(req, res, company, {
      statusCode: 200,
    });
  };

  updatePermission = async (req: Request, res: Response) => {
    const body = req.body as IPermissionRequestBody;
    const { permissionId } = req.params as { permissionId: string };
    if (!req?.auth?.cid) throw new BadRequest('Company needs to be selected to create an employee');
    const company = await this._service.updatePermission(
      { id: permissionId },
      {
        ...body,
      },
    );
    return SuccessResponses(req, res, company, {
      statusCode: 200,
    });
  };

  deletePermission = async (req: Request, res: Response) => {
    const { permissionId } = req.params as { permissionId: string };
    if (!req?.auth?.cid) throw new BadRequest('Company needs to be selected to create an employee');
    const company = await this._service.deletePermission({
      id: permissionId,
    });
    return SuccessResponses(req, res, company, {
      statusCode: 200,
    });
  };
}
