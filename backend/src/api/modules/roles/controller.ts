import { Request, Response } from 'express';
import { SuccessResponses } from '../../../utils/responses';
import { IRoleRequestBody } from './types';
import { IRoleService } from './service';
import { BadRequest } from '../../../utils';

export default class RoleController {
  _service: IRoleService;

  constructor(service: IRoleService) {
    this._service = service;
  }

  findRoles = async (req: Request, res: Response) => {
    const companies = await this._service.findRoles({
      company_id: req?.auth?.cid,
    });
    return SuccessResponses(req, res, companies, {
      statusCode: 200,
    });
  };

  createRole = async (req: Request, res: Response) => {
    const body = req.body as IRoleRequestBody;
    if (!req?.auth?.cid) throw new BadRequest('Company needs to be selected to create an employee');
    const company = await this._service.createRole({
      ...body,
    });
    return SuccessResponses(req, res, company, {
      statusCode: 200,
    });
  };

  updateRole = async (req: Request, res: Response) => {
    const body = req.body as IRoleRequestBody;
    const { roleId } = req.params as { roleId: string };
    if (!req?.auth?.cid) throw new BadRequest('Company needs to be selected to create an employee');
    const company = await this._service.updateRole(
      { id: roleId },
      {
        ...body,
      },
    );
    return SuccessResponses(req, res, company, {
      statusCode: 200,
    });
  };

  deleteRole = async (req: Request, res: Response) => {
    const { roleId } = req.params as { roleId: string };
    if (!req?.auth?.cid) throw new BadRequest('Company needs to be selected to create an employee');
    const company = await this._service.deleteRole({
      id: roleId,
    });
    return SuccessResponses(req, res, company, {
      statusCode: 200,
    });
  };
}
