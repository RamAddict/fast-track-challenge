import React, { useEffect, useState } from 'react';
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
  const [form, setForm] = useState({
    orderId: '',
    customerName: '',
    destination: '',
    status: SHIPMENT_STATUS.PENDING as EShipmentStatus,
  });

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

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const response = await fetch(shipmentsUrl, {
      body: JSON.stringify(form),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const text = await response.text();
      console.error(
        `Failed to create shipment: ${response.status} ${response.statusText} - ${text.slice(0, 200)}`,
      );
      return;
    }
    // reset form
        setForm({
      orderId: '',
      customerName: '',
      destination: '',
      status: SHIPMENT_STATUS.PENDING,
    });
    // close it 
    (document.getElementById('my_modal_1') as HTMLDialogElement)?.close();
    await refreshShipments();
  };

  const refreshShipments = async () => {
    const response = await fetch(
      shipmentsUrl +
        (search ? `?customerName=${encodeURIComponent(search)}` : ''),
    );
    const result = await response.json();
    setShipments(result.data);
  };

  return (
    <>
      <div>
        <h1 className="text-4xl font-semibold pt-2 pb-8">
          Current Shipments for fast-track-challenge
        </h1>
        <div className="flex flex-row gap-8 justify-between px-4">
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
          <button
            className="btn btn-primary"
            onClick={() =>
              (
                document.getElementById('my_modal_1') as HTMLDialogElement
              )?.showModal()
            }
          >
            Add Shipment
          </button>
        </div>
      </div>
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

      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create Shipment</h3>
          <form method="dialog" className="">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <div className="modal-action w-full">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 w-full"
            >
              <legend className="fieldset-legend">Order Id</legend>
              <input
                value={form.orderId}
                onChange={(e) => {
                  setForm((f) => ({ ...f, orderId: e.target.value }));
                }}
                type="text"
                placeholder="Type here"
                className="input"
              />
              <legend className="fieldset-legend">Customer Name</legend>
              <input
                value={form.customerName}
                onChange={(e) => {
                  setForm((f) => ({ ...f, customerName: e.target.value }));
                }}
                type="text"
                placeholder="Type here"
                className="input"
              />
              <legend className="fieldset-legend">Destination</legend>
              <input
                value={form.destination}
                onChange={(e) => {
                  setForm((f) => ({ ...f, destination: e.target.value }));
                }}
                type="text"
                placeholder="Type here"
                className="input"
              />
              <legend className="fieldset-legend">Status</legend>
              <select
                value={form.status}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as EShipmentStatus,
                  }));
                }}
                className="select"
              >
                <option value={'pending'}>Pending</option>
                <option value={'in_transit'}>In Transit</option>
                <option value={'delivered'}>Delivered</option>
                <option value={'failed'}>Failed</option>
              </select>
              <button className="btn btn-primary" type="submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default App;
