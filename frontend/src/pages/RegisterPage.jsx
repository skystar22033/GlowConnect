import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Image as ImageIcon, ThumbsUp, Sparkle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(form.username))
      next.username = '3-30 characters: letters, numbers, underscores, dots only';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters';
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(form);
      // ✅ FIX: Redirect to LOGIN page, NOT feed
      navigate('/login');
      toast.success('Account created! Please login.');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, type = 'text') => (
    <div>
      <label className="mb-1 block text-sm font-medium text-text-secondary" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        type={type}
        className="input-field"
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      />
      {errors[name] && <p className="mt-1 text-xs text-accent">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-glow px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-floating md:grid-cols-2">
        {/* Brand / illustration panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-brand p-10 text-white md:flex">
          <span className="absolute -left-10 -top-20 h-56 w-56 animate-float rounded-full bg-white/10 blur-2xl" />
          <span className="absolute -bottom-16 -right-16 h-64 w-64 animate-float rounded-full bg-white/10 blur-2xl [animation-delay:1.2s]" />

          <div className="relative flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            <span className="font-display text-xl font-bold">GlowConnect</span>
          </div>

          <div className="relative space-y-6">
            <h2 className="font-display text-3xl font-bold leading-tight">
              Join a feed that feels like you.
            </h2>
            <p className="max-w-xs text-sm text-white/80">
              Post, comment, and follow the people who matter — all in one glowing place.
            </p>
            <div className="flex gap-3 pt-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <ThumbsUp className="h-5 w-5" />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Sparkle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <p className="relative text-xs text-white/60">© {new Date().getFullYear()} GlowConnect</p>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div className="mb-6 flex flex-col items-center gap-2 text-center md:items-start md:text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow md:hidden">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl font-extrabold text-text-primary">Join GlowConnect</h1>
            <p className="text-sm text-text-muted">Create your account in a few seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {field('fullName', 'Full name')}
            {field('username', 'Username')}
            {field('email', 'Email', 'email')}
            {field('password', 'Password', 'password')}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted md:text-left">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
