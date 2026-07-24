import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
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
      navigate('/feed');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, type = 'text') => (
    <div>
      <label className="mb-1 block text-sm text-text-muted" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        type={type}
        className="input-field"
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      />
      {errors[name] && <p className="mt-1 text-xs text-bloom">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-glow px-4 py-10">
      <div className="card w-full max-w-sm p-7">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Sparkles className="h-8 w-8 text-glow" />
          <h1 className="font-display text-2xl font-extrabold">Join GlowConnect</h1>
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

        <p className="mt-5 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-glow hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
