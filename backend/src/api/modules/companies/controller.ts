import { Request, Response } from 'express';
import { SuccessResponses } from '../../../utils/responses';
import { ICompanyCreationBody } from './types';
import { ICompanyService } from './service';

export default class CompanyController {
  _service: ICompanyService;

  constructor(service: ICompanyService) {
    this._service = service;
  }

  createCompany = async (req: Request, res: Response) => {
    const body = req.body;
    const company = await this._service.createCompany({...body, user_id: req.auth?.user?.id});
    return SuccessResponses(req, res, company, {
      statusCode: 200,
    });
  };

  getCompanies = async (req: Request, res: Response) => {
    const comapnies = await this._service.find({ user_id: req.auth?.user?.id });
    return SuccessResponses(req, res, comapnies, {
      statusCode: 200,
    });
  };

  updateCompany = async (req: Request, res: Response) => {
    const { companyId } = req.params as { companyId: string };
    const result = await this._service.updateCompany({id: companyId}, req.body);
    return SuccessResponses(req, res, result, {
      statusCode: 200,
    });
  };
}