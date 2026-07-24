import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired')) {
      toast.info('Your session expired. Please log in again.');
    }
  }, [searchParams]);

  const validate = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/feed');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-glow px-4">
      <div className="card w-full max-w-sm p-7">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Sparkles className="h-8 w-8 text-glow" />
          <h1 className="font-display text-2xl font-extrabold">Welcome back</h1>
          <p className="text-sm text-text-muted">Log in to keep the conversation glowing.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="mt-1 text-xs text-bloom">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-text-muted" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <p className="mt-1 text-xs text-bloom">{errors.password}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Log in
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-text-muted">
          New to GlowConnect?{' '}
          <Link to="/register" className="font-semibold text-glow hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
