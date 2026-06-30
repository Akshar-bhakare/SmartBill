import React, { useEffect, useState } from 'react';
import { Plus, Users, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { BrutalCard } from '../components/ui/BrutalCard';
import { BrutalButton } from '../components/ui/BrutalButton';
import { BrutalInput } from '../components/ui/BrutalInput';
import { LoadingSpinner } from '../components/ui/Loading';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { customerApi } from '../services/customer.api';
import { Customer } from '../types/invoice';

const Customers: React.FC = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCustomers = () => {
    customerApi
      .getAll()
      .then(setCustomers)
      .catch(() => toast('Failed to load customers', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) {
      toast('Name and email are required', 'error');
      return;
    }
    setSaving(true);
    try {
      await customerApi.create({ name, email, phone: phone || undefined, address: address || undefined });
      toast('Customer created!', 'success');
      setName(''); setEmail(''); setPhone(''); setAddress('');
      setShowForm(false);
      fetchCustomers();
    } catch {
      toast('Failed to create customer', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await customerApi.delete(deleteTarget);
      toast('Customer deleted', 'success');
      setDeleteTarget(null);
      fetchCustomers();
    } catch {
      toast('Failed to delete customer', 'error');
    }
  };

  if (loading) return <LoadingSpinner message="Loading customers..." />;

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold uppercase tracking-tight">Customers</h1>
          <p className="text-sm text-neutral-500 font-medium mt-1">
            Manage your client directory.
          </p>
        </div>
        <BrutalButton variant="primary" size="md" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} strokeWidth={3} />
          Add Customer
        </BrutalButton>
      </div>

      {showForm && (
        <BrutalCard className="p-6 mb-6" shadow="md">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-500 mb-4">
            New Customer
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <BrutalInput label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" />
            <BrutalInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@email.com" />
            <BrutalInput label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
            <BrutalInput label="Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Optional" />
          </div>
          <div className="flex gap-3">
            <BrutalButton variant="primary" size="sm" onClick={handleCreate} disabled={saving}>
              {saving ? 'Saving...' : 'Save Customer'}
            </BrutalButton>
            <BrutalButton variant="secondary" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </BrutalButton>
          </div>
        </BrutalCard>
      )}

      {customers.length === 0 ? (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto mb-4 text-neutral-300" strokeWidth={1.5} />
          <h3 className="text-xl font-extrabold uppercase">No customers yet.</h3>
          <p className="mt-2 text-sm text-neutral-500 font-medium">Add your first client to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <BrutalCard key={c.id} className="p-5 flex flex-col justify-between" shadow="sm">
              <div>
                <h3 className="text-base font-extrabold mb-2">{c.name}</h3>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                    <Mail size={12} strokeWidth={2.5} /> {c.email}
                  </p>
                  {c.phone && (
                    <p className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                      <Phone size={12} strokeWidth={2.5} /> {c.phone}
                    </p>
                  )}
                  {c.address && (
                    <p className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                      <MapPin size={12} strokeWidth={2.5} /> {c.address}
                    </p>
                  )}
                </div>
                {c._count && (
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    {c._count.invoices} invoice{c._count.invoices !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200 flex justify-end">
                <button
                  onClick={() => setDeleteTarget(c.id)}
                  className="p-1.5 text-neutral-400 hover:text-brand-coral transition-colors cursor-pointer"
                  title="Delete customer"
                >
                  <Trash2 size={14} strokeWidth={2.5} />
                </button>
              </div>
            </BrutalCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Customer"
        message="This customer will be permanently deleted. Existing invoices referencing this customer will not be affected."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Customers;
