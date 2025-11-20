import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Users, Building } from "lucide-react";
import subAdminService from "@/services/subAdminService";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeEvent } from "@/contexts/RealtimeContext";

interface DashboardStats {
  totalProperties: number;
  availableProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  totalUsers: number;
  vendorUsers: number;
  customerUsers: number;
  totalViews: number;
  totalSupport: number;
  openSupport: number;
  resolvedSupport: number;
}

const SubAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await subAdminService.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch dashboard stats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates for property changes
  useRealtimeEvent('property_created', () => {
    fetchDashboardStats();
  });

  useRealtimeEvent('property_approved', () => {
    fetchDashboardStats();
  });

  useRealtimeEvent('property_rejected', () => {
    fetchDashboardStats();
  });

  // Real-time updates for support tickets
  useRealtimeEvent('support_ticket_created', () => {
    fetchDashboardStats();
  });

  useRealtimeEvent('support_ticket_updated', () => {
    fetchDashboardStats();
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sub Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Content moderation and support management overview
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sub Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Content moderation and support management overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <p className="text-xs text-green-600">
                {stats?.availableProperties || 0} Available
              </p>
              <p className="text-xs text-yellow-600">
                {stats?.pendingProperties || 0} Pending
              </p>
              <p className="text-xs text-red-600">
                {stats?.rejectedProperties || 0} Rejected
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <div className="flex gap-2 mt-2">
              <p className="text-xs text-blue-600">
                {stats?.vendorUsers || 0} Vendors
              </p>
              <p className="text-xs text-purple-600">
                {stats?.customerUsers || 0} Customers
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Property page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSupport || 0}</div>
            <div className="flex gap-2 mt-2">
              <p className="text-xs text-orange-600">
                {stats?.openSupport || 0} Open
              </p>
              <p className="text-xs text-green-600">
                {stats?.resolvedSupport || 0} Resolved
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for content moderation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a 
              href="/subadmin/property-reviews" 
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Review Properties</div>
              <div className="text-sm text-muted-foreground">
                {stats?.pendingProperties} properties awaiting approval
              </div>
            </a>
            <a 
              href="/subadmin/support-tickets" 
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Handle Support</div>
              <div className="text-sm text-muted-foreground">
                {stats?.openSupport} open tickets
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest content moderation activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity to display</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubAdminDashboard;