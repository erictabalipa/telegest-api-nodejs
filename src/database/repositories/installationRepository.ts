import { Prisma } from '@prisma/client';
import { client } from '../connect';

export class InstallationRepository {
  findAll() {
    return client.installation.findMany();
  }
  save(args: Prisma.InstallationCreateArgs) {
    return client.installation.create(args);
  }
}
