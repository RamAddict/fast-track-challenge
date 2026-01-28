export const SHIPMENT_STATUS = {
  PENDING: 'pending',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  FAILED: 'failed',
} as const;

export type EShipmentStatus =
  (typeof SHIPMENT_STATUS)[keyof typeof SHIPMENT_STATUS];

export interface IShipment {
  id: string;
  orderId: string;
  customerName: string;
  destination: string;
  status: EShipmentStatus;
  lastSyncedAt: Date;
  createdAt: Date;
}
