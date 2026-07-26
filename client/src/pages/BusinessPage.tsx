import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Building2 } from 'lucide-react';
import { BrutalCard } from '../components/ui/BrutalCard';
import { BrutalButton } from '../components/ui/BrutalButton';
import { BrutalInput } from '../components/ui/BrutalInput';
import { useToast } from '../components/ui/Toast';

interface BusinessProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const BUSINESS_KEY = 'smartbill_businesses';
const LAST_BUSINESS_KEY = 'smartbill_last_business';

const empty: BusinessProfile = { name: '', email: '', phone: '', address: '' };

const BusinessPage: React.FC = () => {
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [form, setForm] = useState<BusinessProfile>(empty);
  const [errors, setErrors] = useState<Partial<BusinessProfile>>({});

  useEffect(() => {
    try { setBusinesses(JSON.parse(localStorage.getItem(BUSINESS_KEY) || '[]')); } catch {}
  }, []);

  const persist = (updated: BusinessProfile[]) => {
    setBusinesses(updated);
    localStorage.setItem(BUSINESS_KEY, JSON.stringify(updated));
  };

  const handleSetDefault = (b: BusinessProfile) => {
    localStorage.setItem(LAST_BUSINESS_KEY, JSON.stringify(b));
    toast(`"${b.name}" set as default business`, 'success');
  };

  const handleDelete = (idx: number) => {
    const updated = businesses.filter((_, i) => i !== idx);
    persist(updated);
    toast('Business removed', 'success');
  };

  const validate = () => {
    const errs: Partial<BusinessProfile> = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const exists = businesses.findIndex((b) => b.email.toLowerCase() === form.email.toLowerCase());
    const updated = [...businesses];
    if (exists !== -1) updated[exists] = form; else updated.push(form);
    persist(updated);
    setForm(empty);
    toast('Business saved', 'success');
  };

  const defaultBusiness: BusinessProfile | null = (() => {
    try { return JSON.parse(localStorage.getItem(LAST_BUSINESS_KEY) || 'null'); } catch { return null; }
  })();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-extrabold uppercase tracking-tight">Business Profiles</h1>
        <p className="text-sm text-neutral-500 font-medium mt-1">
          Saved businesses auto-fill the "From" section when creating invoices.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add form */}
        <BrutalCard className="p-6">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-neutral-500 mb-5">
            Add / Update Business
          </h2>
          <div className="space-y-3">
            <BrutalInput label="Business Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
            <BrutalInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
            <BrutalInput label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <BrutalInput label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <BrutalButton variant="primary" size="sm" onClick={handleAdd}>
              <Plus size={14} strokeWidth={3} /> Save Business
            </BrutalButton>
          </div>
        </BrutalCard>

        {/* Saved list */}
        <BrutalCard className="p-6">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-neutral-500 mb-5">
            Saved Businesses
          </h2>
          {businesses.length === 0 ? (
            <div className="text-center py-10 text-neutral-400">
              <Building2 size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">No businesses saved yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {businesses.map((b, i) => {
                const isDefault = defaultBusiness?.email === b.email && defaultBusiness?.name === b.name;
                return (
                  <div key={i} className={`p-4 border-2 ${isDefault ? 'border-brand-purple bg-brand-purple/5' : 'border-black'} flex items-start justify-between gap-3`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-extrabold truncate">{b.name}</p>
                        {isDefault && (
                          <span className="text-[9px] font-extrabold uppercase tracking-widest bg-brand-purple text-white px-1.5 py-0.5">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 font-medium truncate">{b.email}</p>
                      {b.phone && <p className="text-xs text-neutral-400 truncate">{b.phone}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!isDefault && (
                        <button
                          onClick={() => handleSetDefault(b)}
                          className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 border-2 border-black hover:bg-brand-green transition-colors cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(i)}
                        className="p-1.5 hover:bg-brand-coral transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </BrutalCard>
      </div>
    </div>
  );
};

export default BusinessPage;
