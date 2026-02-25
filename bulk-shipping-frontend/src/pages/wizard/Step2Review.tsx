import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBatchStore } from '../../store/batchStore';
import { shipmentsApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EditAddressModal } from '../../components/shipments/EditAddressModal';
import { EditPackageModal } from '../../components/shipments/EditPackageModal';
import { BulkActionsBar } from '../../components/shipments/BulkActionsBar';
import { Search, ArrowLeft, ArrowRight, Pencil, Trash2, ChevronDown, AlertTriangle } from 'lucide-react';
import type { ShipmentRecord } from '../../types';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function Step2Review() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const {
    batch, shipments, selectedIds, isLoading, filter, search,
    loadBatch, loadShipments, setFilter, setSearch,
    toggleSelect, selectAll, isAllSelected, clearSelection,
    savedAddresses, savedPackages, loadSavedAddresses, loadSavedPackages,
  } = useBatchStore();

  const [editAddr, setEditAddr] = useState<{ s: ShipmentRecord; t: 'from'|'to' } | null>(null);
  const [editPkg, setEditPkg] = useState<ShipmentRecord | null>(null);
  const [delId, setDelId] = useState<number | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const id = Number(batchId);

  const load = useCallback(async () => {
    try {
      await Promise.all([loadBatch(id), loadShipments(id), loadSavedAddresses(), loadSavedPackages()]);
    } catch (err) { toast.error(getErrorMessage(err)); }
  }, [id, loadBatch, loadShipments, loadSavedAddresses, loadSavedPackages]);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput, setSearch]);

  // Reload when filter/search changes
  useEffect(() => {
    if (batch) loadShipments(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search]);

  const handleDelete = async () => {
    if (!delId) return;
    setDelLoading(true);
    try { await shipmentsApi.delete(delId); toast.success('Deleted'); setDelId(null); await load(); }
    catch (err) { toast.error(getErrorMessage(err)); }
    finally { setDelLoading(false); }
  };

  const sel = Array.from(selectedIds);

  if (isLoading && !batch) return <LoadingSpinner fullScreen message="Loading batch..." />;

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Review & Edit</h1>
          <p className="text-sm text-gray-500 mt-1">Step 2 of 3 — {batch?.file_name} • {batch?.total_records} records</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/upload')}><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
          <Button onClick={() => navigate(`/shipping/${id}`)}>Continue<ArrowRight className="h-4 w-4 ml-1.5" /></Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-xl font-bold">{batch?.total_records || 0}</p><p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 text-center">
          <p className="text-xl font-bold text-emerald-600">{batch?.valid_records || 0}</p><p className="text-xs text-emerald-600">Valid</p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
          <p className="text-xl font-bold text-red-600">{batch?.invalid_records || 0}</p><p className="text-xs text-red-600">Invalid</p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex bg-white rounded-lg border p-1 gap-1">
          {(['all','valid','invalid'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                filter === f ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100')}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search name, address, order..." className="pl-9" />
        </div>
        <span className="text-sm text-gray-500">{shipments.length} results</span>
      </div>

      {/* Bulk Actions */}
      {sel.length > 0 && (
        <div className="mb-4">
          <BulkActionsBar batchId={id} selectedIds={sel}
            savedAddresses={savedAddresses} savedPackages={savedPackages}
            onDone={load} onClear={clearSelection} />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={isAllSelected()} onChange={selectAll}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Row</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Ship From</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Ship To</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Package</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id} className={cn('border-b transition-colors',
                  selectedIds.has(s.id) ? 'bg-brand-50/60' : 'hover:bg-gray-50',
                  !s.is_valid && !selectedIds.has(s.id) && 'bg-red-50/30')}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">#{s.row_number}</td>
                  <td className="px-4 py-3">
                    {s.from_first_name ? (
                      <div className="max-w-[170px]">
                        <p className="text-xs font-medium text-gray-900 truncate">{s.from_first_name} {s.from_last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{s.from_address1}</p>
                        <p className="text-xs text-gray-500 truncate">{s.from_city}, {s.from_state} {s.from_zip}</p>
                      </div>
                    ) : <span className="text-xs text-red-500 italic">No sender</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-[170px]">
                      <p className="text-xs font-medium text-gray-900 truncate">{s.to_first_name} {s.to_last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{s.to_address1}</p>
                      <p className="text-xs text-gray-500 truncate">{s.to_city}, {s.to_state} {s.to_zip}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.length ? (
                      <div>
                        <p className="text-xs text-gray-700">{s.length}×{s.width}×{s.height} in</p>
                        <p className="text-xs text-gray-500">{s.weight_lb||0}lb {s.weight_oz||0}oz</p>
                      </div>
                    ) : <span className="text-xs text-red-500 italic">No package</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={s.is_valid ? 'valid' : 'invalid'} />
                    {!s.is_valid && (
                      <>
                        <button onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                          className="mt-1 text-xs text-red-600 hover:underline flex items-center gap-1">
                          <ChevronDown className={cn('h-3 w-3 transition-transform', expanded === s.id && 'rotate-180')} />
                          {s.validation_errors.length} errors
                        </button>
                        {expanded === s.id && (
                          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 animate-fade-in">
                            {s.validation_errors.map((e, i) => (
                              <p key={i} className="text-xs text-red-700 flex items-start gap-1.5 py-0.5">
                                <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />{e}
                              </p>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditAddr({ s, t: 'from' })} title="Edit Ship From"
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-brand-600">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setEditAddr({ s, t: 'to' })} title="Edit Ship To"
                        className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setEditPkg(s)} title="Edit Package"
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-brand-600">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDelId(s.id)} title="Delete"
                        className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!shipments.length && !isLoading && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {isLoading && <div className="p-8"><LoadingSpinner message="Loading..." /></div>}
      </div>

      {/* Modals */}
      {editAddr && <EditAddressModal isOpen onClose={() => setEditAddr(null)} onSaved={load} shipment={editAddr.s} addressType={editAddr.t} />}
      {editPkg && <EditPackageModal isOpen onClose={() => setEditPkg(null)} onSaved={load} shipment={editPkg} />}
      <ConfirmDialog isOpen={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete}
        title="Delete Record" message="This cannot be undone." confirmLabel="Delete" variant="danger" isLoading={delLoading} />
    </div>
  );
}