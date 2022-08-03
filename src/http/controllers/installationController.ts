import { Request, Response } from 'express';
import { Permission } from '../../app/services/permission';
import { InstallationRepository } from '../../database/repositories/installationRepository';
import { CreateInstallationRequest } from '../requests/dto/installation';

export class InstallationController {
  constructor(
    private readonly installationRepository: InstallationRepository,
    private readonly permissionService: Permission
  ) {}

  create = async (request: Request, response: Response) => {
    try {
      if (
        await this.permissionService.userHasPermission(
          request,
          'installation-create'
        )
      ) {
        return response
          .status(401)
          .send({ message: 'Você não tem permissão para fazer instalações' });
      }

      const { datetime, lamps, usableObjects } =
        request.body as CreateInstallationRequest;
      if (!datetime)
        return response
          .status(400)
          .send({ message: 'Informe todos os campos' });

      let lampsToCreate = lamps.map((lamp) => {
        return {
          name: lamp.name,
          lampModel: {
            connect: {
              id: lamp.lampModelId,
            },
          },
          lampLocation: {
            create: {
              number: lamp.lampLocation.number,
              zip_code: lamp.lampLocation.zip_code,
              street: lamp.lampLocation.street,
              district: lamp.lampLocation.district,
              city: lamp.lampLocation.city,
              state: lamp.lampLocation.state,
              reference: lamp.lampLocation.reference,
            },
          },
        };
      });
      let usableObjectsToCreate = usableObjects.filter((object) => {
        return {
          quantity: object.quantity,
          unit_of_measurement: object.unit_of_measurement,
          usable_objects: {
            connect: {
              id: object.usableObjectId,
            },
          },
        };
      });

      const installation = await this.installationRepository.save({
        data: {
          datetime: new Date(datetime),

          lamp: {
            create: lampsToCreate,
          },
          InsatallationHasUsableObject: {
            create: usableObjectsToCreate,
          },
          user: {
            connect: {
              id: request.userId,
            },
          },
        },
      });

      return response.status(201).send(installation);
    } catch (error) {
      console.error(error);
      response.status(500).send({ message: 'Internal Error!' });
    }
  };
}
