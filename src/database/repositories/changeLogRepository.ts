import { Prisma } from '@prisma/client';
import { client } from '../connect';

export class ChangeLogRepository {
  save(args: Prisma.UserChangeLogCreateArgs) {
    return client.userChangeLog.create(args);
  }
}
