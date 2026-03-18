import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="w-full p-5 lg:p-8">{children}</main>
    </div>
  );
}
