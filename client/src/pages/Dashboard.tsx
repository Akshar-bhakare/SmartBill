import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Check,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BrutalCard } from '../components/ui/BrutalCard';
import { BrutalButton } from '../components/ui/BrutalButton';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingSpinner } from '../components/ui/Loading';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { invoiceApi } from '../services/invoice.api';
import { Invoice, InvoiceStatus, DashboardStats } from '../types/invoice';
import { formatCurrency, formatDate } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, invoiceData] = await Promise.all([
        invoiceApi.getStats(),
        invoiceApi.getAll(),
      ]);
      setStats(statsData);
      setInvoices(invoiceData);
    } catch {
      toast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await invoiceApi.delete(deleteTarget);
      toast('Invoice deleted', 'success');
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast('Failed to delete invoice', 'error');
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await invoiceApi.updateStatus(id, 'PAID');
      toast('Invoice marked as paid', 'success');
      fetchData();
    } catch {
      toast('Failed to update status', 'error');
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold uppercase tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500 font-medium mt-1">
            Here's what your billing looks like today.
          </p>
        </div>
        <BrutalButton variant="primary" size="md" onClick={() => navigate('/invoices/new')}>
          <Plus size={16} strokeWidth={3} />
          Create Invoice
        </BrutalButton>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={<IndianRupee size={18} strokeWidth={2.5} />}
          accent="white"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(stats?.outstanding || 0)}
          icon={<Clock size={18} strokeWidth={2.5} />}
          accent="yellow"
        />
        <StatCard
          label="Paid"
          value={String(stats?.paidCount ?? 0)}
          icon={<TrendingUp size={18} strokeWidth={2.5} />}
          accent="green"
        />
        <StatCard
          label="Overdue"
          value={String(stats?.overdueCount ?? 0)}
          icon={<AlertTriangle size={18} strokeWidth={2.5} />}
          accent="coral"
        />
      </div>

      {/* ─── Charts Row ─── */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Revenue Bar Chart */}
          {stats.chartData && stats.chartData.length > 0 && (
            <BrutalCard className="p-6 lg:col-span-2">
              <h2 className="text-xs font-extrabold uppercase tracking-widest mb-6 text-neutral-500">
                Revenue Overview
              </h2>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#111' }}
                      tickLine={false}
                      axisLine={{ stroke: '#111', strokeWidth: 2 }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fontWeight: 600, fill: '#999' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#111',
                        border: '2px solid #111',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#6C3BFF" stroke="#111" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </BrutalCard>
          )}

          {/* Status Distribution Pie Chart */}
          <StatusPieChart stats={stats} />
        </div>
      )}

      {/* ─── Invoice List ─── */}
      <BrutalCard className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-neutral-500">
            Recent Invoices
          </h2>
          <button
            onClick={() => navigate('/invoices')}
            className="text-xs font-extrabold uppercase tracking-widest text-brand-purple hover:underline cursor-pointer lg:ml-auto"
          >
            View All →
          </button>

        </div>

        {invoices.length === 0 ? (
          <EmptyState onAction={() => navigate('/invoices/new')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-black">
                  {['Invoice', 'Customer', 'Issued', 'Due', 'Amount', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-2 text-[10px] font-extrabold uppercase tracking-widest text-neutral-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors group"
                  >
                    <td className="py-3 px-2">
                      <span className="text-xs font-bold font-mono">{inv.invoiceNumber}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm font-bold">{inv.customerName}</span>
                    </td>
                    <td className="py-3 px-2 text-xs text-neutral-500 font-medium">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="py-3 px-2 text-xs text-neutral-500 font-medium">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm font-extrabold tabular-nums">
                        {formatCurrency(inv.total)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionBtn
                          icon={<Eye size={14} strokeWidth={2.5} />}
                          title="View"
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                        />
                        <ActionBtn
                          icon={<Pencil size={14} strokeWidth={2.5} />}
                          title="Edit"
                          onClick={() => navigate(`/invoices/${inv.id}/edit`)}
                        />
                        {inv.status !== 'PAID' && (
                          <ActionBtn
                            icon={<Check size={14} strokeWidth={2.5} />}
                            title="Mark Paid"
                            onClick={() => handleMarkPaid(inv.id)}
                            accent="green"
                          />
                        )}
                        <ActionBtn
                          icon={<Trash2 size={14} strokeWidth={2.5} />}
                          title="Delete"
                          onClick={() => setDeleteTarget(inv.id)}
                          accent="coral"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BrutalCard>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Invoice"
        message="This action is irreversible. This invoice and all its line items will be permanently deleted."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

/* ─── Sub components ─── */

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}> = ({ label, value, icon, accent }) => {
  const accentBg: Record<string, string> = {
    white: 'bg-white',
    yellow: 'bg-brand-yellow',
    green: 'bg-brand-green',
    coral: 'bg-brand-coral',
  };

  return (
    <BrutalCard accent={accent as any} className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-neutral-600">{icon}</span>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-600">
          {label}
        </span>
      </div>
      <p className="text-2xl lg:text-3xl font-extrabold tabular-nums tracking-tight">{value}</p>
    </BrutalCard>
  );
};

const ActionBtn: React.FC<{
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  accent?: string;
}> = ({ icon, title, onClick, accent }) => {
  const color =
    accent === 'coral'
      ? 'hover:bg-brand-coral'
      : accent === 'green'
      ? 'hover:bg-brand-green'
      : 'hover:bg-neutral-100';

  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 transition-colors cursor-pointer rounded-none ${color}`}
    >
      {icon}
    </button>
  );
};

const EmptyState: React.FC<{ onAction: () => void }> = ({ onAction }) => (
  <div className="text-center py-16">
    <h3 className="text-2xl lg:text-3xl font-extrabold uppercase tracking-tight">
      No invoices.
      <br />
      <span className="text-brand-purple">Yet.</span>
    </h3>
    <p className="mt-3 text-sm text-neutral-500 font-medium max-w-xs mx-auto">
      Your first invoice is about 30 seconds away.
    </p>
    <div className="mt-6">
      <BrutalButton onClick={onAction} variant="primary" size="md">
        <Plus size={16} strokeWidth={3} />
        Create Invoice
      </BrutalButton>
    </div>
  </div>
);

const PIE_COLORS: Record<string, string> = {
  Paid: '#4ade80',
  Unpaid: '#facc15',
  Overdue: '#f87171',
  Draft: '#a3a3a3',
};

const StatusPieChart: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const unpaidCount = stats.totalCount - stats.paidCount - stats.overdueCount;
  const data = [
    { name: 'Paid', value: stats.paidCount },
    { name: 'Unpaid', value: unpaidCount },
    { name: 'Overdue', value: stats.overdueCount },
  ].filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    const pct = Math.round((value / total) * 100);
    if (pct < 5) return null;
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={800} fill="#111">
        {pct}%
      </text>
    );
  };

  return (
    <BrutalCard className="p-6">
      <h2 className="text-xs font-extrabold uppercase tracking-widest mb-4 text-neutral-500">
        Invoice Status
      </h2>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="#111"
              strokeWidth={2}
              labelLine={false}
              label={renderLabel}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
              ))}
            </Pie>

          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 border-2 border-black"
              style={{ background: PIE_COLORS[d.name] }}
            />
            <span className="text-[11px] font-extrabold uppercase tracking-wide">
              {d.name} · {d.value}
            </span>
          </div>
        ))}
      </div>
    </BrutalCard>
  );
};

export default Dashboard;
