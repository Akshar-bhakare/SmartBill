import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrutalButton } from '../components/ui/BrutalButton';
import { LogOut, User, Mail } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

interface UserData {
  name: string;
  email: string;
}

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('smartbill_user');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('smartbill_token');
    localStorage.removeItem('smartbill_user');
    toast('Signed out successfully', 'success');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="border-2 border-black bg-white p-8 shadow-brutal-md text-center">
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="border-2 border-black bg-white p-8 shadow-brutal-md text-center">
          <p className="text-neutral-600 mb-4">No user data found. Please sign in again.</p>
          <BrutalButton onClick={() => navigate('/auth')} variant="primary">
            Sign In
          </BrutalButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-2 border-black bg-white p-8 shadow-brutal-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-purple p-3 border-2 border-black">
            <User size={24} strokeWidth={2.5} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight">Account</h1>
        </div>

        <div className="space-y-6">
          <div className="border-l-4 border-brand-purple pl-4 py-2">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-600">Full Name</p>
            <p className="text-lg font-bold text-foreground mt-2">{user.name}</p>
          </div>

          <div className="border-l-4 border-brand-cyan pl-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={14} strokeWidth={2.5} className="text-neutral-600" />
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-600">Email</p>
            </div>
            <p className="text-lg font-bold text-foreground">{user.email}</p>
          </div>

          <div className="pt-6 border-t-2 border-black">
            <BrutalButton
              onClick={handleLogout}
              variant="danger"
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <LogOut size={18} strokeWidth={2.5} />
              Sign Out
            </BrutalButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
