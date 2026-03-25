"use client";

import React, { createContext, useContext, useState } from "react";

interface AdminLayoutContextType {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export function AdminLayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <AdminLayoutContext.Provider 
      value={{ 
        isSidebarOpen, 
        setSidebarOpen: setIsSidebarOpen, 
        toggleSidebar 
      }}
    >
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (context === undefined) {
    throw new Error("useAdminLayout must be used within an AdminLayoutProvider");
  }
  return context;
}
