import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Activity,
  Users,
  Building,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Wifi,
  WifiOff,
  Zap,
  Bell,
  RefreshCw,
  Server,
  Database,
  Cpu,
  MemoryStick,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Home,
  HardDrive
} from 'lucide-react';

interface LiveMetrics {
  timestamp: Date;
  overview: {
    totalUsers: number;
    totalProperties: number;
    activeUsers: number;
    onlineUsers: number;
  };
  activity: {
    lastHour: {
      newUsers: number;
      newProperties: number;
      newMessages: number;
    };
  };
  system: {
    database: string;
    memory: {
      heapUsed: number;
      heapTotal: number;
    };
    uptime: number;
    cpu: { usage: number };
    connections: {
      database: number;
      adminClients: number;
    };
  };
  alerts: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    action?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

interface Notification {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface DatabaseChange {
  timestamp: Date;
  data: {
    collection: string;
    operation: 'insert' | 'update' | 'delete';
    documentId: string;
    changes?: any;
  };
}

const AdminRealtimeDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [databaseChanges, setDatabaseChanges] = useState<DatabaseChange[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  // Mock data for now - will be replaced with real-time data later
  useEffect(() => {
    if (user?.role !== 'admin') return;

    // Simulate loading mock data
    const mockMetrics: LiveMetrics = {
      timestamp: new Date(),
      overview: {
        totalUsers: 150,
        totalProperties: 45,
        activeUsers: 23,
        onlineUsers: 8
      },
      activity: {
        lastHour: {
          newUsers: 3,
          newProperties: 2,
          newMessages: 12
        }
      },
      system: {
        database: 'connected',
        memory: {
          heapUsed: 125829120,
          heapTotal: 268435456
        },
        uptime: 86400,
        cpu: { usage: 15.5 },
        connections: {
          database: 5,
          adminClients: 2
        }
      },
      alerts: [
        {
          type: 'warning',
          message: 'High memory usage detected',
          action: 'Monitor system resources',
          priority: 'medium'
        }
      ]
    };

    setLiveMetrics(mockMetrics);
    setIsConnected(true);
    setConnectionStatus('connected');
    
    // Add some mock notifications
    setNotifications([
      {
        type: 'info',
        title: 'System Status',
        message: 'Admin dashboard loaded successfully',
        priority: 'low',
        timestamp: new Date()
      }
    ]);

  }, [user?.role]);

  const handleRefreshMetrics = () => {
    // Simulate refreshing metrics
    if (liveMetrics) {
      const newMetrics = {
        ...liveMetrics,
        timestamp: new Date(),
        overview: {
          ...liveMetrics.overview,
          onlineUsers: Math.floor(Math.random() * 20) + 5
        },
        system: {
          ...liveMetrics.system,
          cpu: { usage: Math.floor(Math.random() * 30) + 10 }
        }
      };
      setLiveMetrics(newMetrics);
      
      toast({
        title: 'Metrics Refreshed',
        description: 'Live data has been updated',
      });
    }
  };

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-gray-600">You need admin privileges to access this dashboard.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Real-time Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor system metrics, user activity, and manage the platform in real-time
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={isConnected ? 'default' : 'destructive'} className="flex items-center space-x-2">
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{connectionStatus}</span>
          </Badge>
          <Button onClick={handleRefreshMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {!liveMetrics ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p>Loading dashboard metrics...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveMetrics.overview.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +{liveMetrics.activity.lastHour.newUsers} from last hour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveMetrics.overview.totalProperties}</div>
                <p className="text-xs text-muted-foreground">
                  +{liveMetrics.activity.lastHour.newProperties} from last hour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveMetrics.overview.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online Now</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{liveMetrics.overview.onlineUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Real-time count
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>System Health</span>
              </CardTitle>
              <CardDescription>
                Real-time system performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database</span>
                    <Badge variant={liveMetrics.system.database === 'connected' ? 'default' : 'destructive'}>
                      {liveMetrics.system.database === 'connected' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {liveMetrics.system.database}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {liveMetrics.system.connections.database} active connections
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <Badge variant={liveMetrics.system.cpu.usage > 80 ? 'destructive' : 'default'}>
                      <Cpu className="w-3 h-3 mr-1" />
                      {liveMetrics.system.cpu.usage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory</span>
                    <Badge variant="default">
                      <MemoryStick className="w-3 h-3 mr-1" />
                      {formatBytes(liveMetrics.system.memory.heapUsed)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    of {formatBytes(liveMetrics.system.memory.heapTotal)} total
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uptime</span>
                    <Badge variant="default">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatUptime(liveMetrics.system.uptime)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Admin Clients</span>
                    <Badge variant="default">
                      <Users className="w-3 h-3 mr-1" />
                      {liveMetrics.system.connections.adminClients}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts and Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>System Alerts</span>
                </CardTitle>
                <CardDescription>
                  Active system warnings and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  {liveMetrics.alerts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                      <p>No active alerts</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {liveMetrics.alerts.map((alert, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                            alert.type === 'error' ? 'text-red-500' : 
                            alert.type === 'warning' ? 'text-yellow-500' : 
                            'text-blue-500'
                          }`} />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{alert.message}</p>
                            {alert.action && (
                              <p className="text-xs text-muted-foreground">{alert.action}</p>
                            )}
                            <Badge variant={getPriorityColor(alert.priority)} className="text-xs">
                              {alert.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Recent Notifications</span>
                </CardTitle>
                <CardDescription>
                  Latest system and user notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  {notifications.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Bell className="w-8 h-8 mx-auto mb-2" />
                      <p>No recent notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notification, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">{notification.message}</p>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                                {notification.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Real-time database changes and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {databaseChanges.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Database className="w-8 h-8 mx-auto mb-2" />
                    <p>No recent database changes</p>
                    <p className="text-xs">Database monitoring is active</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {databaseChanges.map((change, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Database className="w-4 h-4 mt-0.5 text-blue-500" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">
                            {change.data.operation} operation on {change.data.collection}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Document ID: {change.data.documentId}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {change.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminRealtimeDashboard;
