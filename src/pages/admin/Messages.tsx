import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MessageSquare, 
  Send, 
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCheck,
  Eye,
  Trash2,
  Reply,
  Forward,
  Ban,
  AlertTriangle,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  UserCheck,
  UserX,
  Archive,
  Star,
  StarOff,
  Loader2,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  adminMessageService, 
  type AdminMessage, 
  type MessageStats, 
  type MessageFilters 
} from "@/services/adminMessageService";

const AdminMessages = () => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<AdminMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
    hasNext: false,
    hasPrev: false,
    limit: 20
  });

  // Load messages and stats
  useEffect(() => {
    loadMessages();
    loadStats();
  }, []);

  // Load messages with current filters
  const loadMessages = async (filters: MessageFilters = {}) => {
    try {
      setLoading(true);
      
      const mergedFilters = {
        page: pagination.currentPage,
        limit: pagination.limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchTerm || undefined,
        ...filters
      };

      const response = await adminMessageService.getMessages(mergedFilters);
      
      if (response.success) {
        setMessages(response.data.messages);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await adminMessageService.getMessageStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load message stats:", error);
    }
  };

  // Reload messages when filters change
  useEffect(() => {
    loadMessages();
  }, [activeTab, statusFilter, typeFilter, priorityFilter, searchTerm, pagination.currentPage]);

  // Filter messages based on active tab
  useEffect(() => {
    let filtered = messages;

    // Filter by tab
    switch (activeTab) {
      case "unread":
        filtered = filtered.filter(msg => msg.status === 'unread');
        break;
      case "flagged":
        filtered = filtered.filter(msg => msg.status === 'flagged');
        break;
      case "inquiries":
        filtered = filtered.filter(msg => ['inquiry', 'lead', 'property_inquiry'].includes(msg.type));
        break;
      case "support":
        filtered = filtered.filter(msg => ['support', 'complaint'].includes(msg.type));
        break;
    }

    setFilteredMessages(filtered);
  }, [messages, activeTab]);

  const getSenderName = (message: AdminMessage) => {
    return adminMessageService.getSenderName(message);
  };

  const getRecipientName = (message: AdminMessage) => {
    return adminMessageService.getRecipientName(message);
  };

  const formatDate = (dateString: string) => {
    return adminMessageService.formatDate(dateString);
  };

  const getStatusColor = (status: string) => {
    return adminMessageService.getStatusColor(status);
  };

  const getPriorityColor = (priority: string) => {
    return adminMessageService.getPriorityColor(priority);
  };

  const markAsRead = async (messageId: string) => {
    try {
      await adminMessageService.updateMessageStatus(messageId, 'read');
      loadMessages(); // Refresh messages
      loadStats(); // Refresh stats
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const flagMessage = async (messageId: string) => {
    try {
      await adminMessageService.updateMessageStatus(messageId, 'flagged');
      loadMessages();
      loadStats();
    } catch (error) {
      console.error("Failed to flag message:", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      await adminMessageService.deleteMessage(messageId);
      setSelectedMessage(null);
      loadMessages();
      loadStats();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      await adminMessageService.sendReply(selectedMessage._id, replyText.trim());
      setReplyText("");
      loadMessages();
      loadStats();
    } catch (error) {
      console.error("Failed to send reply:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Manage and respond to user messages and inquiries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadMessages()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalMessages}
              </div>
              <div className="text-sm text-muted-foreground">Total Messages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.unreadMessages}
              </div>
              <div className="text-sm text-muted-foreground">Unread</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.repliedMessages}
              </div>
              <div className="text-sm text-muted-foreground">Replied</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.flaggedMessages}
              </div>
              <div className="text-sm text-muted-foreground">Flagged</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.todayMessages}
              </div>
              <div className="text-sm text-muted-foreground">Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">
                {stats.responseRate}%
              </div>
              <div className="text-sm text-muted-foreground">Response Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {stats.avgResponseTime}
              </div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs and Filters */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Messages</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {stats && stats.unreadMessages > 0 && (
                <Badge className="ml-2 text-xs">{stats.unreadMessages}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged {stats && stats.flaggedMessages > 0 && (
                <Badge className="ml-2 text-xs bg-red-500">{stats.flaggedMessages}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="inquiries">Property Inquiries</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inquiry">Inquiry</SelectItem>
                <SelectItem value="property_inquiry">Property</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Messages List */}
          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Messages List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Messages ({filteredMessages.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2 p-4">
                      {filteredMessages.map((message) => (
                        <div
                          key={message._id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                            selectedMessage?._id === message._id ? 'bg-accent' : ''
                          }`}
                          onClick={() => setSelectedMessage(message)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={message.sender.profile?.avatar} />
                                <AvatarFallback>
                                  {getSenderName(message).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm truncate">
                                    {getSenderName(message)}
                                  </span>
                                  <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                                    {message.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {message.subject || message.content}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={`text-xs ${getStatusColor(message.status)}`}>
                                    {message.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(message.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => markAsRead(message._id)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Mark as Read
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => flagMessage(message._id)}>
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Flag Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this message? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteMessage(message._id)}>
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Message Detail */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedMessage ? "Message Details" : "Select a Message"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedMessage ? (
                    <div className="space-y-4">
                      {/* Message Header */}
                      <div className="border-b pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={selectedMessage.sender.profile?.avatar} />
                              <AvatarFallback>
                                {getSenderName(selectedMessage).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{getSenderName(selectedMessage)}</p>
                              <p className="text-sm text-muted-foreground">{selectedMessage.sender.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getPriorityColor(selectedMessage.priority)} mb-1`}>
                              {selectedMessage.priority}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(selectedMessage.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        {selectedMessage.subject && (
                          <h3 className="font-semibold text-lg mb-2">{selectedMessage.subject}</h3>
                        )}
                        
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(selectedMessage.status)}>
                            {selectedMessage.status}
                          </Badge>
                          <Badge variant="outline">
                            {selectedMessage.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                      </div>

                      {/* Property Info if applicable */}
                      {selectedMessage.property && (
                        <div className="border p-3 rounded-lg bg-blue-50">
                          <p className="font-medium text-sm">Related Property:</p>
                          <p className="text-sm text-muted-foreground">{selectedMessage.property.title}</p>
                        </div>
                      )}

                      {/* Reply Section */}
                      <div className="space-y-3">
                        <Label htmlFor="reply">Reply</Label>
                        <Textarea
                          id="reply"
                          placeholder="Type your reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button onClick={sendReply} disabled={!replyText.trim()}>
                            <Send className="w-4 h-4 mr-2" />
                            Send Reply
                          </Button>
                          <Button variant="outline" onClick={() => setReplyText("")}>
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Message Selected</h3>
                      <p className="text-muted-foreground">
                        Select a message from the list to view details and reply
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminMessages;