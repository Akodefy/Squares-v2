import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/usePagination";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plan, planService } from "@/services/planService";
import { Column, DataTable } from "@/components/adminpanel/shared/DataTable";
import { SearchFilter } from "@/components/adminpanel/shared/SearchFilter";
import { Loader2, Plus } from "lucide-react";

const Plans = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [billingFilter, setBillingFilter] = useState("all");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await planService.getPlans({
          limit: 1000, // Get all plans for admin view
        });
        
        if (response.success) {
          setPlans(response.data.plans);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBilling = billingFilter === "all" || plan.billingPeriod === billingFilter;
      return matchesSearch && matchesBilling;
    });
  }, [plans, searchTerm, billingFilter]);

  const { paginatedItems, currentPage, totalPages, goToPage, nextPage, previousPage } =
    usePagination(filteredPlans, 10);

  // Create extended type for DataTable
  type PlanWithId = Plan & { id: string };

  const columns: Column<PlanWithId>[] = [
    { 
      key: "name", 
      label: "Plan Name",
      render: (plan) => (
        <div>
          <div className="font-medium">{plan.name}</div>
          <div className="text-sm text-muted-foreground">
            {plan.description.substring(0, 50)}...
          </div>
        </div>
      )
    },
    {
      key: "price",
      label: "Price",
      render: (plan) => (
        <span className="font-semibold">
          {planService.formatPrice(plan)}
        </span>
      ),
    },
    {
      key: "features",
      label: "Features",
      render: (plan) => {
        const features = Array.isArray(plan.features)
          ? plan.features.map(f => typeof f === 'string' ? f : f.name)
          : [];
        
        return (
          <div className="flex flex-wrap gap-1">
            {features.slice(0, 2).map((feature, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {features.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{features.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    { 
      key: "subscriberCount", 
      label: "Subscribers",
      render: (plan) => (
        <span className="font-medium">
          {plan.subscriberCount || 0}
        </span>
      )
    },
    {
      key: "isActive",
      label: "Status",
      render: (plan) => (
        <Badge variant={planService.getPlanBadgeVariant(plan)}>
          {plan.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading plans...</span>
      </div>
    );
  }

  return (
      <div className="space-y-4 md:space-y-6">
        <div className="dashboard-header-responsive">
          <div>
            <h1 className="dashboard-title-responsive">Plan Management</h1>
            <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
              Manage subscription plans and pricing
            </p>
          </div>
          <Button onClick={() => navigate("/v2/admin/plans/create")} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Create Plan</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">All Plans</CardTitle>
            <CardDescription className="text-sm md:text-base">
              {filteredPlans.length} plan{filteredPlans.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterValue={billingFilter}
                onFilterChange={setBillingFilter}
                filterOptions={[
                  { label: "Monthly", value: "monthly" },
                  { label: "Yearly", value: "yearly" },
                ]}
                filterPlaceholder="Filter by billing"
              />

              <div className="table-responsive-wrapper">
                <DataTable
                  columns={columns}
                  data={paginatedItems.map(plan => ({ ...plan, id: plan._id }))}
                  editPath={(plan) => `/admin/plans/edit/${plan._id}`}
                />
              </div>

              {totalPages > 1 && (
                <div className="mt-4 md:mt-6">
                  <Pagination>
                    <PaginationContent className="pagination-responsive">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={previousPage}
                          className={`pagination-button-responsive ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => goToPage(page)}
                            isActive={currentPage === page}
                            className="pagination-button-responsive cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={nextPage}
                          className={`pagination-button-responsive ${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default Plans;
