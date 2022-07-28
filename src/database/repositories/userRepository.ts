import { Prisma } from '@prisma/client';
import { client } from '../connect';

export class UserRepository {
  findByEmail(email: string) {
    return client.user.findFirst({
      where: {
        email,
      },
    });
  }
  save(args: Prisma.UserCreateArgs) {
    return client.user.create(args);
  }
}
