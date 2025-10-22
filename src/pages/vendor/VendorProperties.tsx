import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Users,
  Calendar,
  Star,
  MapPin,
  MoreVertical,
  TrendingUp,
  Camera
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

const VendorProperties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const properties = [
    {
      id: 1,
      title: "Luxury 3BHK Apartment in Powai",
      location: "Powai, Mumbai, Maharashtra",
      price: "₹1.2 Cr",
      type: "apartment",
      status: "active",
      bedrooms: 3,
      bathrooms: 2,
      area: "1450 sqft",
      images: 12,
      views: 234,
      leads: 12,
      favorites: 8,
      rating: 4.5,
      listedDate: "2024-10-15",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&h=200&fit=crop&auto=format",
      featured: true,
      verified: true
    },
    {
      id: 2,
      title: "Modern Villa with Private Garden",
      location: "Whitefield, Bangalore, Karnataka",
      price: "₹2.5 Cr",
      type: "villa",
      status: "pending",
      bedrooms: 4,
      bathrooms: 3,
      area: "2800 sqft",
      images: 18,
      views: 156,
      leads: 8,
      favorites: 15,
      rating: 4.8,
      listedDate: "2024-10-12",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop&auto=format",
      featured: false,
      verified: true
    },
    {
      id: 3,
      title: "Commercial Office Space",
      location: "Cyber City, Gurgaon, Haryana",
      price: "₹45 Lac",
      type: "commercial",
      status: "active",
      bedrooms: 0,
      bathrooms: 2,
      area: "1200 sqft",
      images: 8,
      views: 89,
      leads: 5,
      favorites: 3,
      rating: 4.2,
      listedDate: "2024-10-08",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop&auto=format",
      featured: true,
      verified: false
    },
    {
      id: 4,
      title: "Budget 2BHK Flat",
      location: "Thane West, Mumbai, Maharashtra",
      price: "₹65 Lac",
      type: "apartment",
      status: "sold",
      bedrooms: 2,
      bathrooms: 1,
      area: "850 sqft",
      images: 5,
      views: 432,
      leads: 28,
      favorites: 22,
      rating: 4.1,
      listedDate: "2024-09-25",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop&auto=format",
      featured: false,
      verified: true
    }
  ];

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    const matchesType = typeFilter === "all" || property.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "sold": return "bg-blue-500";
      case "rented": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground">Manage and track your property listings</p>
        </div>
        <Link to="/vendor/properties/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold">4.5</p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="plot">Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties List */}
      <div className="space-y-4">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Property Image */}
                <div className="lg:w-64 h-48 lg:h-auto bg-muted relative">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent flex items-center justify-center">
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className={`${getStatusColor(property.status)} text-white`}>
                      {getStatusText(property.status)}
                    </Badge>
                    {property.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                    {property.verified && (
                      <Badge className="bg-green-600 text-white">Verified</Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {property.images} photos
                  </div>
                </div>

                {/* Property Details */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{property.title}</h3>
                      <p className="text-muted-foreground flex items-center mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.location}
                      </p>
                      <p className="text-2xl font-bold text-primary">{property.price}</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Promote
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {property.bedrooms > 0 && (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Bedrooms</p>
                        <p className="font-semibold">{property.bedrooms}</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Area</p>
                      <p className="font-semibold">{property.area}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-semibold flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {property.rating}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {property.views} views
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {property.leads} leads
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      {property.favorites} favorites
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Listed {property.listedDate}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Promote
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all" 
                ? "No properties match your search criteria" 
                : "You haven't added any properties yet"
              }
            </p>
            <Link to="/vendor/properties/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorProperties;