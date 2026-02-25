import { create } from 'zustand';
import type { ShipmentBatch, ShipmentRecord, SavedAddress, SavedPackage } from '../types';
import { batchesApi, shipmentsApi, addressesApi, packagesApi } from '../api/endpoints';

interface BatchState {
  batch: ShipmentBatch | null;
  shipments: ShipmentRecord[];
  selectedIds: Set<number>;
  isLoading: boolean;
  filter: 'all' | 'valid' | 'invalid';
  search: string;
  savedAddresses: SavedAddress[];
  savedPackages: SavedPackage[];

  setBatch: (b: ShipmentBatch | null) => void;
  loadBatch: (id: number) => Promise<void>;
  loadShipments: (id: number) => Promise<void>;
  refreshAll: () => Promise<void>;
  setFilter: (f: 'all' | 'valid' | 'invalid') => void;
  setSearch: (s: string) => void;
  toggleSelect: (id: number) => void;
  selectAll: () => void;
  clearSelection: () => void;
  isAllSelected: () => boolean;
  loadSavedAddresses: () => Promise<void>;
  loadSavedPackages: () => Promise<void>;
  reset: () => void;
}

export const useBatchStore = create<BatchState>((set, get) => ({
  batch: null, shipments: [], selectedIds: new Set(), isLoading: false,
  filter: 'all', search: '', savedAddresses: [], savedPackages: [],

  setBatch: (batch) => set({ batch }),
  loadBatch: async (id) => set({ batch: await batchesApi.detail(id) }),

  loadShipments: async (id) => {
    set({ isLoading: true });
    try {
      const { filter, search } = get();
      const params: Record<string, string> = {};
      if (filter !== 'all') params.filter = filter;
      if (search.trim()) params.search = search.trim();
      set({ shipments: await shipmentsApi.list(id, params), isLoading: false });
    } catch { set({ isLoading: false }); }
  },

  refreshAll: async () => {
    const { batch } = get();
    if (!batch) return;
    await get().loadBatch(batch.id);
    await get().loadShipments(batch.id);
  },

  setFilter: (filter) => set({ filter, selectedIds: new Set() }),
  setSearch: (search) => set({ search }),

  toggleSelect: (id) => {
    const s = new Set(get().selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    set({ selectedIds: s });
  },
  selectAll: () => {
    const { shipments, selectedIds } = get();
    const ids = shipments.map((s) => s.id);
    const all = ids.length > 0 && ids.every((id) => selectedIds.has(id));
    set({ selectedIds: all ? new Set() : new Set(ids) });
  },
  clearSelection: () => set({ selectedIds: new Set() }),
  isAllSelected: () => {
    const { shipments, selectedIds } = get();
    return shipments.length > 0 && shipments.every((s) => selectedIds.has(s.id));
  },

  loadSavedAddresses: async () => set({ savedAddresses: await addressesApi.list() }),
  loadSavedPackages: async () => set({ savedPackages: await packagesApi.list() }),

  reset: () => set({ batch: null, shipments: [], selectedIds: new Set(), isLoading: false, filter: 'all', search: '' }),
}));