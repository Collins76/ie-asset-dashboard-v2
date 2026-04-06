'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(6,182,212,.2)}50%{box-shadow:0 0 40px rgba(6,182,212,.4)}}
      `}</style>
      <div style={{ width: '100%', maxWidth: 380, animation: 'fadeUp .5s ease both' }}>
        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <Image src="/ie-logo.png" alt="IE Logo" width={56} height={56} style={{ borderRadius: 12, margin: '0 auto 20px', display: 'block' }} />
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#E2E8F0', marginBottom: 4 }}>Grid Intelligence Dashboard</h1>
          <p style={{ fontSize: 12, color: '#475569', marginBottom: 32 }}>Distribution Transformer Analytics</p>

          <button
            onClick={() => signIn('google', { callbackUrl: '/executive-summary' })}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500, color: 'white', cursor: 'pointer',
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
              transition: 'all .2s',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <p style={{ fontSize: 10, color: '#334155', marginTop: 24 }}>
            Access restricted to authorized personnel
          </p>
        </div>
      </div>
    </div>
  );
}
