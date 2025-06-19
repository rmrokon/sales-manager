import {NextFunction, Request, Response} from 'express';
import { AsyncLocalStorage } from 'async_hooks';
import { ICredentialTokenPayload } from '../modules/credentials/types';
import jwt from 'jsonwebtoken';
import { credentialService, userService } from '../modules/bootstrap';
import { redisClient } from '../../libs';

interface IGlobalReqStore {
    auth: ICredentialTokenPayload
}

export const globalReqStore = new AsyncLocalStorage<IGlobalReqStore>();

export async function GlobalReqStore(req:Request, res: Response, next: NextFunction){
    const auth = await insertAuthInReq(req).catch(()=>undefined);
    return globalReqStore.run(
        {
            auth
        },
        next
    )
}

async function insertAuthInReq(req:Request){
    const accessToken = req.cookies.accessToken;
    if (!accessToken) throw new Error('Unauthorized!');
    const decodedToken = jwt.decode(accessToken) as { uid: string };
    if (!decodedToken.uid) throw new Error('Unauthorized!');
    const user = await userService.findUserById(decodedToken.uid);
    if (!user?.id) throw new Error('Unauthorized!');
    const credential = await credentialService.getCredentialByUser({ userId: user.id });
    if (!credential?.dataValues?.id) throw new Error('Unauthorized!');

    const { uid } = (await credentialService.verifyAccessToken(accessToken, credential?.dataValues?.password)) as {
      uid: string;
    };
    if (!uid) throw new Error('Unauthorized!');
    const jsonUserData = await redisClient.get(uid);
    const parsedData = JSON.parse(jsonUserData ?? '');
    if (!jsonUserData) throw new Error('Unauthorized!');
    return parsedData;
}