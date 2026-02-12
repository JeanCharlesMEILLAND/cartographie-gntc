'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Email ou mot de passe incorrect');
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="glass-panel rounded-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-lg font-display font-bold text-text">Administration</h1>
          <p className="text-xs text-muted mt-1">Transport Combine 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-muted uppercase tracking-wider mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-sm bg-[rgba(10,15,30,0.6)] border border-border rounded-md px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:border-blue/50"
              placeholder="admin@gntc.fr"
            />
          </div>

          <div>
            <label className="text-[10px] text-muted uppercase tracking-wider mb-1 block">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-sm bg-[rgba(10,15,30,0.6)] border border-border rounded-md px-3 py-2 text-text placeholder:text-muted focus:outline-none focus:border-blue/50"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-sm py-2.5 rounded-md bg-blue/20 text-blue hover:bg-blue/30 border border-blue/30 transition-colors disabled:opacity-40 font-medium"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-[10px] text-muted hover:text-blue transition-colors">
            Retour a la carte
          </a>
        </div>
      </div>
    </div>
  );
}
