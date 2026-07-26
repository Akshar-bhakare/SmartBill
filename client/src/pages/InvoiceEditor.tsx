import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Eye, Printer } from 'lucide-react';
import { BrutalButton } from '../components/ui/BrutalButton';
import { BrutalInput, BrutalTextarea, BrutalSelect } from '../components/ui/BrutalInput';
import { BrutalCard } from '../components/ui/BrutalCard';
import { useToast } from '../components/ui/Toast';
import { LoadingSpinner } from '../components/ui/Loading';
import { invoiceApi } from '../services/invoice.api';
import { customerApi } from '../services/customer.api';
import { Customer, Invoice, CreateInvoiceFormValues, DiscountType } from '../types/invoice';
import { calculateLiveTotals, FormItemInput } from '../utils/calculations';
import { formatCurrency, toMinorUnits, toMajorUnits, toInputDateString } from '../utils/formatters';

interface LineItemFormData {
  description: string;
  quantity: number;
  unitPrice: number; // Major units for display
  taxRate: number;
}

const emptyItem: LineItemFormData = { description: '', quantity: 1, unitPrice: 0, taxRate: 18 };

interface BusinessProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const BUSINESS_KEY = 'smartbill_businesses';
const LAST_BUSINESS_KEY = 'smartbill_last_business';

const getSavedBusinesses = (): BusinessProfile[] => {
  try { return JSON.parse(localStorage.getItem(BUSINESS_KEY) || '[]'); } catch { return []; }
};

const saveBusinessToStorage = (profile: BusinessProfile) => {
  const existing = getSavedBusinesses();
  const idx = existing.findIndex((b) => b.name === profile.name && b.email === profile.email);
  if (idx === -1) existing.push(profile); else existing[idx] = profile;
  localStorage.setItem(BUSINESS_KEY, JSON.stringify(existing));
  localStorage.setItem(LAST_BUSINESS_KEY, JSON.stringify(profile));
};

interface InvoiceEditorProps {
  mode: 'create' | 'edit';
}

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Form state
  const [businessName, setBusinessName] = useState('SmartBill Solutions Pvt. Ltd.');
  const [businessEmail, setBusinessEmail] = useState('hello@smartbill.in');
  const [businessPhone, setBusinessPhone] = useState('+91 98765 43210');
  const [businessAddress, setBusinessAddress] = useState('4th Floor, Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103');

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerId, setCustomerId] = useState<string | null>(null);

  const [issueDate, setIssueDate] = useState(toInputDateString(new Date()));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return toInputDateString(d);
  });

  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(0);
  const [status, setStatus] = useState<string>('UNPAID');
  const [notes, setNotes] = useState('Thank you for your business!');
  const [terms, setTerms] = useState('Payment due within 14 days of issue.');

  const [items, setItems] = useState<LineItemFormData[]>([{ ...emptyItem }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load customers + last business
  useEffect(() => {
    customerApi.getAll().then(setCustomers).catch(() => {});
    if (mode === 'create') {
      try {
        const last = localStorage.getItem(LAST_BUSINESS_KEY);
        if (last) {
          const b: BusinessProfile = JSON.parse(last);
          setBusinessName(b.name);
          setBusinessEmail(b.email);
          setBusinessPhone(b.phone || '');
          setBusinessAddress(b.address || '');
        }
      } catch {}
    }
  }, []); // eslint-disable-line

  // Load existing invoice for editing
  useEffect(() => {
    if (mode === 'edit' && id) {
      invoiceApi
        .getById(id)
        .then((inv) => {
          setBusinessName(inv.businessName);
          setBusinessEmail(inv.businessEmail);
          setBusinessPhone(inv.businessPhone || '');
          setBusinessAddress(inv.businessAddress || '');
          setCustomerName(inv.customerName);
          setCustomerEmail(inv.customerEmail);
          setCustomerPhone(inv.customerPhone || '');
          setCustomerAddress(inv.customerAddress || '');
          setCustomerId(inv.customerId || null);
          setIssueDate(toInputDateString(inv.issueDate));
          setDueDate(toInputDateString(inv.dueDate));
          setDiscountType(inv.discountType);
          setDiscountValue(inv.discountType === 'FIXED' ? toMajorUnits(inv.discountAmount) : inv.discountValue);
          setStatus(inv.status);
          setNotes(inv.notes || '');
          setTerms(inv.terms || '');
          setItems(
            inv.items.map((i) => ({
              description: i.description,
              quantity: i.quantity,
              unitPrice: toMajorUnits(i.unitPrice),
              taxRate: i.taxRate,
            }))
          );
        })
        .catch(() => toast('Failed to load invoice', 'error'))
        .finally(() => setLoading(false));
    }
  }, [mode, id, toast]);

  // Live calculations
  const calc = useMemo(() => {
    return calculateLiveTotals(items, discountType, discountValue);
  }, [items, discountType, discountValue]);

  // Customer selection — empty value clears fields
  const handleCustomerSelect = (custId: string) => {
    if (!custId) {
      setCustomerId(null);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerAddress('');
      return;
    }
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setCustomerId(cust.id);
      setCustomerName(cust.name);
      setCustomerEmail(cust.email);
      setCustomerPhone(cust.phone || '');
      setCustomerAddress(cust.address || '');
    }
  };

  const handleBusinessSelect = (idx: string) => {
    if (!idx) return;
    const b = getSavedBusinesses()[parseInt(idx)];
    if (b) {
      setBusinessName(b.name);
      setBusinessEmail(b.email);
      setBusinessPhone(b.phone || '');
      setBusinessAddress(b.address || '');
    }
  };

  // Line item handlers
  const updateItem = (index: number, field: keyof LineItemFormData, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };
  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.customerName = 'Customer name is required';
    if (!customerEmail.trim()) errs.customerEmail = 'Customer email is required';
    if (!businessName.trim()) errs.businessName = 'Business name is required';
    if (!businessEmail.trim()) errs.businessEmail = 'Business email is required';
    if (new Date(dueDate) < new Date(issueDate)) errs.dueDate = 'Due date must be after issue date';

    items.forEach((item, i) => {
      if (!item.description.trim()) errs[`item_${i}_desc`] = 'Required';
      if (item.quantity <= 0) errs[`item_${i}_qty`] = 'Must be > 0';
      if (item.unitPrice < 0) errs[`item_${i}_price`] = 'Cannot be negative';
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save
  const handleSave = async () => {
    if (!validate()) {
      toast('Please fix the validation errors', 'error');
      return;
    }
    setSaving(true);

    const payload = {
      customerId: customerId,
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      customerAddress: customerAddress || null,
      businessName,
      businessEmail,
      businessPhone: businessPhone || null,
      businessAddress: businessAddress || null,
      issueDate,
      dueDate,
      discountType,
      discountValue: discountType === 'FIXED' ? toMinorUnits(discountValue) : discountValue,
      status,
      notes: notes || null,
      terms: terms || null,
      items: items.map((item) => ({
        description: item.description,
        quantity: Math.max(1, Math.floor(item.quantity)),
        unitPrice: toMinorUnits(item.unitPrice),
        taxRate: Math.max(0, item.taxRate),
      })),
    };

    try {
      // Save business profile to localStorage
      saveBusinessToStorage({
        name: businessName,
        email: businessEmail,
        phone: businessPhone,
        address: businessAddress,
      });

      // Auto-create customer if manually entered without selecting existing
      let resolvedCustomerId = customerId;
      if (!customerId && customerName.trim() && customerEmail.trim()) {
        try {
          const existing = await customerApi.getAll();
          const match = existing.find(
            (c) => c.email.toLowerCase() === customerEmail.trim().toLowerCase()
          );
          if (match) {
            resolvedCustomerId = match.id;
          } else {
            const created = await customerApi.create({
              name: customerName.trim(),
              email: customerEmail.trim(),
              phone: customerPhone || undefined,
              address: customerAddress || undefined,
            });
            resolvedCustomerId = created.id;
            toast('New customer saved to Customers', 'success');
          }
        } catch {}
      }

      const finalPayload = { ...payload, customerId: resolvedCustomerId };

      if (mode === 'edit' && id) {
        await invoiceApi.update(id, finalPayload);
        toast('Invoice updated successfully!', 'success');
        navigate(`/invoices/${id}`);
      } else {
        const created = await invoiceApi.create(finalPayload);
        toast('Invoice created successfully!', 'success');
        navigate(`/invoices/${created.id}`);
      }
    } catch (err: any) {
      toast(err.message || 'Failed to save invoice', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading invoice..." />;

  return (
    <div className="max-w-5xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="hover:opacity-60 transition-opacity cursor-pointer">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <h1 className="text-2xl lg:text-3xl font-extrabold uppercase tracking-tight">
            {mode === 'edit' ? 'Edit Invoice' : 'Create Invoice'}
          </h1>
        </div>
        <div className="flex gap-3">
          <BrutalButton variant="secondary" size="sm" onClick={() => navigate(-1)}>
            Cancel
          </BrutalButton>
          <BrutalButton variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            <Save size={14} strokeWidth={3} />
            {saving ? 'Saving...' : 'Save Invoice'}
          </BrutalButton>
        </div>
      </div>

      {/* ─── Invoice Paper Canvas ─── */}
      <BrutalCard className="bg-white shadow-brutal-lg border-3 border-black">
        <div className="p-6 lg:p-10">
          {/* Invoice Header */}
          <div className="text-center mb-8 border-b-2 border-black pb-6">
            <h2 className="text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-brand-purple">
              INVOICE
            </h2>
          </div>

          {/* ─── From / Bill To ─── */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* FROM */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-4 border-b border-neutral-200 pb-2">
                From
              </h3>
              {getSavedBusinesses().length > 0 && (
                <div className="mb-3">
                  <BrutalSelect label="Saved Businesses" onChange={(e) => handleBusinessSelect(e.target.value)} defaultValue="">
                    <option value="">— Select Saved —</option>
                    {getSavedBusinesses().map((b, i) => (
                      <option key={i} value={i}>{b.name}</option>
                    ))}
                  </BrutalSelect>
                </div>
              )}
              <div className="space-y-3">
                <BrutalInput
                  label="Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  error={errors.businessName}
                />
                <BrutalInput
                  label="Email"
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  error={errors.businessEmail}
                />
                <BrutalInput
                  label="Phone"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                />
                <BrutalInput
                  label="Address"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                />
              </div>
            </div>

            {/* BILL TO */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-4 border-b border-neutral-200 pb-2">
                Bill To
              </h3>
              {customers.length > 0 && (
                <div className="mb-3">
                  <BrutalSelect
                    label="Select Customer"
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    value={customerId || ''}
                  >
                    <option value="">— Select Existing —</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </BrutalSelect>
                </div>
              )}
              <div className="space-y-3">
                <BrutalInput
                  label="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  error={errors.customerName}
                />
                <BrutalInput
                  label="Email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  error={errors.customerEmail}
                />
                <BrutalInput
                  label="Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <BrutalInput
                  label="Address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ─── Invoice Info ─── */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8 pb-6 border-b-2 border-black">
            <BrutalInput
              label="Issue Date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
            <BrutalInput
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              error={errors.dueDate}
            />
            <BrutalSelect
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="DRAFT">Draft</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PAID">Paid</option>
            </BrutalSelect>
          </div>

          {/* ─── Line Items ─── */}
          <div className="mb-8">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-4">
              Line Items
            </h3>

            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-[1fr_80px_120px_80px_120px_40px] gap-2 mb-2 px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">Description</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">Qty</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">Rate</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500">Tax %</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 text-right">Amount</span>
              <span />
            </div>

            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[1fr_80px_120px_80px_120px_40px] gap-2 mb-3 p-3 border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
              >
                <div>
                  <input
                    placeholder="Item description..."
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className={`w-full px-3 py-2 text-sm font-medium bg-white border-2 ${
                      errors[`item_${index}_desc`] ? 'border-brand-coral' : 'border-black'
                    } focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-none`}
                  />
                  {errors[`item_${index}_desc`] && (
                    <span className="text-[10px] font-bold text-red-600">{errors[`item_${index}_desc`]}</span>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    className={`w-full px-2 py-2 text-sm font-bold bg-white border-2 ${
                      errors[`item_${index}_qty`] ? 'border-brand-coral' : 'border-black'
                    } focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-none tabular-nums text-center`}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className={`w-full px-2 py-2 text-sm font-bold bg-white border-2 ${
                      errors[`item_${index}_price`] ? 'border-brand-coral' : 'border-black'
                    } focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-none tabular-nums`}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    value={item.taxRate}
                    onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-2 text-sm font-bold bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-none tabular-nums text-center"
                  />
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-sm font-extrabold tabular-nums">
                    {formatCurrency(calc.items[index]?.lineTotalMinor || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                    className="p-1 text-neutral-400 hover:text-brand-coral transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remove item"
                  >
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}

            <BrutalButton variant="secondary" size="sm" onClick={addItem} className="mt-2">
              <Plus size={14} strokeWidth={3} />
              Add Item
            </BrutalButton>
          </div>

          {/* ─── Discount ─── */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <BrutalSelect
              label="Discount Type"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount ($)</option>
            </BrutalSelect>
            <BrutalInput
              label={discountType === 'PERCENTAGE' ? 'Discount (%)' : 'Discount ($)'}
              type="number"
              min={0}
              step={discountType === 'PERCENTAGE' ? '1' : '0.01'}
              value={discountValue}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* ─── Summary ─── */}
          <div className="flex justify-end mb-8">
            <div className="w-full sm:w-80">
              <div className="border-t-2 border-black pt-4 space-y-2">
                <SummaryRow label="Subtotal" value={formatCurrency(calc.subtotalMinor)} />
                {calc.discountAmountMinor > 0 && (
                  <SummaryRow label="Discount" value={`- ${formatCurrency(calc.discountAmountMinor)}`} accent="coral" />
                )}
                <SummaryRow label="Tax" value={formatCurrency(calc.taxTotalMinor)} />
                <div className="border-t-3 border-black pt-3 mt-3">
                  <div className="bg-brand-purple text-white p-4 border-2 border-black shadow-brutal-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold uppercase tracking-widest">Total</span>
                      <span className="text-2xl font-extrabold tabular-nums">
                        {formatCurrency(calc.totalMinor)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Notes & Terms ─── */}
          <div className="grid md:grid-cols-2 gap-6 border-t-2 border-black pt-6">
            <BrutalTextarea
              label="Notes"
              placeholder="Add notes for the client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <BrutalTextarea
              label="Terms & Conditions"
              placeholder="Payment terms..."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </BrutalCard>

      {/* ─── Bottom actions ─── */}
      <div className="flex justify-end gap-3 mt-6 mb-12">
        <BrutalButton variant="secondary" size="md" onClick={() => navigate(-1)}>
          Cancel
        </BrutalButton>
        <BrutalButton variant="primary" size="md" onClick={handleSave} disabled={saving}>
          <Save size={16} strokeWidth={3} />
          {saving ? 'Saving...' : mode === 'edit' ? 'Update Invoice' : 'Save Invoice'}
        </BrutalButton>
      </div>
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">{label}</span>
    <span
      className={`text-sm font-extrabold tabular-nums ${
        accent === 'coral' ? 'text-brand-coral' : ''
      }`}
    >
      {value}
    </span>
  </div>
);

export default InvoiceEditor;
