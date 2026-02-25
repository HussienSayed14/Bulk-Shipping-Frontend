import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { batchesApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Upload, FileText, Trash2, Eye, Package, Clock,
  CheckCircle2, DollarSign, Calendar,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ShipmentBatch } from '../../types';
import toast from 'react-hot-toast';

const statusCfg: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  draft:     { label: 'Draft',     bg: 'bg-gray-100 border-gray-200',    text: 'text-gray-600',    icon: Clock },
  purchased: { label: 'Purchased', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle2 },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<ShipmentBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [delId, setDelId] = useState<number | null>(null);
  const [delLoading, setDelLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setBatches(await batchesApi.list()); }
    catch (err) { toast.error(getErrorMessage(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!delId) return;
    setDelLoading(true);
    try {
      await batchesApi.delete(delId);
      toast.success('Batch deleted');
      setDelId(null);
      await load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setDelLoading(false); }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading orders..." />;

  return (
    <div className="page-enter max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Order History</h1>
          <p className="text-sm text-gray-500 mt-1">All your shipment batches</p>
        </div>
        <Button onClick={() => navigate('/upload')}>
          <Upload className="h-4 w-4 mr-1.5" />New Shipment
        </Button>
      </div>

      {batches.length === 0 ? (
        <div className="bg-white rounded-xl border p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No orders yet</h3>
          <p className="text-sm text-gray-500 mt-2 mb-6">Upload a CSV to create your first shipment batch.</p>
          <Button onClick={() => navigate('/upload')}>
            <Upload className="h-4 w-4 mr-1.5" />Upload CSV
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map((b) => {
            const cfg = statusCfg[b.status] || statusCfg.draft;
            const Icon = cfg.icon;
            const isPurchased = b.status === 'purchased';

            return (
              <div key={b.id}
                className="bg-white rounded-xl border hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="p-5 flex items-center gap-5">
                  {/* Icon */}
                  <div className={cn('flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                    isPurchased ? 'bg-emerald-100' : 'bg-gray-100')}>
                    <FileText className={cn('h-6 w-6', isPurchased ? 'text-emerald-600' : 'text-gray-400')} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-gray-900 truncate">{b.file_name}</p>
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', cfg.bg, cfg.text)}>
                        <Icon className="h-3 w-3" />{cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(b.created_at)}</span>
                      <span>Batch #{b.id}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{b.total_records}</p>
                      <p className="text-xs text-gray-500">Records</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-600">{b.valid_records}</p>
                      <p className="text-xs text-gray-500">Valid</p>
                    </div>
                    {b.invalid_records > 0 && (
                      <div>
                        <p className="text-lg font-bold text-red-600">{b.invalid_records}</p>
                        <p className="text-xs text-gray-500">Invalid</p>
                      </div>
                    )}
                    {isPurchased && b.total_cost !== undefined && (
                      <div>
                        <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />{Number(b.total_cost).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Cost</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!isPurchased && (
                      <Button size="sm" variant="outline"
                        onClick={() => navigate(`/review/${b.id}`)}>
                        <Eye className="h-3.5 w-3.5 mr-1" />Continue
                      </Button>
                    )}
                    {isPurchased && (
                      <Button size="sm" variant="outline"
                        onClick={() => navigate(`/review/${b.id}`)}>
                        <Eye className="h-3.5 w-3.5 mr-1" />View
                      </Button>
                    )}
                    {!isPurchased && (
                      <button onClick={() => setDelId(b.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog isOpen={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete}
        title="Delete Batch" message="This will permanently delete the batch and all its records."
        confirmLabel="Delete" variant="danger" isLoading={delLoading} />
    </div>
  );
}