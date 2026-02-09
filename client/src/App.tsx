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

const statusClassMap: Record<EShipmentStatus, string> = {
  [SHIPMENT_STATUS.PENDING]: 'bg-amber-100 text-amber-800',
  [SHIPMENT_STATUS.IN_TRANSIT]: 'bg-blue-100 text-blue-800',
  [SHIPMENT_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
  [SHIPMENT_STATUS.FAILED]: 'bg-red-100 text-red-800',
};

const getStatusClasses = (status: EShipmentStatus) =>
  statusClassMap[status] ?? 'bg-gray-100 text-gray-800';

function App() {
  const [shipments, setShipments] = useState<IShipment[]>([]);
  const [search, setSearch] = useState<string>('');
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
  const apiBaseNormalized = apiBase.replace(/\/$/, '');
  const shipmentsUrl = apiBaseNormalized
    ? `${apiBaseNormalized}/shipments`
    : '/shipments';

  useEffect(() => {
    fetch(
      shipmentsUrl +
        (search ? `?customerName=${encodeURIComponent(search)}` : ''),
    )
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
  }, [shipmentsUrl, search]);

  return (
    <>
      <h1 className="text-4xl font-semibold pt-2 pb-8">
        Current Shipments for fast-track-challenge
      </h1>

      <label className="input">
        <svg
          className="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          aria-label="Search by customer name"
          required
          placeholder="Search by customer name"
        />
      </label>

      <div className="overflow-x-auto pt-4">
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
                <td>{shipment.customerName}</td>
                <td>{shipment.destination}</td>
                <td>
                  <span
                    className={`badge ${getStatusClasses(shipment.status)}`}
                  >
                    {shipment.status}
                  </span>
                </td>
                <td>{new Date(shipment.lastSyncedAt).toLocaleString()}</td>
                <td>{new Date(shipment.createdAt).toLocaleString()}</td>
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
