"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";

import { AdminLayoutProvider, useAdminLayout } from "@/components/admin/admin-layout-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, setSidebarOpen } = useAdminLayout();
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <main className="flex-1 min-w-0 overflow-hidden p-5 lg:p-8">
        {children}
      </main>
    </div>
  );
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayoutProvider>
      <DashboardContent>{children}</DashboardContent>
    </AdminLayoutProvider>
  );
}

