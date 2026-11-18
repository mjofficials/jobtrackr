import { Sidebar } from '@/components/layout/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="px-4 py-8 md:ml-64 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
