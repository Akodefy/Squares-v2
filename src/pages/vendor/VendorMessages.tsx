import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image,
  Clock,
  Check,
  CheckCheck,
  Star,
  Archive,
  Trash
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const VendorMessages = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = [
    {
      id: 1,
      name: "Rahul Sharma",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Can we schedule a property visit this weekend?",
      timestamp: "2 min ago",
      unread: 2,
      online: true,
      property: "Luxury 3BHK Apartment in Powai",
      phone: "+91 98765 43210",
      priority: "high"
    },
    {
      id: 2,
      name: "Priya Patel",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Thank you for the property details. Very interested!",
      timestamp: "10 min ago",
      unread: 0,
      online: false,
      property: "Modern Villa with Private Garden",
      phone: "+91 87654 32109",
      priority: "medium"
    },
    {
      id: 3,
      name: "Amit Kumar",
      avatar: "/api/placeholder/40/40",
      lastMessage: "What's the final price for the office space?",
      timestamp: "1 hour ago",
      unread: 1,
      online: true,
      property: "Commercial Office Space",
      phone: "+91 76543 21098",
      priority: "high"
    },
    {
      id: 4,
      name: "Sneha Reddy",
      avatar: "/api/placeholder/40/40",
      lastMessage: "Can you help with home loan process?",
      timestamp: "2 hours ago",
      unread: 0,
      online: false,
      property: "Budget 2BHK Flat",
      phone: "+91 65432 10987",
      priority: "low"
    }
  ];

  const messages = [
    {
      id: 1,
      senderId: 1,
      senderName: "Rahul Sharma",
      content: "Hi, I'm interested in the luxury apartment you have listed in Powai.",
      timestamp: "10:30 AM",
      type: "text",
      status: "read"
    },
    {
      id: 2,
      senderId: "vendor",
      senderName: "You",
      content: "Hello Rahul! Thank you for your interest. I'd be happy to help you with the apartment details. It's a beautiful 3BHK with modern amenities.",
      timestamp: "10:35 AM",
      type: "text",
      status: "read"
    },
    {
      id: 3,
      senderId: 1,
      senderName: "Rahul Sharma",
      content: "That sounds great! Can you share more details about the amenities and pricing?",
      timestamp: "10:40 AM",
      type: "text",
      status: "read"
    },
    {
      id: 4,
      senderId: "vendor",
      senderName: "You",
      content: "Sure! The apartment features:\n• Modern kitchen with modular fittings\n• 24/7 security\n• Swimming pool and gym\n• Children's play area\n• Covered parking\n\nThe price is ₹1.2 Cr (negotiable)",
      timestamp: "10:45 AM",
      type: "text",
      status: "read"
    },
    {
      id: 5,
      senderId: 1,
      senderName: "Rahul Sharma",
      content: "Looks perfect! Can we schedule a visit this weekend?",
      timestamp: "11:00 AM",
      type: "text",
      status: "delivered"
    },
    {
      id: 6,
      senderId: "vendor",
      senderName: "You",
      content: "Absolutely! I'm available Saturday and Sunday. What time works best for you?",
      timestamp: "11:05 AM",
      type: "text",
      status: "sent"
    }
  ];

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.property.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message sending logic here
      setNewMessage("");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <Check className="w-3 h-3 text-gray-400" />;
      case "delivered": return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "read": return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-8rem)]">
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                  selectedChat === conversation.id ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedChat(conversation.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.avatar} />
                      <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold truncate">{conversation.name}</h4>
                      <div className="flex items-center space-x-1">
                        <Badge className={`text-xs ${getPriorityColor(conversation.priority)}`}>
                          {conversation.priority}
                        </Badge>
                        {conversation.unread > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs px-2">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-1 truncate">
                      {conversation.property}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {conversation.lastMessage}
                      </p>
                      <span className="text-xs text-muted-foreground ml-2">
                        {conversation.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.avatar} />
                      <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {selectedConversation.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.online ? 'Online' : 'Last seen 2 hours ago'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="w-4 h-4 mr-2" />
                        Mark as Important
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash className="w-4 h-4 mr-2" />
                        Delete Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Property Info */}
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{selectedConversation.property}</p>
                <p className="text-xs text-muted-foreground">{selectedConversation.phone}</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'vendor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === 'vendor'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        message.senderId === 'vendor' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        <span className="text-xs">{message.timestamp}</span>
                        {message.senderId === 'vendor' && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-end space-x-2">
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Image className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorMessages;