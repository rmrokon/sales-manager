import { NextFunction, Request, Response } from 'express';
import { ApiResponse, InternalServerError, UnauthorizedError } from '../../utils';
import jwt from 'jsonwebtoken';
import { credentialService, userService } from '../modules/bootstrap';
import { redisClient } from '../../libs';
import { ICredentialTokenPayload } from '../modules/credentials/types';

export default async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const accessToken = req.headers?.authorization?.split(' ')[1];
    if (!accessToken) throw new Error('Unauthorized!');
    
    const decodedToken = jwt.decode(accessToken) as { uid: string };
    if (!decodedToken?.uid) throw new Error('Unauthorized!');
    
    const user = await userService.findUserById(decodedToken.uid);
    if (!user?.id) throw new Error('Unauthorized!');
    
    const credential = await credentialService.getCredentialByUser({ userId: user.id });
    if (!credential?.dataValues?.id) throw new Error('Unauthorized!');
    
    const { uid } = (await credentialService.verifyAccessToken(
      accessToken,
      credential.dataValues.password
    )) as { uid: string };
    if (!uid) throw new Error('Unauthorized!');
    
    const jsonUserData = await redisClient.get(uid);
    if (!jsonUserData) throw new Error('Unauthorized!');
    
    req.auth = JSON.parse(jsonUserData ?? '{}') as ICredentialTokenPayload;
    next();
  } catch (err) {
    if (err instanceof Error) {
      new ApiResponse(res).error(new UnauthorizedError(err.message));
    } else {
      new ApiResponse(res).error(new InternalServerError('Something went wrong'));
    }
  }
}
