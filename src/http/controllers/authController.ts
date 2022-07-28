import { Request, Response } from 'express';
import { client } from '../../database/connect';

export class AuthController {
  authenticate = async (request: Request, response: Response) => {
    try {
      await client.teste.create({
        data: {
          name: 'testabdi',
          TesteRelation: {
            create: {
              phone: '99999999',
            },
          },
        },
        include: {
          TesteRelation: true,
        },
      });

      response.send('');
    } catch (error) {
      console.error(error);
      response.status(500).send('Internal Error!!');
    }
  };
}
