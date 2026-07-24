import React, { useMemo, useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle2, AlertCircle, Download, Sparkles, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrutalCard } from '../components/ui/BrutalCard';
import { BrutalButton } from '../components/ui/BrutalButton';
import { LoadingSpinner } from '../components/ui/Loading';
import { useToast } from '../components/ui/Toast';
import { warrantyApi, WarrantyRecord } from '../services/warranty.api';

const WarrantyPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoiceFileName, setInvoiceFileName] = useState('');
  const [excelFileName, setExcelFileName] = useState('');
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [status, setStatus] = useState('Ready to begin');
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState<WarrantyRecord[]>([]);
  const { toast } = useToast();

  const refreshRecent = async () => {
    try {
      const data = await warrantyApi.history();
      setRecent(data.slice(0, 5));
    } catch {
      // ignore refresh errors for recent list
    }
  };

  useEffect(() => {
    refreshRecent();
  }, []);

  const quantityStatus = useMemo(() => {
    if (!invoiceData || serialNumbers.length === 0) return null;
    return serialNumbers.length === invoiceData.quantity
      ? { ok: true }
      : { ok: false, label: `Expected ${invoiceData.quantity}, found ${serialNumbers.length}` };
  }, [invoiceData, serialNumbers]);

  const resetForm = () => {
    setInvoiceFileName('');
    setExcelFileName('');
    setInvoiceData(null);
    setSerialNumbers([]);
    setStatus('Ready to begin');
    setError('');
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl('');
    }
    setFileName('');
    setShowPreview(false);
  };

  const clearInvoiceSelection = () => {
    setInvoiceFileName('');
    setInvoiceData(null);
    setStatus('Ready to begin');
    setError('');
  };

  const clearExcelSelection = () => {
    setExcelFileName('');
    setSerialNumbers([]);
    setStatus('Ready to begin');
    setError('');
  };

  const handleInvoiceParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError(''); setStatus('Reading invoice PDF...'); setInvoiceFileName(file.name);
    try {
      const parsed = await warrantyApi.parseInvoice(file);
      setInvoiceData(parsed); setStatus('Invoice details extracted');
      toast('Invoice parsed successfully', 'success');
    } catch (err: any) {
      setError(err.message || 'Unable to parse invoice');
      toast(err.message || 'Unable to parse invoice', 'error');
    } finally { setLoading(false); }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError(''); setStatus('Reading serial numbers...'); setExcelFileName(file.name);
    try {
      const parsed = await warrantyApi.parseSerials(file);
      setSerialNumbers(parsed.serialNumbers); setStatus('Serial numbers loaded');
      toast('Serial numbers loaded successfully', 'success');
    } catch (err: any) {
      setError(err.message || 'Unable to read Excel file');
      toast(err.message || 'Unable to read Excel file', 'error');
    } finally { setLoading(false); }
  };

  const generateWarranty = async () => {
    if (!invoiceData || serialNumbers.length === 0) { setError('Please parse both files first.'); return; }
    setLoading(true); setError(''); setStatus('Generating warranty PDF...');
    try {
      const result = await warrantyApi.generate(invoiceData, serialNumbers);
      const base = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:5000';
      const res = await fetch(`${base}${result.downloadUrl}`);
      const blob = await res.blob();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(URL.createObjectURL(blob));
      setFileName(result.fileName);
      setStatus('Warranty PDF ready');
      setShowPreview(true);
      toast('Warranty PDF generated successfully', 'success');
      setRecent((prev) => [result.record, ...prev].slice(0, 5));
    } catch (err: any) {
      setError(err.message || 'Could not generate warranty PDF');
      toast(err.message || 'Could not generate warranty PDF', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold uppercase tracking-tight">Warranty Generator</h1>
          <p className="text-sm text-neutral-500 font-medium mt-1">Upload an invoice and Excel serial list to produce a warranty letter.</p>
        </div>
        <BrutalButton variant="secondary" onClick={() => navigate('/warranty/history')}>
          <Clock size={14} /> View All History
        </BrutalButton>
      </div>

      {/* Status */}
      <BrutalCard className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-purple font-extrabold uppercase tracking-widest text-sm">
          <Sparkles size={16} strokeWidth={2.5} /> Workflow Status
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: invoiceFileName ? 'Invoice Uploaded' : 'Invoice Pending', active: !!invoiceFileName },
            { label: excelFileName ? 'Excel Uploaded' : 'Excel Pending', active: !!excelFileName },
            { label: quantityStatus ? (quantityStatus.ok ? 'Quantity Matched' : (quantityStatus.label ?? 'Mismatch')) : 'Awaiting Validation', active: !!quantityStatus?.ok },
          ].map((s) => (
            <div key={s.label} className={`px-3 py-2 border-2 border-black text-sm font-bold flex items-center gap-2 ${s.active ? 'bg-brand-green' : 'bg-white'}`}>
              {s.active && <CheckCircle2 size={15} />} {s.label}
            </div>
          ))}
        </div>
        {error && (
          <div className="flex items-start gap-2 border-2 border-red-500 bg-red-50 p-3 text-sm font-medium text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
          </div>
        )}
        <p className="text-sm text-neutral-600 font-medium">{status}</p>
      </BrutalCard>

      {/* Upload cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <BrutalCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-extrabold uppercase tracking-widest text-sm">
            <FileText size={16} strokeWidth={2.5} /> 1. Upload Invoice PDF
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-black bg-white p-6 text-sm font-bold uppercase tracking-widest hover:bg-neutral-50">
            <Upload size={16} /> Choose Invoice PDF
            <input type="file" accept=".pdf" className="hidden" onChange={handleInvoiceParse} />
          </label>
          {invoiceFileName && (
            <div className="flex items-center justify-between border border-black bg-white px-4 py-3 text-sm font-bold">
              <span className="truncate">{invoiceFileName}</span>
              <button
                type="button"
                onClick={clearInvoiceSelection}
                className="text-neutral-500 hover:text-black"
                aria-label="Clear invoice selection"
              >
                <X size={18} />
              </button>
            </div>
          )}
          {invoiceData && (
            <div className="border-2 border-black bg-neutral-50 p-4 text-sm space-y-1">
              <p><strong>Customer:</strong> {invoiceData.customerName}</p>
              <p><strong>Invoice No:</strong> {invoiceData.invoiceNumber}</p>
              <p><strong>Invoice Date:</strong> {invoiceData.invoiceDate}</p>
              <p><strong>Product:</strong> {invoiceData.productName}</p>
              <p><strong>Qty:</strong> {invoiceData.quantity}</p>
            </div>
          )}
        </BrutalCard>

        <BrutalCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-extrabold uppercase tracking-widest text-sm">
            <FileText size={16} strokeWidth={2.5} /> 2. Upload Excel
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-black bg-white p-6 text-sm font-bold uppercase tracking-widest hover:bg-neutral-50">
            <Upload size={16} /> Choose Excel File
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
          </label>
          {excelFileName && (
            <div className="flex items-center justify-between border border-black bg-white px-4 py-3 text-sm font-bold">
              <span className="truncate">{excelFileName}</span>
              <button
                type="button"
                onClick={clearExcelSelection}
                className="text-neutral-500 hover:text-black"
                aria-label="Clear Excel selection"
              >
                <X size={18} />
              </button>
            </div>
          )}
          {serialNumbers.length > 0 && (
            <div className="border-2 border-black bg-neutral-50 p-4 text-sm">
              <p><strong>Serials loaded:</strong> {serialNumbers.length}</p>
              <p className="mt-1 text-xs text-neutral-500">First: {serialNumbers[0]}</p>
            </div>
          )}
        </BrutalCard>
      </div>

      {/* Generate */}
      <BrutalCard className="p-6">
        {loading ? <LoadingSpinner message="Processing..." /> : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-tight">Generate Warranty Letter</h2>
              <p className="text-sm text-neutral-500 font-medium mt-1">
                {invoiceData && serialNumbers.length > 0
                  ? quantityStatus?.ok ? 'Ready to generate the warranty PDF.' : 'Adjust the serial count to match the invoice quantity.'
                  : 'Upload both files to enable generation.'}
              </p>
            </div>
            <div className="flex gap-3">
              <BrutalButton variant="primary" onClick={generateWarranty} disabled={!invoiceData || serialNumbers.length === 0 || !quantityStatus?.ok}>
                Generate Warranty PDF
              </BrutalButton>
              {blobUrl && (
                <BrutalButton variant="secondary" onClick={() => setShowPreview(true)}>
                  <Download size={16} /> Preview & Download
                </BrutalButton>
              )}
            </div>
          </div>
        )}
      </BrutalCard>

      {/* Recent */}
      {recent.length > 0 && (
        <BrutalCard className="p-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 font-extrabold uppercase tracking-widest text-sm">
              <Clock size={15} strokeWidth={2.5} /> Recent Warranty Records
            </div>
            <button onClick={() => navigate('/warranty/history')} className="text-xs font-bold uppercase text-brand-purple hover:underline">
              View All →
            </button>
          </div>
          <div className="divide-y divide-neutral-200">
            {recent.map((r) => (
              <div key={r.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-3">
                <div>
                  <p className="text-sm font-bold truncate">{r.invoiceNumber}</p>
                  <p className="text-xs text-neutral-500">{r.customerName} · {new Date(r.generatedAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs font-bold bg-neutral-100 border border-neutral-300 px-2 py-1 inline-flex items-center uppercase tracking-widest">
                  {r.quantity} units
                </span>
              </div>
            ))}
          </div>
        </BrutalCard>
      )}

      {/* Preview modal */}
      {showPreview && blobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex w-full max-w-4xl flex-col border-4 border-black bg-white shadow-[8px_8px_0px_#000]" style={{ height: '90vh' }}>
            <div className="flex items-center justify-between border-b-4 border-black px-4 py-3">
              <span className="font-extrabold uppercase tracking-widest text-sm">Warranty PDF Preview</span>
              <div className="flex items-center gap-3">
                <a href={blobUrl} download={fileName}
                  className="flex items-center gap-2 border-2 border-black bg-brand-green px-4 py-2 text-sm font-bold uppercase tracking-widest shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#000] transition-all">
                  <Download size={14} /> Download PDF
                </a>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    resetForm();
                  }}
                  className="border-2 border-black p-2 hover:bg-neutral-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <iframe src={blobUrl} className="flex-1 w-full" title="Warranty PDF" />
          </div>
        </div>
      )}
    </div>
  );
};

export default WarrantyPage;
