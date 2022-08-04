import { Prisma } from '@prisma/client';
import { client } from '../connect';

export class UserRepository {
  findAll() {
    return client.user.findMany();
  }
  findById(id: number) {
    return client.user.findFirst({
      where: {
        id,
      },
      include: {
        PermissionToUser: {
          include: {
            permission: true,
          },
        },
        instalation: {
          include: {
            _count: true,
            InsatallationHasUsableObject: true,
            lamp: {
              include: {
                _count: true,
                GroupHasLamp: true,
                LampHasMaintenance: true,
                Statuse: true,
                lampLocation: true,
                lampModel: true,
              },
            },
          },
        },
      },
    });
  }
  findByEmail(email: string) {
    return client.user.findFirst({
      where: {
        email,
      },
    });
  }
  delete(id: number) {
    return client.user.delete({
      where: {
        id,
      },
    });
  }
  edit(data: Prisma.UserUpdateArgs) {
    return client.user.update(data);
  }
  save(args: Prisma.UserCreateArgs) {
    return client.user.create(args);
  }
}
