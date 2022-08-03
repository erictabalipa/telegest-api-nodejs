import { InsatallationHasUsableObject, LampLocation } from '@prisma/client';

export interface Location {
  number: string;
  zip_code: number;
  street: string;
  district: string;
  city: string;
  state: string;
  reference: string;
}

export interface Lamp {
  name: string;
  lampModelId: number;
  lampLocation: LampLocation;
}

export interface UsableObjects {
  usable_object_id: number;
  quantity: number;
  unit_of_measurement: string;
}

export interface CreateInstallationRequest {
  datetime: string;
  lamps: Lamp[];
  usableObjects: InsatallationHasUsableObject[];
}
