import { roleService } from '../api/modules/bootstrap';
import Permission from '../api/modules/permissions/model';
import { AccessModules, DefaultRoles, Permissions } from '../utils';

export async function addDefaultRolesAndPermissions() {
    await Promise.allSettled(
        Object.values(Permissions).map(async (pm:string)=>{
            await Permission.upsert({
                name: pm,
              });
        })
      );
}
