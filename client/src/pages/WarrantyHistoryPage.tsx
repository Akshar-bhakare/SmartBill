import React, { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, Download, RefreshCw, ShieldCheck } from 'lucide-react';
import { BrutalCard } from '../components/ui/BrutalCard';
import { BrutalButton } from '../components/ui/BrutalButton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../components/ui/Loading';
import { useToast } from '../components/ui/Toast';
import { warrantyApi, WarrantyRecord } from '../services/warranty.api';

const WarrantyHistoryPage: React.FC = () => {
  const [records, setRecords] = useState<WarrantyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await warrantyApi.history({ search: search || undefined, from: from || undefined, to: to || undefined });
      setRecords(data || []);
    } catch (error: any) {
      toast('Unable to load warranty history', 'error');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [search, from, to, toast]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = async (id: string) => {
    try {
      await warrantyApi.deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast('Warranty record deleted', 'success');
    } catch {
      toast('Failed to delete warranty record', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    handleDelete(deleteTarget);
  };

  const handleDownload = async (record: WarrantyRecord) => {
    setDownloading(record.id);
    try {
      const base = (import.meta.env.VITE_API_URL?.trim() || 'http://localhost:5000');
      const res = await fetch(`${base}/api/warranty/download/${record.fileName}`);
      if (!res.ok) throw new Error('File not found on server');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('File no longer available on server. Please regenerate.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-extrabold uppercase tracking-tight">Warranty History</h1>
        <p className="text-sm text-neutral-500 font-medium mt-1">All generated warranty letters.</p>
      </div>

      <BrutalCard className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search invoice, customer, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-2 border-black pl-8 pr-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="border-2 border-black px-2 py-2 text-sm font-medium focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="border-2 border-black px-2 py-2 text-sm font-medium focus:outline-none" />
          </div>
          <BrutalButton variant="secondary" onClick={fetchRecords}>
            <RefreshCw size={14} /> Refresh
          </BrutalButton>
        </div>
      </BrutalCard>

      {loading ? (
        <LoadingSpinner message="Loading records..." />
      ) : records.length === 0 ? (
        <BrutalCard className="p-12 text-center">
          <ShieldCheck size={40} className="mx-auto mb-3 text-neutral-300" />
          <p className="font-bold text-neutral-400 uppercase tracking-widest text-sm">No warranty records found</p>
        </BrutalCard>
      ) : (
        <>
          <BrutalCard className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black bg-neutral-100">
                <th className="px-4 py-3 text-left font-extrabold uppercase tracking-widest text-xs">Invoice No</th>
                <th className="px-4 py-3 text-left font-extrabold uppercase tracking-widest text-xs">Customer</th>
                <th className="px-4 py-3 text-left font-extrabold uppercase tracking-widest text-xs">Product</th>
                <th className="px-4 py-3 text-left font-extrabold uppercase tracking-widest text-xs">Qty</th>
                <th className="px-4 py-3 text-left font-extrabold uppercase tracking-widest text-xs">Generated</th>
                <th className="px-4 py-3 text-left font-extrabold uppercase tracking-widest text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id} className={`border-b border-neutral-200 ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}>
                  <td className="px-4 py-3 font-bold">{r.invoiceNumber}</td>
                  <td className="px-4 py-3">{r.customerName}</td>
                  <td className="px-4 py-3 max-w-48 truncate">{r.productName}</td>
                  <td className="px-4 py-3">{r.quantity}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">{new Date(r.generatedAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(r)}
                        disabled={downloading === r.id}
                        className="flex items-center gap-1 border-2 border-black bg-brand-green px-3 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50"
                      >
                        <Download size={12} />
                        {downloading === r.id ? '...' : 'Download'}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(r.id)}
                        className="flex items-center gap-1 border-2 border-black bg-red-100 px-3 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </BrutalCard>

          <ConfirmDialog
            open={!!deleteTarget}
            title="Delete Warranty Record"
            message="This action cannot be undone. The warranty record will be permanently removed."
            confirmLabel="Delete"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        </>
      )}
    </div>
  );
};

export default WarrantyHistoryPage;
