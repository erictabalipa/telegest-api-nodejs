import { Prisma } from '@prisma/client';
import { client } from '../connect';

export class PermissionRepository {
  findAll() {
    return client.permission.findMany();
  }
  addToUser(id: number, userId: number) {
    return client.permissionToUser.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        permission: {
          connect: {
            id,
          },
        },
      },
    });
  }
  findByCode(code: string) {
    return client.permission.findFirst({
      where: {
        code,
      },
    });
  }
  save(args: Prisma.PermissionCreateArgs) {
    return client.permission.create(args);
  }
}
