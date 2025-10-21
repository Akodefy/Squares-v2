import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Column, DataTable } from "@/components/adminpanel/shared/DataTable";
import DashboardLayout from "@/components/adminpanel/DashboardLayout";
import { SearchFilter } from "@/components/adminpanel/shared/SearchFilter";
import roleService, { Role } from "@/services/roleService";

const Roles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const filters = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      };

      const response = await roleService.getRoles(filters);
      setRoles(response.data.roles);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [currentPage, searchTerm, statusFilter]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Create extended type for DataTable
  type RoleWithId = Role & { id: string };

  const columns: Column<RoleWithId>[] = [
    { 
      key: "name", 
      label: "Role Name",
      render: (role) => (
        <div>
          <div className="font-medium">{role.name}</div>
          <div className="text-sm text-muted-foreground">
            {role.description}
          </div>
        </div>
      )
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (role) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions.slice(0, 2).map((perm, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {perm}
            </Badge>
          ))}
          {role.permissions.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{role.permissions.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    { 
      key: "userCount", 
      label: "Users",
      render: (role) => (
        <span className="font-medium">
          {role.userCount || 0}
        </span>
      )
    },
    {
      key: "isActive",
      label: "Status",
      render: (role) => (
        <Badge variant={role.isActive ? "default" : "secondary"}>
          {role.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading roles...</span>
      </div>
    );
  }

  return (
      <div className="space-y-6 relative top-[60px]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user roles and permissions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Roles</CardTitle>
            <CardDescription>
              {roles.length} role{roles.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
              filterValue={statusFilter}
              onFilterChange={handleStatusFilter}
              filterOptions={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
              filterPlaceholder="Filter by status"
            />

            <DataTable
              columns={columns}
              data={roles.map(role => ({ ...role, id: role._id }))}
              editPath={(role) => `/admin/roles/edit/${role._id}`}
            />

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={previousPage}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => goToPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={nextPage}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default Roles;
