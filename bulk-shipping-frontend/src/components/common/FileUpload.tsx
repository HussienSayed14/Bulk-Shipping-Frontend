import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props { onFileSelect: (f: File) => void; isUploading?: boolean; }

export function FileUpload({ onFileSelect, isUploading }: Props) {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const handle = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith('.csv')) { setError('Only CSV files allowed.'); setFile(null); return; }
    if (f.size > 10485760) { setError('Max 10MB.'); setFile(null); return; }
    setError(''); setFile(f); onFileSelect(f);
  }, [onFileSelect]);

  const fmt = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;

  return (
    <div className="space-y-4">
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDrag(false); }}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]); }}
        onClick={() => !isUploading && ref.current?.click()}
        className={cn('relative flex flex-col items-center gap-4 p-12 rounded-xl border-2 border-dashed cursor-pointer transition-all',
          drag ? 'border-brand-500 bg-brand-50' : 'border-gray-300 bg-white hover:border-brand-400 hover:bg-gray-50',
          isUploading && 'pointer-events-none opacity-60')}>
        <input ref={ref} type="file" accept=".csv" onChange={(e) => { if (e.target.files?.[0]) handle(e.target.files[0]); }} className="hidden" />
        <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center', drag ? 'bg-brand-100' : 'bg-gray-100')}>
          <Upload className={cn('h-7 w-7', drag ? 'text-brand-600' : 'text-gray-400')} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">{drag ? 'Drop here' : 'Drag & drop your CSV file'}</p>
          <p className="text-xs text-gray-400 mt-1">or <span className="text-brand-600 font-medium">browse</span> • CSV, max 10MB</p>
        </div>
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-[3px] border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-brand-700">Uploading...</p>
            </div>
          </div>
        )}
      </div>
      {file && !error && (
        <div className="flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-lg px-4 py-3 animate-fade-in">
          <FileText className="h-5 w-5 text-brand-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{fmt(file.size)}</p>
          </div>
          {!isUploading && <button onClick={(e) => { e.stopPropagation(); setFile(null); if (ref.current) ref.current.value = ''; }}
            className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>}
        </div>
      )}
      {error && <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        <AlertCircle className="h-4 w-4" /><p className="text-sm">{error}</p>
      </div>}
    </div>
  );
}