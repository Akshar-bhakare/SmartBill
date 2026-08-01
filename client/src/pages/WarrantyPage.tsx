import React, { useMemo, useState } from 'react';
import { FileText, Upload, CheckCircle2, AlertCircle, Download, Sparkles } from 'lucide-react';
import { BrutalCard } from '../components/ui/BrutalCard';
import { BrutalButton } from '../components/ui/BrutalButton';
import { LoadingSpinner } from '../components/ui/Loading';
import { warrantyApi } from '../services/warranty.api';

const WarrantyPage: React.FC = () => {
  const [invoiceText, setInvoiceText] = useState('');
  const [invoiceFileName, setInvoiceFileName] = useState('');
  const [excelFileName, setExcelFileName] = useState('');
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [status, setStatus] = useState('Ready to begin');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');

  const quantityStatus = useMemo(() => {
    if (!invoiceData) return null;
    if (serialNumbers.length === 0) return null;
    return serialNumbers.length === invoiceData.quantity
      ? { ok: true, label: 'Quantity matched' }
      : { ok: false, label: `Expected ${invoiceData.quantity} serial numbers, found ${serialNumbers.length}` };
  }, [invoiceData, serialNumbers]);

  const handleInvoiceParse = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setStatus('Reading invoice PDF text...');
    setInvoiceFileName(file.name);

    try {
      const parsed = await warrantyApi.parseInvoice(file);
      setInvoiceData(parsed);
      setStatus('Invoice details extracted');
    } catch (err: any) {
      setError(err.message || 'Unable to parse invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setStatus('Reading serial numbers from Excel...');
    setExcelFileName(file.name);

    try {
      const parsed = await warrantyApi.parseSerials(file);
      setSerialNumbers(parsed.serialNumbers);
      setStatus('Serial numbers loaded');
    } catch (err: any) {
      setError(err.message || 'Unable to read Excel file');
    } finally {
      setLoading(false);
    }
  };

  const generateWarranty = async () => {
    if (!invoiceData || serialNumbers.length === 0) {
      setError('Please parse both files first.');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Generating warranty PDF...');

    try {
      const result = await warrantyApi.generate(invoiceData, serialNumbers);
      setDownloadUrl(result.downloadUrl);
      setStatus('Warranty PDF ready');
    } catch (err: any) {
      setError(err.message || 'Could not generate warranty PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl lg:text-4xl font-extrabold uppercase tracking-tight">Warranty Generator</h1>
        <p className="text-sm text-neutral-500 font-medium mt-1">
          Upload an invoice and Excel serial list to produce a warranty letter.
        </p>
      </div>

      <BrutalCard className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-purple font-extrabold uppercase tracking-widest text-sm">
          <Sparkles size={16} strokeWidth={2.5} />
          Workflow Status
        </div>
        <div className="flex flex-wrap gap-3">
          <div className={`px-3 py-2 border-2 border-black text-sm font-bold ${invoiceFileName ? 'bg-brand-green' : 'bg-white'}`}>
            {invoiceFileName ? <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Invoice Uploaded</span> : 'Invoice Pending'}
          </div>
          <div className={`px-3 py-2 border-2 border-black text-sm font-bold ${excelFileName ? 'bg-brand-green' : 'bg-white'}`}>
            {excelFileName ? <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Excel Uploaded</span> : 'Excel Pending'}
          </div>
          <div className={`px-3 py-2 border-2 border-black text-sm font-bold ${quantityStatus?.ok ? 'bg-brand-green' : 'bg-white'}`}>
            {quantityStatus ? (quantityStatus.ok ? 'Quantity Matched' : 'Quantity Mismatch') : 'Awaiting Validation'}
          </div>
        </div>
        {error ? (
          <div className="flex items-start gap-2 rounded border-2 border-red-500 bg-red-50 p-3 text-sm font-medium text-red-700">
            <AlertCircle size={16} className="mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}
        <p className="text-sm text-neutral-600 font-medium">{status}</p>
      </BrutalCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <BrutalCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-extrabold uppercase tracking-widest text-sm">
            <FileText size={16} strokeWidth={2.5} />
            1. Upload Invoice PDF
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-black bg-white p-6 text-sm font-bold uppercase tracking-widest hover:bg-neutral-50">
            <Upload size={16} />
            Choose Invoice PDF
            <input type="file" accept=".pdf" className="hidden" onChange={handleInvoiceParse} />
          </label>
          {invoiceData ? (
            <div className="rounded border-2 border-black bg-neutral-50 p-4 text-sm space-y-1">
              <p><strong>Customer:</strong> {invoiceData.customerName}</p>
              <p><strong>Invoice No:</strong> {invoiceData.invoiceNumber}</p>
              <p><strong>Invoice Date:</strong> {invoiceData.invoiceDate}</p>
              <p><strong>Product:</strong> {invoiceData.productName}</p>
              <p><strong>Qty:</strong> {invoiceData.quantity}</p>
            </div>
          ) : null}
        </BrutalCard>

        <BrutalCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-extrabold uppercase tracking-widest text-sm">
            <FileText size={16} strokeWidth={2.5} />
            2. Upload Excel
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-black bg-white p-6 text-sm font-bold uppercase tracking-widest hover:bg-neutral-50">
            <Upload size={16} />
            Choose Excel File
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
          </label>
          {serialNumbers.length > 0 ? (
            <div className="rounded border-2 border-black bg-neutral-50 p-4 text-sm">
              <p><strong>Serials loaded:</strong> {serialNumbers.length}</p>
              <p className="mt-2 text-xs text-neutral-600">First serial: {serialNumbers[0]}</p>
            </div>
          ) : null}
        </BrutalCard>
      </div>

      <BrutalCard className="p-6">
        {loading ? <LoadingSpinner message="Processing files..." /> : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-tight">Generate Warranty Letter</h2>
              <p className="text-sm text-neutral-500 font-medium mt-1">
                {invoiceData && serialNumbers.length > 0
                  ? quantityStatus?.ok
                    ? 'Ready to generate the warranty PDF.'
                    : 'Adjust the serial count to match the invoice quantity.'
                  : 'Upload both files to enable generation.'}
              </p>
            </div>
            <div className="flex gap-3">
              <BrutalButton variant="primary" onClick={generateWarranty} disabled={!invoiceData || serialNumbers.length === 0 || !quantityStatus?.ok}>
                Generate Warranty PDF
              </BrutalButton>
              {downloadUrl ? (
                <a href={downloadUrl} target="_blank" rel="noreferrer">
                  <BrutalButton variant="secondary">
                    <Download size={16} />
                    Download
                  </BrutalButton>
                </a>
              ) : null}
            </div>
          </div>
        )}
      </BrutalCard>
    </div>
  );
};

export default WarrantyPage;
