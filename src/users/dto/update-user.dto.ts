import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto {
    name?: string;
    token: string;
    oldPassword?: string;
    newPassword?: string;
}
