import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MessageSquare, User, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

interface Customer {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    address?: {
      city?: string;
      state?: string;
    };
    preferences?: {
      privacy?: {
        allowMessages?: boolean;
      };
    };
  };
  status: string;
}

const CustomerDirectory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchCustomers();
  }, [page, debouncedSearch]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        role: "customer",
        status: "active"
      });
      
      if (debouncedSearch) {
        queryParams.append("search", debouncedSearch);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data.users);
        setTotalPages(data.data.pagination.totalPages);
        setTotalCustomers(data.data.pagination.totalUsers);
      } else {
        throw new Error("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessageCustomer = (customer: Customer) => {
    navigate("/vendor/messages", {
      state: {
        recipientId: customer._id,
        recipientName: `${customer.profile.firstName} ${customer.profile.lastName}`,
      },
    });
  };

  const canMessageCustomer = (customer: Customer) => {
    return customer.profile?.preferences?.privacy?.allowMessages !== false;
  };

  const getCustomerInitials = (customer: Customer) => {
    return `${customer.profile.firstName?.[0] || ""}${customer.profile.lastName?.[0] || ""}`;
  };

  return (
    <div className="space-y-6 pt-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <User className="w-8 h-8 text-primary" />
          Customer Directory
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse and connect with potential customers
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Customers ({totalCustomers})</CardTitle>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? "No customers found matching your search" : "No customers available"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((customer) => (
                  <Card key={customer._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={customer.profile.avatar} />
                          <AvatarFallback>{getCustomerInitials(customer)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">
                              {customer.profile.firstName} {customer.profile.lastName}
                            </h3>
                            <Badge variant={canMessageCustomer(customer) ? "default" : "secondary"} className="text-xs">
                              {canMessageCustomer(customer) ? "Available" : "Private"}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                            
                            {customer.profile.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <span>{customer.profile.phone}</span>
                              </div>
                            )}
                            
                            {customer.profile.address?.city && (
                              <div className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                  {customer.profile.address.city}
                                  {customer.profile.address.state && `, ${customer.profile.address.state}`}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3">
                            {canMessageCustomer(customer) ? (
                              <Button
                                size="sm"
                                variant="default"
                                className="w-full"
                                onClick={() => handleMessageCustomer(customer)}
                              >
                                <MessageSquare className="w-3 h-3 mr-2" />
                                Send Message
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                disabled
                              >
                                <MessageSquare className="w-3 h-3 mr-2" />
                                Messages Disabled
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDirectory;
