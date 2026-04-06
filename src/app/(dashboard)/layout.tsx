'use client';

import Sidebar from '@/components/ui/Sidebar';
import FilterBar from '@/components/filters/FilterBar';
import { DashboardProvider } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-[260px] min-w-0">
          <FilterBar />
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </DashboardProvider>
  );
}
