export interface CarrierJobData {
  shipmentId: string;
  orderId: string;
  customerName: string;
  destination: string;
  status: string;
  operation: 'register' | 'update';
}
