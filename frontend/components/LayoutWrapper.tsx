"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { usePathname } from "next/navigation";

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // الصفحات اللي مش هتظهر فيها الـ Sidebar
  const hideSidebar = ["/login", "/register", "/"];
  
  const showSidebar = !hideSidebar.includes(pathname);

  return (
    <div className="flex h-screen">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 overflow-auto ${showSidebar ? "" : "w-full"}`}>
        {children}
      </main>
    </div>
  );
}
