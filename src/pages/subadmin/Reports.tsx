import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Download, TrendingUp, Users, Building, Eye, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth, handleApiResponse } from "@/utils/apiUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportData {
  propertyStats: {
    total: number;
    available: number;
    pending: number;
    rejected: number;
  };
  userStats: {
    totalVendors: number;
    totalCustomers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  };
  engagementStats: {
    totalViews: number;
    totalMessages: number;
    totalReviews: number;
    averageRating: number;
  };
  supportStats: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    avgResolutionTime: number;
  };
}

const Reports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30days");
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`/subadmin/reports?range=${dateRange}`);
      const data = await handleApiResponse<{ data: ReportData }>(response);
      setReportData(data.data || null);
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: error.message || "Error fetching report data",
        variant: "destructive",
      });
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (type: string) => {
    try {
      toast({
        title: "Exporting",
        description: `Generating ${type} report...`,
      });

      const response = await fetchWithAuth(`/subadmin/reports/export?type=${type}&range=${dateRange}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buildhomemartsquares_${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Report exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error exporting report",
        variant: "destructive",
      });
    }
  };

  if (loading || !reportData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analytics and insights dashboard
          </p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analytics and insights dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExportReport('full')}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.propertyStats.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-xs text-green-600">
                {reportData.propertyStats.available} Available
              </div>
              <div className="text-xs text-yellow-600">
                {reportData.propertyStats.pending} Pending
              </div>
              <div className="text-xs text-red-600">
                {reportData.propertyStats.rejected} Rejected
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.userStats.totalVendors + reportData.userStats.totalCustomers}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-xs text-blue-600">
                {reportData.userStats.totalVendors} Vendors
              </div>
              <div className="text-xs text-purple-600">
                {reportData.userStats.totalCustomers} Customers
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.engagementStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Property page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.supportStats.totalTickets}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-xs text-orange-600">
                {reportData.supportStats.openTickets} Open
              </div>
              <div className="text-xs text-green-600">
                {reportData.supportStats.resolvedTickets} Resolved
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Distribution</CardTitle>
                <CardDescription>Breakdown of property statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Available Properties</span>
                    <span className="text-sm font-semibold text-green-600">
                      {reportData.propertyStats.available} ({reportData.propertyStats.total > 0 ? Math.round((reportData.propertyStats.available / reportData.propertyStats.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Review</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {reportData.propertyStats.pending} ({reportData.propertyStats.total > 0 ? Math.round((reportData.propertyStats.pending / reportData.propertyStats.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rejected</span>
                    <span className="text-sm font-semibold text-red-600">
                      {reportData.propertyStats.rejected} ({reportData.propertyStats.total > 0 ? Math.round((reportData.propertyStats.rejected / reportData.propertyStats.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-sm font-semibold">{reportData.propertyStats.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>User registration statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Active Users</span>
                    <span className="text-sm font-semibold">{reportData.userStats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Users This Month</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">
                        {reportData.userStats.newUsersThisMonth}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Vendors</span>
                    <span className="text-sm font-semibold">{reportData.userStats.totalVendors}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customers</span>
                    <span className="text-sm font-semibold">{reportData.userStats.totalCustomers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>User interaction statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Views</span>
                    <span className="text-sm font-semibold">{reportData.engagementStats.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Messages</span>
                    <span className="text-sm font-semibold">{reportData.engagementStats.totalMessages.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Reviews</span>
                    <span className="text-sm font-semibold">{reportData.engagementStats.totalReviews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Rating</span>
                    <span className="text-sm font-semibold">
                      {reportData.engagementStats.averageRating > 0 
                        ? `${reportData.engagementStats.averageRating.toFixed(1)} / 5.0` 
                        : 'No ratings yet'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Performance</CardTitle>
                <CardDescription>Customer support metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Tickets</span>
                    <span className="text-sm font-semibold">{reportData.supportStats.totalTickets}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Open Tickets</span>
                    <span className="text-sm font-semibold text-orange-600">{reportData.supportStats.openTickets}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resolved Tickets</span>
                    <span className="text-sm font-semibold text-green-600">{reportData.supportStats.resolvedTickets}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Resolution Time</span>
                    <span className="text-sm font-semibold">
                      {reportData.supportStats.resolvedTickets > 0 
                        ? `${reportData.supportStats.avgResolutionTime}h` 
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Download detailed reports</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" onClick={() => handleExportReport('properties')}>
                <Download className="h-4 w-4 mr-2" />
                Properties Report
              </Button>
              <Button variant="outline" onClick={() => handleExportReport('users')}>
                <Download className="h-4 w-4 mr-2" />
                Users Report
              </Button>
              <Button variant="outline" onClick={() => handleExportReport('engagement')}>
                <Download className="h-4 w-4 mr-2" />
                Engagement Report
              </Button>
              <Button variant="outline" onClick={() => handleExportReport('support')}>
                <Download className="h-4 w-4 mr-2" />
                Support Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {reportData.propertyStats.available}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {reportData.propertyStats.total > 0 
                    ? `${Math.round((reportData.propertyStats.available / reportData.propertyStats.total) * 100)}% of total`
                    : '0% of total'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {reportData.propertyStats.pending}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {reportData.propertyStats.total > 0 
                    ? `${Math.round((reportData.propertyStats.pending / reportData.propertyStats.total) * 100)}% of total`
                    : '0% of total'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {reportData.propertyStats.rejected}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {reportData.propertyStats.total > 0 
                    ? `${Math.round((reportData.propertyStats.rejected / reportData.propertyStats.total) * 100)}% of total`
                    : '0% of total'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Property Status Breakdown</CardTitle>
              <CardDescription>Detailed property statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Available</span>
                    <span className="text-sm font-semibold text-green-600">
                      {reportData.propertyStats.available} / {reportData.propertyStats.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${reportData.propertyStats.total > 0 
                          ? (reportData.propertyStats.available / reportData.propertyStats.total) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Pending Review</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {reportData.propertyStats.pending} / {reportData.propertyStats.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${reportData.propertyStats.total > 0 
                          ? (reportData.propertyStats.pending / reportData.propertyStats.total) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Rejected</span>
                    <span className="text-sm font-semibold text-red-600">
                      {reportData.propertyStats.rejected} / {reportData.propertyStats.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${reportData.propertyStats.total > 0 
                          ? (reportData.propertyStats.rejected / reportData.propertyStats.total) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => handleExportReport('properties')} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Detailed Property Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {reportData.userStats.activeUsers}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  All registered users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {reportData.userStats.totalVendors}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {reportData.userStats.activeUsers > 0 
                    ? `${Math.round((reportData.userStats.totalVendors / reportData.userStats.activeUsers) * 100)}% of users`
                    : '0% of users'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600">
                  {reportData.userStats.totalCustomers}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {reportData.userStats.activeUsers > 0 
                    ? `${Math.round((reportData.userStats.totalCustomers / reportData.userStats.activeUsers) * 100)}% of users`
                    : '0% of users'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>New Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {reportData.userStats.newUsersThisMonth}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown by user type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Vendors (Agents)</span>
                    <span className="text-sm font-semibold text-purple-600">
                      {reportData.userStats.totalVendors} ({reportData.userStats.activeUsers > 0 
                        ? Math.round((reportData.userStats.totalVendors / reportData.userStats.activeUsers) * 100) 
                        : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${reportData.userStats.activeUsers > 0 
                          ? (reportData.userStats.totalVendors / reportData.userStats.activeUsers) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Customers</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {reportData.userStats.totalCustomers} ({reportData.userStats.activeUsers > 0 
                        ? Math.round((reportData.userStats.totalCustomers / reportData.userStats.activeUsers) * 100) 
                        : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${reportData.userStats.activeUsers > 0 
                          ? (reportData.userStats.totalCustomers / reportData.userStats.activeUsers) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth Metrics</CardTitle>
              <CardDescription>User registration trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">New Registrations</p>
                      <p className="text-xs text-muted-foreground">Current month</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    +{reportData.userStats.newUsersThisMonth}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => handleExportReport('users')} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Detailed User Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {reportData.engagementStats.totalViews.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Property page views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {reportData.engagementStats.totalMessages.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  User conversations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {reportData.engagementStats.totalReviews.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Customer reviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {reportData.engagementStats.averageRating > 0 
                    ? reportData.engagementStats.averageRating.toFixed(1) 
                    : 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {reportData.engagementStats.averageRating > 0 ? 'Out of 5.0' : 'No ratings yet'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Overview</CardTitle>
              <CardDescription>Platform interaction metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Property Views</p>
                          <p className="text-sm text-muted-foreground">Total page views</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {reportData.engagementStats.totalViews.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Messages Sent</p>
                          <p className="text-sm text-muted-foreground">User-to-vendor messages</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {reportData.engagementStats.totalMessages.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium">Customer Reviews</p>
                        <p className="text-sm text-muted-foreground">
                          Average rating: {reportData.engagementStats.averageRating > 0 
                            ? `${reportData.engagementStats.averageRating.toFixed(1)} / 5.0` 
                            : 'No ratings'}
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">
                      {reportData.engagementStats.totalReviews.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Insights</CardTitle>
              <CardDescription>Key engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <span className="text-sm font-medium">Avg Views per Property</span>
                  <span className="text-sm font-bold text-blue-600">
                    {reportData.propertyStats.total > 0 
                      ? Math.round(reportData.engagementStats.totalViews / reportData.propertyStats.total).toLocaleString()
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <span className="text-sm font-medium">Avg Messages per User</span>
                  <span className="text-sm font-bold text-purple-600">
                    {reportData.userStats.activeUsers > 0 
                      ? Math.round(reportData.engagementStats.totalMessages / reportData.userStats.activeUsers).toLocaleString()
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                  <span className="text-sm font-medium">Review Coverage</span>
                  <span className="text-sm font-bold text-amber-600">
                    {reportData.propertyStats.total > 0 
                      ? `${Math.round((reportData.engagementStats.totalReviews / reportData.propertyStats.total) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => handleExportReport('engagement')} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Detailed Engagement Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {reportData.supportStats.totalTickets}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  All support requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {reportData.supportStats.openTickets}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Awaiting response
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {reportData.supportStats.resolvedTickets}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Successfully closed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {reportData.supportStats.avgResolutionTime}h
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Average time to resolve
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ticket Status Distribution</CardTitle>
              <CardDescription>Support ticket breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Resolved Tickets</span>
                    <span className="text-sm font-semibold text-green-600">
                      {reportData.supportStats.resolvedTickets} ({reportData.supportStats.totalTickets > 0 
                        ? Math.round((reportData.supportStats.resolvedTickets / reportData.supportStats.totalTickets) * 100) 
                        : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${reportData.supportStats.totalTickets > 0 
                          ? (reportData.supportStats.resolvedTickets / reportData.supportStats.totalTickets) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Open Tickets</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {reportData.supportStats.openTickets} ({reportData.supportStats.totalTickets > 0 
                        ? Math.round((reportData.supportStats.openTickets / reportData.supportStats.totalTickets) * 100) 
                        : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${reportData.supportStats.totalTickets > 0 
                          ? (reportData.supportStats.openTickets / reportData.supportStats.totalTickets) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Support team efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Resolution Rate</p>
                    <p className="text-xs text-muted-foreground">Resolved vs Total</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {reportData.supportStats.totalTickets > 0 
                      ? Math.round((reportData.supportStats.resolvedTickets / reportData.supportStats.totalTickets) * 100)
                      : 0}%
                  </p>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Average Resolution Time</p>
                    <p className="text-xs text-muted-foreground">Time to close tickets</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {reportData.supportStats.avgResolutionTime}h
                  </p>
                </div>

                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Pending Work</p>
                    <p className="text-xs text-muted-foreground">Currently open</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {reportData.supportStats.openTickets}
                  </p>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Total Handled</p>
                    <p className="text-xs text-muted-foreground">All-time tickets</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {reportData.supportStats.totalTickets}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => handleExportReport('support')} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Detailed Support Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
