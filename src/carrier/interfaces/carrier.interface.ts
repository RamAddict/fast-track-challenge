import { IShipment } from 'src/shipments/interfaces/shipment.interface';

export type CarrierShipmentData = Pick<
  IShipment,
  'id' | 'orderId' | 'customerName' | 'destination' | 'status'
>;
