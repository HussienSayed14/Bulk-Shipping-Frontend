import { useState } from 'react';
import { MapPin, PackageIcon, Trash2, ShieldCheck, X } from 'lucide-react';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import type { SavedAddress, SavedPackage } from '../../types';
import { shipmentsApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import toast from 'react-hot-toast';

interface Props {
  batchId: number; selectedIds: number[];
  savedAddresses: SavedAddress[]; savedPackages: SavedPackage[];
  onDone: () => void; onClear: () => void;
}

export function BulkActionsBar({ batchId, selectedIds, savedAddresses, savedPackages, onDone, onClear }: Props) {
  const [showFrom, setShowFrom] = useState(false);
  const [showPkg, setShowPkg] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [busy, setBusy] = useState(false);
  const n = selectedIds.length;

  const applyFrom = async (addrId: number) => {
    setBusy(true);
    try {
      const r = await shipmentsApi.bulkUpdateFrom(batchId, { shipment_ids: selectedIds, saved_address_id: addrId });
      toast.success(r.message); setShowFrom(false); onDone();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const applyPkg = async (pkgId: number) => {
    setBusy(true);
    try {
      const r = await shipmentsApi.bulkUpdatePackage(batchId, { shipment_ids: selectedIds, saved_package_id: pkgId });
      toast.success(r.message); setShowPkg(false); onDone();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await shipmentsApi.bulkDelete(batchId, { shipment_ids: selectedIds });
      toast.success(`Deleted ${n} records`); setShowDel(false); onClear(); onDone();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  const doVerify = async () => {
    setBusy(true);
    try {
      const r = await shipmentsApi.bulkVerify(batchId, { shipment_ids: selectedIds, address_type: 'both' });
      toast.success(`Verified: ${r.verified}, Failed: ${r.failed}, Skipped: ${r.skipped}`); onDone();
    } catch (e) { toast.error(getErrorMessage(e)); } finally { setBusy(false); }
  };

  return (
    <>
      <div className="bg-brand-600 text-white px-5 py-3 rounded-xl flex items-center gap-3 animate-fade-in shadow-lg">
        <span className="text-sm font-medium">{n} selected</span>
        <div className="w-px h-5 bg-white/30" />
        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowFrom(true)} disabled={busy}>
          <MapPin className="h-4 w-4 mr-1.5" />Ship From
        </Button>
        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowPkg(true)} disabled={busy}>
          <PackageIcon className="h-4 w-4 mr-1.5" />Package
        </Button>
        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={doVerify} disabled={busy}>
          <ShieldCheck className="h-4 w-4 mr-1.5" />Verify
        </Button>
        <Button size="sm" variant="ghost" className="text-white hover:bg-red-500/80" onClick={() => setShowDel(true)} disabled={busy}>
          <Trash2 className="h-4 w-4 mr-1.5" />Delete
        </Button>
        <button onClick={onClear} className="ml-auto text-white/70 hover:text-white"><X className="h-4 w-4" /></button>
      </div>

      {/* Ship From picker */}
      {showFrom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowFrom(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-5 animate-scale-in">
            <h3 className="text-lg font-semibold mb-4">Select Ship From Address</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {savedAddresses.map((a) => (
                <button key={a.id} onClick={() => applyFrom(a.id)} disabled={busy}
                  className="w-full text-left p-3 rounded-lg border hover:border-brand-500 hover:bg-brand-50 transition-all">
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-gray-500">{a.first_name} {a.last_name} — {a.address_line1}, {a.city}, {a.state} {a.zip_code}</p>
                </button>
              ))}
              {!savedAddresses.length && <p className="text-sm text-gray-400 text-center py-4">No saved addresses. Add them in Django Admin.</p>}
            </div>
            <div className="flex justify-end mt-4"><Button variant="outline" onClick={() => setShowFrom(false)}>Cancel</Button></div>
          </div>
        </div>
      )}

      {/* Package picker */}
      {showPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowPkg(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-5 animate-scale-in">
            <h3 className="text-lg font-semibold mb-4">Select Package Preset</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {savedPackages.map((p) => (
                <button key={p.id} onClick={() => applyPkg(p.id)} disabled={busy}
                  className="w-full text-left p-3 rounded-lg border hover:border-brand-500 hover:bg-brand-50 transition-all">
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-gray-500">{p.length}×{p.width}×{p.height} in — {p.weight_lb}lb {p.weight_oz}oz</p>
                </button>
              ))}
              {!savedPackages.length && <p className="text-sm text-gray-400 text-center py-4">No saved packages. Add them in Django Admin.</p>}
            </div>
            <div className="flex justify-end mt-4"><Button variant="outline" onClick={() => setShowPkg(false)}>Cancel</Button></div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={showDel} onClose={() => setShowDel(false)} onConfirm={doDelete}
        title="Delete Records" message={`Delete ${n} selected records? This cannot be undone.`} confirmLabel="Delete" variant="danger" isLoading={busy} />
    </>
  );
}