import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserTable from "@/components/adminpanel/users/UserTable";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Users = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row justify-between items-start sm:items-center gap-4'}`}>
        <div>
          <h1 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Users</h1>
          <p className="text-muted-foreground mt-1">View and manage system users</p>
        </div>
        <Button onClick={() => navigate("/v2/admin/users/add")} className={isMobile ? 'w-full' : ''}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-card rounded-lg border p-4 md:p-6">
        <div className="mb-6">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${isMobile ? 'w-full' : 'max-w-md'}`}
          />
        </div>

        <UserTable searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default Users;
