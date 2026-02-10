const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
const apiBaseNormalized = apiBase.replace(/\/$/, '');

export const shipmentsBaseUrl = apiBaseNormalized
  ? `${apiBaseNormalized}/shipments`
  : '/shipments';

export const buildShipmentsUrl = (search?: string) =>
  shipmentsBaseUrl + (search ? `?customerName=${encodeURIComponent(search)}` : '');
