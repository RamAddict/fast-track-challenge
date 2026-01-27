import { IShipment } from './shipment.interface';

export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type IPaginatedShipments = IPaginatedResponse<IShipment>;
