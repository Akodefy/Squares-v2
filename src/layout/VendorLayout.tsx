import { useState } from "react";
import { Outlet } from "react-router-dom";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorNavbar from "@/components/vendor/VendorNavbar";

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <VendorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <VendorNavbar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;