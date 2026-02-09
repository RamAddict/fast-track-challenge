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
      <h1 className="text-4xl font-semibold">
        Current Shipments for fast-track-challenge
      </h1>
      <div className="overflow-x-auto pt-12">
        <table className="table">
          <thead>
            <tr>
              <th>Shipment Id</th>
              <th>Customer Name</th>
              <th>Destination</th>
              <th>status</th>
              <th>last synced at</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((shipment) => (
              <tr key={shipment.id} className="border">
                <td className=" font-bold">{shipment.id}</td>
                <td>
                  {shipment.customerName}
                </td>
                <td>
                  {shipment.destination}
                </td>
                <td>
                  {shipment.status}
                </td>
                <td>
                  {new Date(shipment.lastSyncedAt).toLocaleString()}
                </td>
                <td>
                  {new Date(shipment.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th>Customer Name</th>
              <th>Destination</th>
              <th>status</th>
              <th>last synced at</th>
              <th>Created At</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

export default App;
