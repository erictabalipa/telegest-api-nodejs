import { Request } from 'express';
import { client } from '../../database/connect';

export class Permission {
  constructor() {}

  async userHasPermission(request: Request, code: string): Promise<boolean> {
    const user = await client.user.findFirst({
      where: {
        PermissionToUser: {
          some: {
            user: {
              id: request.userId,
            },
            permission: {
              code,
            },
          },
        },
      },
    });

    return !user;
  }
}
