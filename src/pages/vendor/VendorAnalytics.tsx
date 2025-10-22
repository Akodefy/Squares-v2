import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Phone,
  MessageSquare,
  DollarSign,
  Calendar,
  Download,
  Filter,
  Home,
  Heart,
  Share
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const VendorAnalytics = () => {
  const [timeframe, setTimeframe] = useState("30days");
  const [propertyFilter, setPropertyFilter] = useState("all");

  const overviewStats = [
    {
      title: "Total Views",
      value: "12,456",
      change: "+15.3%",
      changeType: "increase",
      icon: Eye,
      description: "Property page views"
    },
    {
      title: "Leads Generated",
      value: "234",
      change: "+8.2%",
      changeType: "increase",
      icon: Users,
      description: "This month"
    },
    {
      title: "Phone Calls",
      value: "89",
      change: "-2.1%",
      changeType: "decrease",
      icon: Phone,
      description: "Direct calls"
    },
    {
      title: "Revenue",
      value: "₹2.4L",
      change: "+22.5%",
      changeType: "increase",
      icon: DollarSign,
      description: "Commission earned"
    }
  ];

  const viewsData = [
    { name: "Jan", views: 1200, leads: 45, calls: 23 },
    { name: "Feb", views: 1400, leads: 52, calls: 28 },
    { name: "Mar", views: 1600, leads: 48, calls: 25 },
    { name: "Apr", views: 1800, leads: 61, calls: 32 },
    { name: "May", views: 2200, leads: 58, calls: 29 },
    { name: "Jun", views: 2100, leads: 65, calls: 35 }
  ];

  const propertyPerformance = [
    { name: "Luxury 3BHK Apartment", views: 2340, leads: 45, conversion: 8.2 },
    { name: "Modern Villa", views: 1980, leads: 38, conversion: 6.5 },
    { name: "Commercial Office", views: 1650, leads: 32, conversion: 12.1 },
    { name: "Budget 2BHK Flat", views: 1420, leads: 28, conversion: 5.8 },
    { name: "Luxury Penthouse", views: 980, leads: 18, conversion: 9.2 }
  ];

  const leadSources = [
    { name: "Website", value: 45, color: "#8884d8" },
    { name: "Social Media", value: 25, color: "#82ca9d" },
    { name: "Referrals", value: 20, color: "#ffc658" },
    { name: "Direct Call", value: 10, color: "#ff7300" }
  ];

  const engagementData = [
    { name: "Mon", favorites: 12, shares: 8, inquiries: 5 },
    { name: "Tue", favorites: 19, shares: 12, inquiries: 8 },
    { name: "Wed", favorites: 8, shares: 6, inquiries: 4 },
    { name: "Thu", favorites: 15, shares: 10, inquiries: 7 },
    { name: "Fri", favorites: 22, shares: 15, inquiries: 12 },
    { name: "Sat", favorites: 28, shares: 18, inquiries: 15 },
    { name: "Sun", favorites: 25, shares: 16, inquiries: 11 }
  ];

  const topProperties = [
    {
      name: "Luxury 3BHK Apartment in Powai",
      image: "/api/placeholder/80/60",
      views: 2340,
      leads: 45,
      favorites: 128,
      status: "Active"
    },
    {
      name: "Modern Villa with Private Garden",
      image: "/api/placeholder/80/60",
      views: 1980,
      leads: 38,
      favorites: 95,
      status: "Active"
    },
    {
      name: "Commercial Office Space",
      image: "/api/placeholder/80/60",
      views: 1650,
      leads: 32,
      favorites: 72,
      status: "Sold"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your property performance and marketing insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === "increase" ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${
                      stat.changeType === "increase" ? "text-green-500" : "text-red-500"
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views & Leads Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Views & Leads Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stackId="2" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {leadSources.map((source) => (
                <div key={source.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-sm">{source.name} ({source.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Property Performance</CardTitle>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={propertyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#8884d8" name="Views" />
              <Bar dataKey="leads" fill="#82ca9d" name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="favorites" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Favorites"
                />
                <Line 
                  type="monotone" 
                  dataKey="shares" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Shares"
                />
                <Line 
                  type="monotone" 
                  dataKey="inquiries" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  name="Inquiries"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProperties.map((property, index) => (
                <div key={property.name} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={property.image} 
                      alt={property.name}
                      className="w-16 h-12 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{property.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center text-xs text-muted-foreground">
                        <Eye className="w-3 h-3 mr-1" />
                        {property.views}
                      </span>
                      <span className="flex items-center text-xs text-muted-foreground">
                        <Users className="w-3 h-3 mr-1" />
                        {property.leads}
                      </span>
                      <span className="flex items-center text-xs text-muted-foreground">
                        <Heart className="w-3 h-3 mr-1" />
                        {property.favorites}
                      </span>
                    </div>
                  </div>
                  <Badge 
                    variant={property.status === "Active" ? "default" : "secondary"}
                    className="flex-shrink-0"
                  >
                    {property.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Peak Activity Time</h4>
              <p className="text-sm text-blue-700">
                Most inquiries come between 6-9 PM. Consider posting new properties during this time.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Best Performing Content</h4>
              <p className="text-sm text-green-700">
                Properties with virtual tours get 35% more leads. Add virtual tours to boost performance.
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2">Pricing Strategy</h4>
              <p className="text-sm text-amber-700">
                Your commercial properties have higher conversion rates. Consider focusing more on commercial listings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAnalytics;