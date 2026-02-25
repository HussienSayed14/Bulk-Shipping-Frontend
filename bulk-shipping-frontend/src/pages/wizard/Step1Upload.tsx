import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../../components/common/FileUpload';
import { Button } from '../../components/ui/button';
import { batchesApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { useBatchStore } from '../../store/batchStore';
import { CheckCircle2, AlertCircle, FileSpreadsheet, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Step1Upload() {
  const navigate = useNavigate();
  const { setBatch } = useBatchStore();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ total: number; valid: number; invalid: number; batchId: number } | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true); setResult(null);
    try {
      const batch = await batchesApi.upload(file);
      setBatch(batch);
      setResult({ total: batch.total_records, valid: batch.valid_records, invalid: batch.invalid_records, batchId: batch.id });
      toast.success(`Uploaded ${batch.total_records} records`);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setUploading(false); }
  };

  return (
    <div className="page-enter max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-gray-900">Upload Spreadsheet</h1>
        <p className="text-sm text-gray-500 mt-1">Step 1 of 3 — Upload your shipping data</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <FileUpload onFileSelect={handleUpload} isUploading={uploading} />
          {result && (
            <div className="bg-white rounded-xl border p-6 animate-fade-in-up space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" /><h3 className="text-lg font-semibold">Upload Complete</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold">{result.total}</p><p className="text-xs text-gray-500 mt-1">Total</p></div>
                <div className="bg-emerald-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{result.valid}</p><p className="text-xs text-emerald-600 mt-1">Valid</p></div>
                <div className="bg-red-50 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-red-600">{result.invalid}</p><p className="text-xs text-red-600 mt-1">Need Attention</p></div>
              </div>
              {result.invalid > 0 && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-700">{result.invalid} records need attention. Fix them in the next step.</p>
                </div>
              )}
              <Button onClick={() => navigate(`/review/${result.batchId}`)} className="w-full" size="lg">Continue to Review & Edit →</Button>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-brand-600" /> Template</h3>
            <p className="text-xs text-gray-500 mb-4">Download our CSV template with the correct format.</p>
            <a href="/Template.csv" download className="inline-flex items-center gap-2 text-sm text-brand-600 font-medium hover:text-brand-700">
              <Download className="h-4 w-4" /> Download Template
            </a>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <h3 className="text-sm font-semibold mb-3">How it works</h3>
            <ol className="space-y-3">
              {['Upload your CSV', 'Review & fix records', 'Select shipping', 'Purchase labels'].map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">{i+1}</span>
                  <span className="text-xs text-gray-600">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}