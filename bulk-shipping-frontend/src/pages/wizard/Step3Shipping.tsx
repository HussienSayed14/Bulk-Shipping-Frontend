import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBatchStore } from '../../store/batchStore';
import { batchesApi, shipmentsApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ArrowLeft, ArrowRight, Trash2, DollarSign, Truck, RefreshCw } from 'lucide-react';
import type { ShipmentRecord, ShippingService } from '../../types';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function Step3Shipping() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const {
    batch, shipments, selectedIds, isLoading,
    loadBatch, loadShipments, toggleSelect, selectAll, isAllSelected, clearSelection,
  } = useBatchStore();

  const [delId, setDelId] = useState<number | null>(null);
  const [delLoading, setDelLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [bulkService, setBulkService] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const id = Number(batchId);

  const load = useCallback(async () => {
    try { await Promise.all([loadBatch(id), loadShipments(id)]); }
    catch (err) { toast.error(getErrorMessage(err)); }
  }, [id, loadBatch, loadShipments]);

  useEffect(() => { load(); }, [load]);

  // Auto-calculate on first load if no rates set
  useEffect(() => {
    if (shipments.length > 0 && shipments.every((s) => !s.shipping_service) && !calcLoading) {
      handleCalcRates('ground');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipments.length]);

  const handleCalcRates = async (service: string) => {
    setCalcLoading(true);
    try {
      await batchesApi.calculateRates(id, service);
      await load();
      toast.success('Rates calculated');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setCalcLoading(false); }
  };

  const handleServiceChange = async (s: ShipmentRecord, service: ShippingService) => {
    if (!service) return;
    setUpdatingId(s.id);
    try {
      await shipmentsApi.update(s.id, { shipping_service: service } as Partial<ShipmentRecord>);
      await load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setUpdatingId(null); }
  };

  const handleBulkShipping = async (service: 'priority' | 'ground' | 'cheapest') => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setBulkLoading(true);
    try {
      const r = await shipmentsApi.bulkUpdateShipping(id, { shipment_ids: ids, service });
      toast.success(r.message);
      setBulkService(false); clearSelection(); await load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setBulkLoading(false); }
  };

  const handleDelete = async () => {
    if (!delId) return;
    setDelLoading(true);
    try { await shipmentsApi.delete(delId); toast.success('Deleted'); setDelId(null); await load(); }
    catch (err) { toast.error(getErrorMessage(err)); }
    finally { setDelLoading(false); }
  };

  const sel = Array.from(selectedIds);
  const totalCost = shipments.reduce((sum, s) => sum + (Number(s.shipping_cost) || 0), 0);
  const allHaveService = shipments.length > 0 && shipments.filter(s => s.is_valid).every(s => s.shipping_service);
  const invalidCount = shipments.filter(s => !s.is_valid).length;

  if (isLoading && !batch) return <LoadingSpinner fullScreen message="Loading..." />;

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Select Shipping</h1>
          <p className="text-sm text-gray-500 mt-1">Step 3 of 3 — Choose services and review costs</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg">
            <DollarSign className="h-4 w-4" />
            <span className="text-lg font-bold">{totalCost.toFixed(2)}</span>
            <span className="text-xs text-gray-400">total</span>
          </div>
          <Button variant="outline" onClick={() => navigate(`/review/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />Back
          </Button>
          <Button onClick={() => navigate(`/purchase/${id}`)} disabled={!allHaveService || invalidCount > 0}
            className="bg-emerald-600 hover:bg-emerald-700">
            Purchase<ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Warnings */}
      {invalidCount > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-700">
          <span className="font-medium">{invalidCount} invalid records.</span> Go back to fix them or they will be excluded from purchase.
        </div>
      )}

      {calcLoading && (
        <div className="mb-4 bg-brand-50 border border-brand-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
          <LoadingSpinner size="sm" /><p className="text-sm text-brand-700">Calculating shipping rates...</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="outline" size="sm" onClick={() => handleCalcRates('ground')} disabled={calcLoading}>
          <RefreshCw className={cn('h-4 w-4 mr-1.5', calcLoading && 'animate-spin')} />Recalculate All (Ground)
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleCalcRates('priority')} disabled={calcLoading}>
          <RefreshCw className={cn('h-4 w-4 mr-1.5', calcLoading && 'animate-spin')} />Recalculate All (Priority)
        </Button>

        {sel.length > 0 && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <span className="text-sm text-gray-600">{sel.length} selected</span>
            <Button size="sm" onClick={() => setBulkService(true)}>
              <Truck className="h-4 w-4 mr-1.5" />Change Service
            </Button>
            <button onClick={clearSelection} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
          </>
        )}
      </div>

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
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Ship To</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Package</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs">Shipping Service</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 text-xs">Cost</th>
                <th className="w-12 px-4 py-3"></th>
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
                    <div className="max-w-[180px]">
                      <p className="text-xs font-medium text-gray-900 truncate">{s.to_first_name} {s.to_last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{s.to_city}, {s.to_state} {s.to_zip}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.length ? (
                      <p className="text-xs text-gray-600">{s.length}×{s.width}×{s.height} in • {s.weight_lb||0}lb {s.weight_oz||0}oz</p>
                    ) : <span className="text-xs text-red-500 italic">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={s.is_valid ? 'valid' : 'invalid'} />
                  </td>
                  <td className="px-4 py-3">
                    <select value={s.shipping_service || ''}
                      onChange={(e) => handleServiceChange(s, e.target.value as ShippingService)}
                      disabled={updatingId === s.id || !s.is_valid}
                      className={cn('text-xs rounded-lg border px-2.5 py-1.5 focus:ring-2 focus:ring-brand-500 w-full max-w-[160px]',
                        !s.is_valid ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white')}>
                      <option value="">Select...</option>
                      <option value="ground">Ground — $2.50 base</option>
                      <option value="priority">Priority — $5.00 base</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-900 text-sm">${(Number(s.shipping_cost) || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDelId(s.id)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {!shipments.length && !isLoading && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No records</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {isLoading && <div className="p-8"><LoadingSpinner message="Loading..." /></div>}
      </div>

      {/* Footer total */}
      <div className="mt-4 flex items-center justify-between bg-white rounded-xl border p-4">
        <div className="text-sm text-gray-600">
          {shipments.filter(s => s.is_valid && s.shipping_service).length} of {shipments.length} records ready
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Estimated Total</p>
          <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Bulk service picker */}
      {bulkService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setBulkService(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-5 animate-scale-in">
            <h3 className="text-lg font-semibold mb-4">Change Shipping for {sel.length} Records</h3>
            <div className="space-y-2">
              {([
                { key: 'cheapest' as const, name: 'Most Affordable', desc: 'Auto-select cheapest' },
                { key: 'ground' as const, name: 'Ground Shipping', desc: '$2.50 base + $0.05/oz' },
                { key: 'priority' as const, name: 'Priority Mail', desc: '$5.00 base + $0.10/oz' },
              ]).map((opt) => (
                <button key={opt.key} onClick={() => handleBulkShipping(opt.key)} disabled={bulkLoading}
                  className="w-full text-left p-3 rounded-lg border hover:border-brand-500 hover:bg-brand-50 transition-all">
                  <p className="text-sm font-medium">{opt.name}</p>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setBulkService(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete}
        title="Delete Record" message="This cannot be undone." confirmLabel="Delete" variant="danger" isLoading={delLoading} />
    </div>
  );
}