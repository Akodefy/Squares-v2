import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePagination } from "@/hooks/usePagination";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Property, propertyService } from "@/services/propertyService";
import { Column, DataTable } from "@/components/adminpanel/shared/DataTable";
import { SearchFilter } from "@/components/adminpanel/shared/SearchFilter";
import { Loader2 } from "lucide-react";

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getProperties({
          limit: 1000, // Get all properties for admin view
        });
        
        if (response.success) {
          setProperties(response.data.properties);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.locality.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || property.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [properties, searchTerm, typeFilter]);

  const { paginatedItems, currentPage, totalPages, goToPage, nextPage, previousPage } =
    usePagination(filteredProperties, 10);

  // Create extended type for DataTable
  type PropertyWithId = Property & { id: string };

  const columns: Column<PropertyWithId>[] = [
    { 
      key: "title", 
      label: "Property Title",
      render: (property) => (
        <div>
          <div className="font-medium">{property.title}</div>
          <div className="text-sm text-muted-foreground">
            {property.address.locality}, {property.address.city}
          </div>
        </div>
      )
    },
    {
      key: "type",
      label: "Type",
      render: (property) => (
        <Badge variant="secondary" className="capitalize">
          {property.type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: "listingType",
      label: "Listing",
      render: (property) => (
        <Badge variant={property.listingType === 'sale' ? 'default' : 'outline'}>
          {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
        </Badge>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (property) => (
        <span className="font-semibold">
          {propertyService.formatPrice(property.price, property.listingType)}
        </span>
      ),
    },
    {
      key: "area",
      label: "Area",
      render: (property) => <span>{propertyService.formatArea(property.area)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (property) => (
        <Badge
          variant={
            property.status === "available"
              ? "default"
              : property.status === "sold"
              ? "secondary"
              : property.status === "rented"
              ? "outline"
              : "destructive"
          }
          className="capitalize"
        >
          {property.status}
        </Badge>
      ),
    },
    {
      key: "verified",
      label: "Verified",
      render: (property) => (
        <Badge variant={property.verified ? "default" : "secondary"}>
          {property.verified ? "Verified" : "Pending"}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading properties...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative top-[60px]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Property Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage property listings and details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Properties</CardTitle>
          <CardDescription>
            {filteredProperties.length} propert{filteredProperties.length !== 1 ? "ies" : "y"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={typeFilter}
            onFilterChange={setTypeFilter}
            filterOptions={[
              { label: "Apartment", value: "apartment" },
              { label: "House", value: "house" },
              { label: "Villa", value: "villa" },
              { label: "Plot", value: "plot" },
              { label: "Commercial", value: "commercial" },
              { label: "Office", value: "office" },
            ]}
            filterPlaceholder="Filter by type"
          />

          <DataTable
            columns={columns}
            data={paginatedItems.map(property => ({ ...property, id: property._id }))}
            editPath={(property) => `/admin/properties/edit/${property._id}`}
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

export default Properties;
