import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, FileText, Search } from 'lucide-react';
import { BrutalCard } from '../components/ui/BrutalCard';
import { BrutalButton } from '../components/ui/BrutalButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingSpinner } from '../components/ui/Loading';
import { useToast } from '../components/ui/Toast';
import { invoiceApi } from '../services/invoice.api';
import { Invoice } from '../types/invoice';
import { formatCurrency, formatDate } from '../utils/formatters';

const STATUS_FILTERS = ['ALL', 'PAID', 'UNPAID', 'OVERDUE', 'DRAFT'] as const;

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    invoiceApi
      .getAll(debouncedSearch || undefined, statusFilter !== 'ALL' ? statusFilter : undefined)
      .then(setInvoices)
      .catch(() => toast('Failed to load invoices', 'error'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, statusFilter, toast]);

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold uppercase tracking-tight">Invoices</h1>
          <p className="text-sm text-neutral-500 font-medium mt-1">
            Manage and track all your invoices.
          </p>
        </div>
        <BrutalButton variant="primary" size="md" onClick={() => navigate('/invoices/new')}>
          <Plus size={16} strokeWidth={3} />
          Create Invoice
        </BrutalButton>
      </div>

      <BrutalCard className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} strokeWidth={2.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by invoice #, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm font-medium bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-none"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest border-2 border-black transition-all cursor-pointer ${
                  statusFilter === f
                    ? 'bg-brand-purple text-white shadow-brutal-sm'
                    : 'bg-white text-foreground hover:bg-neutral-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto mb-4 text-neutral-300" strokeWidth={1.5} />
            <h3 className="text-xl font-extrabold uppercase tracking-tight">
              No invoices found.
            </h3>
            <p className="mt-2 text-sm text-neutral-500 font-medium">
              {search || statusFilter !== 'ALL'
                ? 'Try changing your search or filter.'
                : 'Create your first invoice to get started.'}
            </p>
            {!search && statusFilter === 'ALL' && (
              <BrutalButton variant="primary" className="mt-6" onClick={() => navigate('/invoices/new')}>
                <Plus size={16} strokeWidth={3} />
                Create Invoice
              </BrutalButton>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-black">
                  {['Invoice', 'Customer', 'Issued', 'Due', 'Amount', 'Status', ''].map((h) => (
                    <th key={h} className="py-3 px-2 text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-2">
                      <span className="text-xs font-bold font-mono">{inv.invoiceNumber}</span>
                    </td>
                    <td className="py-3 px-2 text-sm font-bold">{inv.customerName}</td>
                    <td className="py-3 px-2 text-xs text-neutral-500 font-medium">{formatDate(inv.issueDate)}</td>
                    <td className="py-3 px-2 text-xs text-neutral-500 font-medium">{formatDate(inv.dueDate)}</td>
                    <td className="py-3 px-2 text-sm font-extrabold tabular-nums">{formatCurrency(inv.total)}</td>
                    <td className="py-3 px-2"><StatusBadge status={inv.status} /></td>
                    <td className="py-3 px-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${inv.id}`); }}
                        className="p-1.5 hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="View"
                      >
                        <Eye size={14} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BrutalCard>
    </div>
  );
};

export default InvoiceList;
