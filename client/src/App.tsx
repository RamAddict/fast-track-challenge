import { useEffect, useState } from 'react';
import './App.css';

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

function App() {
  const [shipments, setShipments] = useState<IShipment[]>([]);
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
  const apiBaseNormalized = apiBase.replace(/\/$/, '');
  const shipmentsUrl = apiBaseNormalized
    ? `${apiBaseNormalized}/shipments`
    : '/shipments';

  useEffect(() => {
    fetch(shipmentsUrl)
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            `Request failed: ${response.status} ${response.statusText} - ${text.slice(0, 200)}`,
          );
        }
        return response.json();
      })
      .then((result) => setShipments(result.data))
      .catch((error) => console.error('Failed to load shipments', error));
  }, [shipmentsUrl]);

  return (
    <>
      <div className="p-4 gap-2 flex flex-col">
        {shipments.map((shipment) => (
          <div key={shipment.id} className="border">
            <h3 className="text-xl font-bold">{shipment.id}</h3>
            <p>
              <b>Customer name: </b>
              {shipment.customerName}
            </p>
            <p>
              <b>Destination:</b> {shipment.destination}
            </p>
            <p>
              <b>Status:</b> {shipment.status}
            </p>
            <p>
              <b>Last Synced At: </b>
              {new Date(shipment.lastSyncedAt).toLocaleString()}
            </p>
            <p>
              <b>Created </b>At: {new Date(shipment.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
