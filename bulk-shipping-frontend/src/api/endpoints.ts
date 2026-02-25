import client from './client';
import type {
  ShipmentBatch, ShipmentRecord, SavedAddress, SavedPackage,
  BulkUpdateFromRequest, BulkUpdatePackageRequest,
  BulkUpdateShippingRequest, BulkDeleteRequest, BulkActionResponse,
  BulkVerifyRequest, BulkVerifyResponse, VerifyAddressResponse,
  PurchaseRequest, PurchaseResponse, ShippingRatesResponse,
} from '../types';

export const batchesApi = {
  upload: async (file: File): Promise<ShipmentBatch> => {
    const fd = new FormData();
    fd.append('file', file);
    return (await client.post<ShipmentBatch>('/batches/upload/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000,
    })).data;
  },
  list: async (): Promise<ShipmentBatch[]> => (await client.get('/batches/')).data,
  detail: async (id: number): Promise<ShipmentBatch> => (await client.get(`/batches/${id}/`)).data,
  delete: async (id: number) => { await client.delete(`/batches/${id}/delete/`); },
  calculateRates: async (id: number, service = 'ground') =>
    (await client.post(`/batches/${id}/calculate-rates/`, { default_service: service })).data,
  purchase: async (id: number, data: PurchaseRequest): Promise<PurchaseResponse> =>
    (await client.post(`/batches/${id}/purchase/`, data)).data,
};

export const shipmentsApi = {
  list: async (batchId: number, params?: { filter?: string; search?: string }): Promise<ShipmentRecord[]> =>
    (await client.get(`/batches/${batchId}/shipments/`, { params })).data,
  update: async (id: number, data: Partial<ShipmentRecord>): Promise<ShipmentRecord> =>
    (await client.patch(`/shipments/${id}/update/`, data)).data,
  delete: async (id: number) => { await client.delete(`/shipments/${id}/delete/`); },
  verifyAddress: async (id: number, type: 'from' | 'to'): Promise<VerifyAddressResponse> =>
    (await client.post(`/shipments/${id}/verify/${type}/`)).data,
  bulkUpdateFrom: async (batchId: number, data: BulkUpdateFromRequest): Promise<BulkActionResponse> =>
    (await client.post(`/batches/${batchId}/shipments/bulk-update-from/`, data)).data,
  bulkUpdatePackage: async (batchId: number, data: BulkUpdatePackageRequest): Promise<BulkActionResponse> =>
    (await client.post(`/batches/${batchId}/shipments/bulk-update-package/`, data)).data,
  bulkUpdateShipping: async (batchId: number, data: BulkUpdateShippingRequest): Promise<BulkActionResponse> =>
    (await client.post(`/batches/${batchId}/shipments/bulk-update-shipping/`, data)).data,
  bulkDelete: async (batchId: number, data: BulkDeleteRequest) => {
    await client.post(`/batches/${batchId}/shipments/bulk-delete/`, data);
  },
  bulkVerify: async (batchId: number, data: BulkVerifyRequest): Promise<BulkVerifyResponse> =>
    (await client.post(`/batches/${batchId}/shipments/bulk-verify/`, data)).data,
};

export const addressesApi = {
  list: async (): Promise<SavedAddress[]> => (await client.get('/saved-addresses/')).data,
};

export const packagesApi = {
  list: async (): Promise<SavedPackage[]> => (await client.get('/saved-packages/')).data,
};

export const ratesApi = {
  getServices: async (): Promise<ShippingRatesResponse> => (await client.get('/shipping-rates/')).data,
};