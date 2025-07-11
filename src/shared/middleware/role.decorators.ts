import { SetMetadata } from '@nestjs/common';
import { userTypes } from "../schema/user";


export const ROLES_KEY = 'roles';
export const Roles = (...roles: userTypes[]) => SetMetadata(ROLES_KEY, roles);
