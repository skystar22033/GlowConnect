import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Loader2, Heart, MessageCircle, Users } from 'lucide-react';
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
    <div className="flex min-h-screen items-center justify-center bg-radial-glow px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-floating md:grid-cols-2">
        {/* Brand / illustration panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-brand p-10 text-white md:flex">
          <span className="absolute -left-16 -top-16 h-56 w-56 animate-float rounded-full bg-white/10 blur-2xl" />
          <span className="absolute -bottom-20 -right-10 h-64 w-64 animate-float rounded-full bg-white/10 blur-2xl [animation-delay:1.5s]" />

          <div className="relative flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            <span className="font-display text-xl font-bold">GlowConnect</span>
          </div>

          <div className="relative space-y-6">
            <h2 className="font-display text-3xl font-bold leading-tight">
              Where your circle stays close.
            </h2>
            <p className="max-w-xs text-sm text-white/80">
              Share moments, follow friends, and keep every conversation glowing.
            </p>
            <div className="flex gap-3 pt-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Heart className="h-5 w-5" />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          <p className="relative text-xs text-white/60">© {new Date().getFullYear()} GlowConnect</p>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div className="mb-7 flex flex-col items-center gap-2 text-center md:items-start md:text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow md:hidden">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl font-extrabold text-text-primary">Welcome back</h1>
            <p className="text-sm text-text-muted">Log in to keep the conversation glowing.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className="mt-1 text-xs text-accent">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && <p className="mt-1 text-xs text-accent">{errors.password}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Log in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted md:text-left">
            New to GlowConnect?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
