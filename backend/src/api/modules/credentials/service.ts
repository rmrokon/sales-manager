/* eslint-disable @typescript-eslint/ban-ts-comment */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AccessModules, BadRequest, DefaultRoles, IDataValues, InternalServerError, Permissions } from '../../../utils';
import { BaseRepository } from '../baseRepo';
import {
  companyService,
  employeeService,
  permissionService,
  roleService,
  userService,
} from '../bootstrap';
import { ICredential, ICredentialRequestBody, ICredentialTokenPayload, ILoginCredentialRequestBody } from './types';
import { sequelize } from '../../../configs';
import { Transaction } from '@sequelize/core';
import { logger, redisClient } from '../../../libs';
import { IUser } from '../users/types';
import { ICompany } from '../companies/types';
import { IEmployee } from '../employees/types';
import Role from '../roles/model';
import { IPermission } from '../permissions/types';
import Permission from '../permissions/model';
import User from '../users/model';
import Employee from '../employees/model';
import { IRole } from '../roles/types';
import Company from '../companies/model';

export interface ICredentialService {
  createCredential(args:  ICredentialRequestBody & (ICompany | IEmployee) ): Promise<ICompany | IEmployee>;
  verifyCredential(args: ILoginCredentialRequestBody): Promise<{
    accessToken: string;
    refreshToken: string;
    user: IDataValues<IUser>;
    company?: Company;
    employeeId?: string;
    roles: Role[] | undefined;
    permissions: (Permission | undefined)[]
  }>;
  refreshCredential(args: Pick<ILoginCredentialRequestBody, 'email'>): Promise<{
    accessToken: string;
    refreshToken: string;
    user: IDataValues<IUser>;
    company?: Company;
    employeeId?: string;
    roles: Role[] | undefined;
    permissions: (Permission | undefined)[]
  }>;
}

export default class CredentialService implements ICredentialService {
  _repo: BaseRepository<Partial<ICredential & { user_id: string }>>;

  constructor(repo: BaseRepository<Partial<ICredential & { user_id: string }>>) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<ICredential>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async hashPassword(pass: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pass, salt);
  }

  async verifyPassword(pass: string, hash: string) {
    return bcrypt.compare(pass, hash);
  }

  async createTokens(args: { payload: ICredentialTokenPayload; secret: string }) {
    const accessToken = jwt.sign(args.payload, process.env.JWT_SECRET! + args.secret, {
      expiresIn: 5 * 60 * 1000,
    });
    const refreshToken = jwt.sign({ uid: args.payload.user.id }, process.env.JWT_SECRET! + args.secret, {
      expiresIn: 24 * 60 * 60 * 1000,
    });
    await redisClient.del(args.payload.user.id!);
    await redisClient.set(args.payload.user.id!, JSON.stringify(args.payload));
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string, secret: string) {
    return jwt.verify(token, process.env.JWT_SECRET! + secret);
  }

  async getCredentialByUser(args: { userId: string }, options?: { t: Transaction }) {
    const credential = await this._repo.findOne({ user_id: args.userId }, options);
    return credential as IDataValues<ICredential>;
  }


  async createCredential(
    body: ICredentialRequestBody & (ICompany | IEmployee),
  ) {
    const t = await sequelize.startUnmanagedTransaction();
    try {
      const existingUser = await userService.findUserByRaw({email: body?.email!});
      if (!!existingUser) throw new BadRequest('User with same email address already exists!');
      let user;
      let newCompany;
      let employee;
      let role;
      if (!existingUser) {
        user = await userService.createUserRaw(
          {
            email: body?.email
          },
          { t },
        );
        if (body?.type === 'company') {
          const { name, logo, } = body as ICompany;
          newCompany = await companyService.createCompany({
            name,
            logo,
            default: true,
            user_id: user?.dataValues?.id
          }, { t })
          console.dir(newCompany, {depth: 5});
          role = await roleService.createRoleRaw(
            {
              name: DefaultRoles.Admin,
              user_id: user?.dataValues?.id
            },
            { t },
          );
        }
        if(body?.type === 'employee'){
          const {firstName, lastName, image} = body as IEmployee;
          employee = await employeeService.createEmployee({
            firstName, 
            lastName, 
            image,
            user_id: user?.dataValues?.id
          }, { t });

          role = await roleService.createRoleRaw(
            {
              name: DefaultRoles.Employee,
              user_id: user?.dataValues?.id
            },
            { t },
          );
        }
      }

      const hashPassword = await this.hashPassword(body.password);
      await this._repo.create(
        {
          password: hashPassword,
          user_id: user!.dataValues.id,
        },
        { t },
      );
      
      const allPermissions = await permissionService.findPermissions({});
      logger.log('info', {message: 'got permissions'});
      let companyPermissions: Partial<Permission>[] = [];
      let employeePermissions: Partial<Permission>[] = [];
      if (body?.type === 'company') {
        companyPermissions = allPermissions?.filter((per) =>
          per.name !== Permissions.CreateVideo 
        );
      }
      if (body?.type === 'employee') {
        let filteredModulePermissions = allPermissions.filter(permission => {
          ['company', 'channel', 'payment', 'employee', 'role'].some((item)=>
            !permission.name.toLowerCase().includes(item)
          )
        })
        employeePermissions = filteredModulePermissions?.filter((per) =>
          per.name !== Permissions.YoutubeUpload
        );
      }
      console.info({role});
      await role?.setPermissions(role?.name === DefaultRoles.Employee ? Permission.bulkBuild(employeePermissions) as Permission[] : Permission.bulkBuild(companyPermissions) as Permission[], {
        transaction: t,
      });
      await t.commit();
      return body?.type === 'company' ? newCompany! : employee!;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async verifyCredential(args: ILoginCredentialRequestBody) {
    const t = await sequelize.startUnmanagedTransaction();
    try {
      const user = await userService.findUserByRaw({ email: args.email }, { t });
      if (!user) throw new BadRequest('User not found!');
      const roles = await (user as User)?.getRoles?.();
      let companies;
      let employee;
      if(roles?.map((role) => role.name).includes(DefaultRoles.Admin)){
        companies = await (user as User).getCompanies!();
      }
      if(roles?.map((role) => role.name).includes(DefaultRoles.Employee)){
        employee = await (user as User).getEmployee!();
      }
      const credential = await (user as User).getCredential?.();
      const isPasswordValid = await this.verifyPassword(args.password, credential!.dataValues.password);
      if (!isPasswordValid) throw new BadRequest('Invalid credentials');
      const permissionsPromises = await Promise.allSettled(
        roles!.map(async (role) => (await role.getPermissions())),
      );
      const permissions = permissionsPromises
        .filter((item) => item.status === 'fulfilled')
        .map((item) => item.value)
        .flat();
        const defaultCompany = companies?.find(com => com.default);
        const tokens = await this.createTokens({
          payload: {
            uid: user?.dataValues.id!,
            cid: defaultCompany?.id!,
            user: user?.dataValues,
            roles,
            permissions: permissions,
            company: defaultCompany,
            employeeId: employee?.id!,
          },
          secret: credential?.dataValues.password,
        });
        await t.commit();
        return roles?.map((role) => role.name).includes(DefaultRoles.Employee) ? 
        { 
          ...tokens, 
          user, 
          roles, 
          permissions, 
          employeeId: employee?.id
        }
        :
        { 
          ...tokens, 
          user, 
          roles, 
          permissions, 
          company: defaultCompany, 
        }
    } catch (err) {
      await t.rollback();
      return Promise.reject(err);
    }
  }

  // async fetchUserRolesAndPermissions(user: IDataValues<IUser>) {
  //   // Fetch role & permissions
  //   // @ts-ignore
  //   const rolesDbRes = await user.getRoles();
  //   // @ts-ignore
  //   const permissionsDbRes = await Promise.all(rolesDbRes?.map((role) => role.getPermissions()));
  //   // @ts-ignore
  //   const roles = rolesDbRes?.map((item) => ({ id: item?.dataValues?.id, name: item?.dataValues?.name }));
  //   const permissions = permissionsDbRes
  //     ?.flat()
  //     ?.map((item) => ({ id: item?.dataValues?.id, name: item?.dataValues?.name }));
  //   return { roles, permissions };
  // }


  async refreshCredential(args: Pick<ILoginCredentialRequestBody, 'email'>) {
    const t = await sequelize.startUnmanagedTransaction();
    try {
      const user = await userService.findUserByRaw({ email: args.email });
      const redisRecord = await redisClient.get(user?.dataValues?.id!);
      const parsedData = JSON.parse(redisRecord ?? '{}');
      const credential = await (user as User).getCredential?.();
      const company = parsedData?.company as Company;
      const roles = await (user as User).getRoles?.();
      const permissionsPromises = await Promise.allSettled(
        roles!.map((role) => (role as Role).getPermissions?.()),
      );
      const permissions = permissionsPromises
        .filter((item) => item.status === 'fulfilled')
        .map((item) => item.value)
        .flat();
        let employee = null;
        if(roles?.map((role) => role.name).includes(DefaultRoles.Employee)){
          employee = await (user as User).getEmployee!();
        }
      await t.commit();
      const tokens = await this.createTokens({
        payload: {
          uid: user?.dataValues.id!,
          cid: company?.id,
          user: user?.dataValues,
          roles,
          permissions: permissions,
          company: company,
          employeeId: employee!.id!,
        },
        secret: credential?.dataValues.password,
      });
      return roles?.map((role) => role.name).includes(DefaultRoles.Employee) ? 
      { 
        ...tokens, 
        user, 
        roles, 
        permissions, 
        employeeId: employee?.id
       }
       :
       { 
        ...tokens, 
        user, 
        roles, 
        permissions, 
        company, 
       }
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}
