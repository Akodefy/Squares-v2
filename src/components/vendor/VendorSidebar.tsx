import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DynamicSidebar from "@/components/common/DynamicSidebar";

interface VendorSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const VendorSidebar = ({ sidebarOpen, setSidebarOpen }: VendorSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>

      <div className={cn(
        "lg:block",
        sidebarOpen ? "block" : "hidden"
      )}>
        <DynamicSidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
      </div>
    </>
  );
};

export default VendorSidebar;