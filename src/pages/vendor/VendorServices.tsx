import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Truck,
  Home,
  DollarSign,
  Sparkles,
  Shield,
  Camera,
  Users,
  Calculator,
  FileText,
  Star,
  Phone,
  MessageSquare,
  Plus,
  Edit,
  Trash,
  Search,
  Filter
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const VendorServices = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  const serviceCategories = [
    { id: "moving", name: "Moving & Packing", icon: Truck, color: "text-blue-600" },
    { id: "interior", name: "Interior Design", icon: Home, color: "text-green-600" },
    { id: "loan", name: "Home Loans", icon: DollarSign, color: "text-purple-600" },
    { id: "cleaning", name: "Cleaning Services", icon: Sparkles, color: "text-pink-600" },
    { id: "insurance", name: "Property Insurance", icon: Shield, color: "text-orange-600" },
    { id: "photography", name: "Photography", icon: Camera, color: "text-indigo-600" },
    { id: "legal", name: "Legal Services", icon: FileText, color: "text-red-600" },
    { id: "consultation", name: "Property Consultation", icon: Users, color: "text-teal-600" }
  ];

  const myServices = [
    {
      id: 1,
      title: "Professional Moving Services",
      category: "moving",
      description: "Complete packing and moving solutions for residential properties",
      price: "₹8,000 - ₹25,000",
      rating: 4.8,
      reviews: 156,
      orders: 89,
      status: "active",
      provider: "MoveMaster Pro",
      commission: "15%",
      features: [
        "Packing materials included",
        "Insurance coverage",
        "Professional team",
        "Same day service available"
      ]
    },
    {
      id: 2,
      title: "Home Interior Design",
      category: "interior",
      description: "Complete interior design solutions for modern homes",
      price: "₹50,000 - ₹5,00,000",
      rating: 4.9,
      reviews: 203,
      orders: 45,
      status: "active",
      provider: "Design Studio Elite",
      commission: "20%",
      features: [
        "3D design visualization",
        "Material sourcing",
        "Project management",
        "1 year warranty"
      ]
    },
    {
      id: 3,
      title: "Home Loan Assistance",
      category: "loan",
      description: "Expert guidance for home loan approvals and best rates",
      price: "₹5,000 - ₹15,000",
      rating: 4.7,
      reviews: 89,
      orders: 67,
      status: "active",
      provider: "LoanPro Advisors",
      commission: "25%",
      features: [
        "Bank partner network",
        "Document assistance",
        "Rate comparison",
        "Fast approval process"
      ]
    },
    {
      id: 4,
      title: "Deep Cleaning Services",
      category: "cleaning",
      description: "Professional deep cleaning for new and existing homes",
      price: "₹2,000 - ₹8,000",
      rating: 4.6,
      reviews: 124,
      orders: 156,
      status: "paused",
      provider: "CleanPro Services",
      commission: "18%",
      features: [
        "Eco-friendly products",
        "Trained professionals",
        "Equipment included",
        "Satisfaction guarantee"
      ]
    }
  ];

  const availableServices = [
    {
      id: 5,
      title: "Property Insurance Plans",
      category: "insurance",
      description: "Comprehensive insurance coverage for residential properties",
      price: "₹10,000 - ₹50,000/year",
      rating: 4.5,
      reviews: 78,
      provider: "SecureHome Insurance",
      commission: "22%",
      features: [
        "Natural disaster coverage",
        "Theft protection",
        "Liability coverage",
        "24/7 claims support"
      ]
    },
    {
      id: 6,
      title: "Real Estate Photography",
      category: "photography",
      description: "Professional property photography and virtual tours",
      price: "₹3,000 - ₹12,000",
      rating: 4.9,
      reviews: 234,
      provider: "PhotoPro Studios",
      commission: "30%",
      features: [
        "HDR photography",
        "Virtual tour creation",
        "Drone shots available",
        "Same day delivery"
      ]
    },
    {
      id: 7,
      title: "Legal Documentation",
      category: "legal",
      description: "Complete legal assistance for property transactions",
      price: "₹15,000 - ₹75,000",
      rating: 4.8,
      reviews: 145,
      provider: "LegalEase Associates",
      commission: "20%",
      features: [
        "Document verification",
        "Registration assistance",
        "Title clearance",
        "Expert legal advice"
      ]
    }
  ];

  const serviceStats = {
    totalServices: myServices.length,
    activeServices: myServices.filter(s => s.status === "active").length,
    totalOrders: myServices.reduce((sum, service) => sum + service.orders, 0),
    totalRevenue: "₹2,45,000",
    avgRating: "4.7"
  };

  const filteredMyServices = myServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredAvailableServices = availableServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = serviceCategories.find(cat => cat.id === categoryId);
    return category ? category.icon : Users;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = serviceCategories.find(cat => cat.id === categoryId);
    return category ? category.color : "text-gray-600";
  };

  const getCategoryName = (categoryId: string) => {
    const category = serviceCategories.find(cat => cat.id === categoryId);
    return category ? category.name : "Other";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Value-Added Services</h1>
          <p className="text-muted-foreground">Offer additional services to your property clients</p>
        </div>
        <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service-title">Service Title</Label>
                  <Input id="service-title" placeholder="Enter service title" />
                </div>
                <div>
                  <Label htmlFor="service-category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="service-description">Description</Label>
                <Textarea id="service-description" placeholder="Describe your service" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service-price">Price Range</Label>
                  <Input id="service-price" placeholder="₹0 - ₹0" />
                </div>
                <div>
                  <Label htmlFor="service-commission">Commission (%)</Label>
                  <Input id="service-commission" placeholder="15%" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddServiceOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddServiceOpen(false)}>
                  Add Service
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{serviceStats.totalServices}</div>
            <div className="text-sm text-muted-foreground">Total Services</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{serviceStats.activeServices}</div>
            <div className="text-sm text-muted-foreground">Active Services</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{serviceStats.totalOrders}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{serviceStats.totalRevenue}</div>
            <div className="text-sm text-muted-foreground">Revenue Earned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{serviceStats.avgRating}</div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-services">My Services ({myServices.length})</TabsTrigger>
          <TabsTrigger value="marketplace">Service Marketplace ({availableServices.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders & Bookings</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {serviceCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="my-services" className="space-y-4">
          {filteredMyServices.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMyServices.map((service) => {
                const CategoryIcon = getCategoryIcon(service.category);
                return (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-muted`}>
                            <CategoryIcon className={`w-5 h-5 ${getCategoryColor(service.category)}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{service.title}</h3>
                            <p className="text-sm text-muted-foreground">{getCategoryName(service.category)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={service.status === "active" ? "default" : "secondary"}>
                            {service.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{service.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Price Range</p>
                          <p className="font-semibold">{service.price}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Commission</p>
                          <p className="font-semibold text-green-600">{service.commission}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Orders</p>
                          <p className="font-semibold">{service.orders}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                            <span className="font-semibold">{service.rating}</span>
                            <span className="text-xs text-muted-foreground ml-1">({service.reviews})</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {service.features.slice(0, 2).map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">by {service.provider}</p>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Messages
                          </Button>
                          <Button size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
                <p className="text-muted-foreground mb-4">Start offering value-added services to your clients</p>
                <Button onClick={() => setIsAddServiceOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Service
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAvailableServices.map((service) => {
              const CategoryIcon = getCategoryIcon(service.category);
              return (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className={`p-2 rounded-lg bg-muted`}>
                        <CategoryIcon className={`w-5 h-5 ${getCategoryColor(service.category)}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{service.title}</h3>
                        <p className="text-sm text-muted-foreground">{getCategoryName(service.category)}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{service.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Price Range</p>
                        <p className="font-semibold">{service.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Commission</p>
                        <p className="font-semibold text-green-600">{service.commission}</p>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                      <span className="font-semibold">{service.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">({service.reviews} reviews)</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {service.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">by {service.provider}</p>
                      <Button size="sm">
                        Add to My Services
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardContent className="p-12 text-center">
              <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground">Service orders and bookings will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorServices;