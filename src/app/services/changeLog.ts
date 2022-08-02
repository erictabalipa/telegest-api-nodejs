import { Request } from 'express';
import { ChangeLogRepository } from '../../database/repositories/changeLogRepository';

export class ChangeLog {
  constructor(private readonly changeLogRepository: ChangeLogRepository) {}

  writeLog(request: Request, log: string) {
    try {
      return this.changeLogRepository.save({
        data: {
          log: `[${request.ip}] - ${log}`,
          User: {
            connect: {
              id: request.userId,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
