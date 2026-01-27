export enum EShipmentStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export interface IShipment {
  id: string;
  orderId: string;
  customerName: string;
  destination: string;
  status: EShipmentStatus;
  lastSyncedAt: Date;
  createdAt: Date;
}
