import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Printer,
  Check,
  Zap,
} from 'lucide-react';
import { BrutalButton } from '../components/ui/BrutalButton';
import { BrutalCard } from '../components/ui/BrutalCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingSpinner } from '../components/ui/Loading';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { invoiceApi } from '../services/invoice.api';
import { Invoice } from '../types/invoice';
import { formatCurrency, formatDate } from '../utils/formatters';

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    invoiceApi
      .getById(id)
      .then(setInvoice)
      .catch(() => toast('Failed to load invoice', 'error'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handlePrint = () => {
    window.print();
  };

  const handleMarkPaid = async () => {
    if (!id) return;
    try {
      const updated = await invoiceApi.updateStatus(id, 'PAID');
      setInvoice(updated);
      toast('Invoice marked as paid!', 'success');
    } catch {
      toast('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await invoiceApi.delete(id);
      toast('Invoice deleted', 'success');
      navigate('/dashboard');
    } catch {
      toast('Failed to delete invoice', 'error');
    }
  };

  if (loading) return <LoadingSpinner message="Loading invoice..." />;
  if (!invoice) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-extrabold uppercase">Invoice not found.</h2>
        <BrutalButton variant="secondary" className="mt-4" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </BrutalButton>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* ─── Header Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print-hide no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:opacity-60 transition-opacity cursor-pointer">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-2xl lg:text-3xl font-extrabold uppercase tracking-tight">
            {invoice.invoiceNumber}
          </h1>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {invoice.status !== 'PAID' && (
            <BrutalButton variant="green" size="sm" onClick={handleMarkPaid}>
              <Check size={14} strokeWidth={3} />
              Mark Paid
            </BrutalButton>
          )}
          <BrutalButton variant="secondary" size="sm" onClick={() => navigate(`/invoices/${id}/edit`)}>
            <Pencil size={14} strokeWidth={3} />
            Edit
          </BrutalButton>
          <BrutalButton variant="secondary" size="sm" onClick={handlePrint}>
            <Printer size={14} strokeWidth={3} />
            Print / PDF
          </BrutalButton>
          <BrutalButton variant="danger" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 size={14} strokeWidth={3} />
            Delete
          </BrutalButton>
        </div>
      </div>

      {/* ─── Printable Invoice ─── */}
      <BrutalCard className="bg-white shadow-brutal-lg border-3 border-black printable-area print-full-width">
        <div className="p-8 lg:p-12">
          {/* Top bar with branding and invoice meta */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-6 mb-10 pb-6 border-b-2 border-black">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={20} strokeWidth={3} className="text-brand-purple" />
                <span className="text-xl font-extrabold tracking-tight">{invoice.businessName}</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">{invoice.businessEmail}</p>
              {invoice.businessPhone && (
                <p className="text-xs text-neutral-500 font-medium">{invoice.businessPhone}</p>
              )}
              {invoice.businessAddress && (
                <p className="text-xs text-neutral-500 font-medium mt-1 max-w-xs">{invoice.businessAddress}</p>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-extrabold uppercase tracking-tight text-brand-purple mb-2">
                INVOICE
              </h2>
              <p className="text-xs font-bold text-neutral-600">
                <span className="text-neutral-400">Invoice #:</span> {invoice.invoiceNumber}
              </p>
              <p className="text-xs font-bold text-neutral-600">
                <span className="text-neutral-400">Issued:</span> {formatDate(invoice.issueDate)}
              </p>
              <p className="text-xs font-bold text-neutral-600">
                <span className="text-neutral-400">Due:</span> {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-10">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-2">
              Bill To
            </h3>
            <p className="text-base font-bold">{invoice.customerName}</p>
            <p className="text-xs text-neutral-500 font-medium">{invoice.customerEmail}</p>
            {invoice.customerPhone && (
              <p className="text-xs text-neutral-500 font-medium">{invoice.customerPhone}</p>
            )}
            {invoice.customerAddress && (
              <p className="text-xs text-neutral-500 font-medium max-w-xs">{invoice.customerAddress}</p>
            )}
          </div>

          {/* Line Items Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-3 text-left text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                    Description
                  </th>
                  <th className="py-3 text-center text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                    Qty
                  </th>
                  <th className="py-3 text-right text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                    Rate
                  </th>
                  <th className="py-3 text-center text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                    Tax
                  </th>
                  <th className="py-3 text-right text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={item.id || i} className="border-b border-neutral-200">
                    <td className="py-3 text-sm font-bold">{item.description}</td>
                    <td className="py-3 text-sm font-medium text-center tabular-nums">{item.quantity}</td>
                    <td className="py-3 text-sm font-medium text-right tabular-nums">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 text-sm font-medium text-center tabular-nums">{item.taxRate}%</td>
                    <td className="py-3 text-sm font-extrabold text-right tabular-nums">
                      {formatCurrency(item.lineTotal || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-72">
              <div className="space-y-2">
                <SummaryRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
                {invoice.discountAmount > 0 && (
                  <SummaryRow label="Discount" value={`- ${formatCurrency(invoice.discountAmount)}`} accent="coral" />
                )}
                <SummaryRow label="Tax" value={formatCurrency(invoice.taxTotal)} />
              </div>
              <div className="border-t-3 border-black mt-4 pt-4">
                <div className="bg-brand-purple text-white p-4 border-2 border-black">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-extrabold tabular-nums">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="grid md:grid-cols-2 gap-6 border-t border-neutral-200 pt-6">
              {invoice.notes && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-2">
                    Notes
                  </h4>
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed whitespace-pre-line">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-2">
                    Terms & Conditions
                  </h4>
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed whitespace-pre-line">
                    {invoice.terms}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </BrutalCard>

      <ConfirmDialog
        open={showDelete}
        title="Delete Invoice"
        message="This action is irreversible. This invoice and all its line items will be permanently deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">{label}</span>
    <span className={`text-sm font-extrabold tabular-nums ${accent === 'coral' ? 'text-brand-coral' : ''}`}>
      {value}
    </span>
  </div>
);

export default InvoiceDetails;
