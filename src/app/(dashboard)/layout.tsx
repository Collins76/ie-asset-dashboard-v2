'use client';

import { useCallback } from 'react';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import Sidebar from '@/components/ui/Sidebar';
import FilterBar from '@/components/filters/FilterBar';
import { DashboardProvider, useDashboard } from '@/lib/store';
import { generateCSV } from '@/lib/data';

function ResetButton() {
  const { resetFilters } = useDashboard();
  return (
    <button className="btn btn-danger" onClick={resetFilters} title="Reset all filters">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <style>{`@keyframes spin-reset{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
      Reset
    </button>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  if (!session?.user) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {session.user.image && (
        <img src={session.user.image} alt="" width={28} height={28} style={{ borderRadius: '50%', border: '2px solid rgba(255,255,255,.1)' }} />
      )}
      <span style={{ fontSize: 11, color: '#94a3b8', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {session.user.name || session.user.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="btn btn-secondary"
        style={{ fontSize: 10, padding: '4px 10px' }}
      >
        Sign Out
      </button>
    </div>
  );
}

function DashboardHeader() {
  const { filteredData, allData } = useDashboard();
  const ts = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleCSV = useCallback(() => {
    const csv = generateCSV(filteredData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ie_transformers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredData]);

  return (
    <div style={{
      background: 'rgba(15,23,42,.98)',
      borderBottom: '1px solid rgba(255,255,255,.06)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1600,
        margin: '0 auto',
        padding: '13px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        {/* Left: Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Image src="/ie-logo.png" alt="IE Logo" width={40} height={40} style={{ borderRadius: 10 }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#E2E8F0', letterSpacing: '-.3px' }}>
              Grid Intelligence Dashboard
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>
              Distribution Transformer Network &middot; IE Electricity
            </div>
          </div>
        </div>

        {/* Right: Timestamp + Export Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{
            fontSize: 11, color: '#334155',
            background: 'rgba(255,255,255,.04)',
            padding: '5px 12px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,.06)',
          }}>
            🕐 {ts}
          </div>
          <button className="btn btn-secondary" onClick={handleCSV}>⬇ CSV</button>
          <button className="btn btn-pdf">📄 PDF Report</button>
          <ResetButton />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-[260px] min-w-0">
        <DashboardHeader />
        <FilterBar />
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 24px 24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardContent>{children}</DashboardContent>
    </DashboardProvider>
  );
}
