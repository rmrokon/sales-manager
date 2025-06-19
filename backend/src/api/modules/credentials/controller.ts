import { CookieOptions, Request, Response } from 'express';
import { SuccessResponses } from '../../../utils/responses';
import { ICredentialRequestBody, ILoginCredentialRequestBody } from './types';
import { ICredentialService } from './service';
import { redisClient } from '../../../libs';
import { companyService } from '../bootstrap';
import { ICompany } from '../companies/types';
import { IEmployee } from '../employees/types';

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
};

export default class CredentialController {
  _service: ICredentialService;

  constructor(service: ICredentialService) {
    this._service = service;
  }

  createCredential = async (req: Request, res: Response) => {
    const body = req.body as ICredentialRequestBody & (ICompany | IEmployee);
    const credential = await this._service.createCredential(body);
    return SuccessResponses(req, res, credential, {
      statusCode: 200,
    });
  };

  loginCredential = async (req: Request, res: Response) => {
    const body = req.body as ILoginCredentialRequestBody;
    const result = await this._service.verifyCredential(body);
    // await this.setAccessRefreshTokenInCookie({ ...result, res });
    return SuccessResponses(req, res, result, {
      statusCode: 200,
    });
  };

  refreshCredential = async (req: Request, res: Response) => {
    const body = req.body as Pick<ILoginCredentialRequestBody, 'email'>;
    body.email = req.auth!.user.email;
    let result = null;
    if (req.auth) {
      result = await this._service.refreshCredential({ ...body });
      await this.setAccessRefreshTokenInCookie({ ...result, res });
    }
    return SuccessResponses(req, res, result, {
      statusCode: 200,
    });
  };

  async setAccessRefreshTokenInCookie({
    res,
    accessToken,
    refreshToken,
  }: {
    res: Response;
    accessToken: string;
    refreshToken: string;
  }) {
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 5 * 60 * 1000),
      maxAge: 5 * 60 * 1000,
      ...(process.env.NODE_ENV === 'production' ? { secure: true } : {}),
    });
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  logout = async (req: Request, res: Response) => {
    // await this.setAccessRefreshTokenInCookie({ accessToken: '', refreshToken: '', res });
    redisClient.del(req.auth!.user.id!);
    return SuccessResponses(
      req,
      res,
      {},
      {
        statusCode: 200,
      },
    );
  };

  getMe = async (req: Request, res: Response) => {
    return SuccessResponses(
      req,
      res,
      {
        user: req.auth?.user,
        roles: req.auth?.roles,
        permissions: req.auth?.permissions,
        company: req.auth?.company,
        employeeId: req.auth?.employeeId,
      },
      {
        statusCode: 200,
      },
    );
  };

  switchCompany = async (req: Request, res: Response) => {
    const uid = req.auth!.user.id!;
    const { companyId } = req.body;
    const company = await companyService.findCompanyById(companyId);
    const redisRecord = await redisClient.get(uid);
    const parsedData = JSON.parse(redisRecord ?? '{}');
    const updatedData = { ...parsedData, company, cid: companyId };
    await redisClient.del(uid);
    await redisClient.set(uid, JSON.stringify(updatedData));
    return SuccessResponses(
      req,
      res,
      { success: true },
      {
        statusCode: 200,
      },
    );
  };
}
