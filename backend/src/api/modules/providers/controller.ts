import { Request, Response } from 'express';
import { SuccessResponses } from '../../../utils/responses';
import { IProviderRequestBody } from './types';
import { IProviderService } from './service';
import { BadRequest } from '../../../utils';

export default class ProviderController {
  _service: IProviderService;

  constructor(service: IProviderService) {
    this._service = service;
  }

  findProviders = async (req: Request, res: Response) => {
    const companies = await this._service.findProviders({
      company_id: req?.auth?.cid,
    });
    return SuccessResponses(req, res, companies, {
      statusCode: 200,
    });
  };

  createProvider = async (req: Request, res: Response) => {
    const body = req.body as IProviderRequestBody;
    if (!req?.auth?.cid) throw new BadRequest('Company needs to be selected to create an employee');
    const company = await this._service.createProvider({
      ...body,
    });
    return SuccessResponses(req, res, company, {
      statusCode: 200,
    });
  };

  updateProvider = async (req: Request, res: Response) => {
    const body = req.body as IProviderRequestBody;
    const { providerId } = req.params as { providerId: string };
    if (!req?.auth?.cid) throw new BadRequest('Company needs to be selected to create an employee');
    const company = await this._service.updateProvider(
      { id: providerId },
      {
        ...body,
      },
    );
    return SuccessResponses(req, res, company, {
      statusCode: 200,
    });
  };

  deleteProvider = async (req: Request, res: Response) => {
    const { providerId } = req.params as { providerId: string };
    if (!req?.auth?.cid) throw new BadRequest('Company needs to be selected to create an employee');
    const company = await this._service.deleteProvider({
      id: providerId,
    });
    return SuccessResponses(req, res, company, {
      statusCode: 200,
    });
  };
}
