import React, { useState } from 'react';
import { Bell, Filter, Search, CheckCheck, MoreVertical, Eye, Trash2, Archive, Star, StarOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRealTimeNotifications, RealTimeNotification } from '@/hooks/useRealTimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ExtendedNotification extends RealTimeNotification {
  read?: boolean;
  starred?: boolean;
  archived?: boolean;
}

const CustomerNotifications: React.FC = () => {
  const {
    isConnected,
    notifications,
    markAsRead,
    clearNotifications
  } = useRealTimeNotifications();
  
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'property_alert' | 'price_alert' | 'new_message'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getCustomerNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      property_alert: '🏠',
      price_alert: '💰',
      new_message: '💬',
      property_update: '📋',
      service_update: '🔧',
      news_update: '📰',
      broadcast: '📢',
      announcement: '📣',
      welcome: '👋',
      test: '🧪',
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      property_alert: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      price_alert: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      new_message: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      property_update: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      service_update: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      news_update: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      broadcast: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      announcement: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      welcome: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      test: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const formatNotificationTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const handleNotificationClick = (notification: RealTimeNotification) => {
    markAsRead(notification.timestamp);
    
    // Handle customer-specific navigation
    if (notification.data?.action) {
      switch (notification.data.action) {
        case 'view_property':
          if (notification.data.propertyId) {
            navigate(`/customer/property/${notification.data.propertyId}`);
          }
          break;
        case 'view_properties':
          navigate('/v2/customer/search');
          break;
        case 'view_messages':
          navigate('/v2/customer/messages');
          break;
        case 'view_dashboard':
          navigate('/v2/customer/dashboard');
          break;
        case 'view_favorites':
          navigate('/v2/customer/favorites');
          break;
        case 'view_services':
          navigate('/v2/customer/services');
          break;
        default:
          break;
      }
    }
  };

  // Filter notifications based on current filter and search term
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !(notification as ExtendedNotification).read) ||
      notification.type === filter;
    
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !(n as ExtendedNotification).read).length;

  return (
    <div className="space-y-6 pt-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="w-8 h-8 text-primary" />
          Notifications
        </h1>
        <p className="text-muted-foreground mt-1">
          Stay updated with property alerts, messages, and important updates
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select 
            value={filter} 
            onValueChange={(value: 'all' | 'unread' | 'property_alert' | 'price_alert' | 'new_message') => setFilter(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
              <SelectItem value="property_alert">Property Alerts</SelectItem>
              <SelectItem value="price_alert">Price Alerts</SelectItem>
              <SelectItem value="new_message">Messages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              notifications.forEach(n => markAsRead(n.timestamp));
            }}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearNotifications}
            disabled={notifications.length === 0}
          >
            <Archive className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 px-4 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? 'No matching notifications' : 'No notifications yet'}
              </h3>
              <p className="text-sm">
                {searchTerm 
                  ? 'Try adjusting your search or filter settings'
                  : 'You\'ll see updates about properties, messages, and more here'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification, index) => (
                <div 
                  key={`${notification.timestamp}-${index}`}
                  className={`p-4 transition-all duration-200 hover:bg-muted/50 ${
                    (notification as ExtendedNotification).read ? 'opacity-70' : 'bg-background'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl mt-1">
                      {getCustomerNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                            {notification.title}
                            {!(notification as ExtendedNotification).read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => markAsRead(notification.timestamp)}
                            >
                              <CheckCheck className="w-4 h-4 mr-2" />
                              Mark as Read
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getNotificationColor(notification.type)}`}
                          >
                            {notification.type.replace('_', ' ')}
                          </Badge>
                          
                          <span className="text-xs text-muted-foreground">
                            {formatNotificationTime(notification.timestamp)}
                          </span>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNotificationClick(notification)}
                          className="text-xs h-7"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerNotifications;
