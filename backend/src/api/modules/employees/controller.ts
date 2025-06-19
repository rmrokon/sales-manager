import { Request, Response } from 'express';
import { SuccessResponses } from '../../../utils/responses';
import { IEmployeeCreationBody } from './types';
import { IEmployeeService } from './service';

export default class EmployeeController {
  _service: IEmployeeService;

  constructor(service: IEmployeeService) {
    this._service = service;
  }

  createEmployee = async (req: Request, res: Response) => {
    const body = req.body as IEmployeeCreationBody;
    const employee = await this._service.createEmployee(body);
    return SuccessResponses(req, res, employee, {
      statusCode: 200,
    });
  };

  updateEmployee = async (req: Request, res: Response) => {
    const { employeeId } = req.params as { employeeId: string };
    const result = await this._service.updateEmployee({id: employeeId}, req.body);
    return SuccessResponses(req, res, result, {
      statusCode: 200,
    });
  };

  // createEmployeeAndAssignToChannel = async (req: Request, res: Response) => {
  //   const body = req.body as IEmployeeCreationBody;
  //   const employee = await this._service.createEmployeeWithChannel(body);
  //   return SuccessResponses(req, res, employee, {
  //     statusCode: 200,
  //   });
  // };
}