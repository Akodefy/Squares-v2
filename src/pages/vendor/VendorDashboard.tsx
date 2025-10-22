import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Eye,
  MessageSquare,
  TrendingUp,
  Calendar,
  Plus,
  Star,
  DollarSign,
  BarChart3,
  Clock
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const VendorDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d");

  const stats = [
    {
      title: "Total Properties",
      value: "24",
      change: "+3 this week",
      icon: Building2,
      color: "text-blue-600"
    },
    {
      title: "Active Leads",
      value: "156",
      change: "+12 today",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Property Views",
      value: "2,847",
      change: "+18% this week",
      icon: Eye,
      color: "text-purple-600"
    },
    {
      title: "Messages",
      value: "42",
      change: "8 unread",
      icon: MessageSquare,
      color: "text-orange-600"
    }
  ];

  const recentProperties = [
    {
      id: 1,
      title: "Luxury 3BHK Apartment",
      location: "Bandra West, Mumbai",
      price: "₹1.2 Cr",
      status: "active",
      views: 234,
      leads: 12,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&h=80&fit=crop&auto=format"
    },
    {
      id: 2,
      title: "Modern Villa with Garden",
      location: "Whitefield, Bangalore",
      price: "₹2.5 Cr",
      status: "pending",
      views: 156,
      leads: 8,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=80&fit=crop&auto=format"
    },
    {
      id: 3,
      title: "Commercial Office Space",
      location: "Cyber City, Gurgaon",
      price: "₹45 Lac",
      status: "active",
      views: 89,
      leads: 5,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=80&fit=crop&auto=format"
    }
  ];

  const leadData = [
    { name: "Mon", leads: 12, views: 240 },
    { name: "Tue", leads: 8, views: 180 },
    { name: "Wed", leads: 15, views: 320 },
    { name: "Thu", leads: 22, views: 450 },
    { name: "Fri", leads: 18, views: 380 },
    { name: "Sat", leads: 25, views: 520 },
    { name: "Sun", leads: 20, views: 420 }
  ];

  const recentLeads = [
    {
      id: 1,
      name: "Rahul Sharma",
      property: "Luxury 3BHK Apartment",
      contact: "+91 98765 43210",
      interest: "High",
      time: "2 hours ago"
    },
    {
      id: 2,
      name: "Priya Patel",
      property: "Modern Villa with Garden",
      contact: "+91 87654 32109",
      interest: "Medium",
      time: "4 hours ago"
    },
    {
      id: 3,
      name: "Amit Kumar",
      property: "Commercial Office Space",
      contact: "+91 76543 21098",
      interest: "High",
      time: "6 hours ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "sold": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getInterestColor = (interest: string) => {
    switch (interest) {
      case "High": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "Low": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your properties and track your performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Leads & Views Performance
              <div className="flex gap-2">
                {["7d", "30d", "90d"].map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={leadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                <Area type="monotone" dataKey="leads" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Leads
              <Button variant="ghost" size="sm">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.property}</p>
                      <p className="text-xs text-muted-foreground">{lead.contact}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getInterestColor(lead.interest)}>{lead.interest}</Badge>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {lead.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Properties
            <Button variant="ghost" size="sm">View All</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-32 object-cover"
                  />
                  <Badge className={`absolute top-2 right-2 ${getStatusColor(property.status)} text-white`}>
                    {property.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{property.location}</p>
                  <p className="text-lg font-bold text-primary mb-3">{property.price}</p>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {property.views} views
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {property.leads} leads
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;