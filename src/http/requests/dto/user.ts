import { PermissionToUser } from '@prisma/client';

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  permissions: PermissionToUser[];
};
