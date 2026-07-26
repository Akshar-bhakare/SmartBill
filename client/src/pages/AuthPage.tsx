import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BrutalButton } from '../components/ui/BrutalButton';
import { BrutalInput } from '../components/ui/BrutalInput';
import { useToast } from '../components/ui/Toast';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('One number');
    if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('One special character (!@#$%^&*)');
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setValidationErrors({});

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
      const payload = isSignUp ? { name, email, password } : { email, password };
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          const errors: Record<string, string> = {};
          result.errors.forEach((err: any) => {
            errors[err.field] = err.message;
          });
          setValidationErrors(errors);
          const firstError = result.errors[0]?.message || result.message || 'Validation failed';
          throw new Error(firstError);
        }
        throw new Error(result.message || 'Authentication failed');
      }

      localStorage.setItem('smartbill_token', result.data.token);
      localStorage.setItem('smartbill_user', JSON.stringify(result.data.user));
      toast(isSignUp ? 'Account created successfully' : 'Signed in successfully', 'success');
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordErrors = password ? validatePassword(password) : [];
  const isPasswordValid = passwordErrors.length === 0;

  return (
    <div className="min-h-screen bg-brand-cyan flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-bold mb-4 hover:opacity-70 transition-opacity cursor-pointer"
        >
          <ArrowLeft size={16} strokeWidth={2.5} /> Back to Home
        </button>
      <div className="border-2 border-black bg-white p-8 shadow-brutal-md">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-purple">SmartBill</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isSignUp
              ? 'Start managing invoices with a secure account.'
              : 'Sign in to manage your billing workspace.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <BrutalInput
              label="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alex Carter"
              error={validationErrors.name}
              required
            />
          )}

          <BrutalInput
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            error={validationErrors.email}
            required
          />

          <div>
            <BrutalInput
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a strong password"
              error={validationErrors.password}
              required
            />
            {isSignUp && password && (
              <div className="mt-2 text-xs space-y-1">
                <p className="font-bold text-slate-600">Password must include:</p>
                {passwordErrors.map((error) => (
                  <div key={error} className="text-red-600 flex items-center gap-2">
                    <span className="inline-block w-4 text-center">×</span> {error}
                  </div>
                ))}
              </div>
            )}
          </div>

          <BrutalButton type="submit" fullWidth disabled={isSubmitting || (isSignUp && !isPasswordValid)}>
            {isSubmitting ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </BrutalButton>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignUp((prev) => !prev);
            setValidationErrors({});
          }}
          className="mt-4 text-sm font-bold text-brand-purple underline"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </div>
      </div>
    </div>
  );
};

export default AuthPage;
