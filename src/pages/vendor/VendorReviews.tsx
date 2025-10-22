import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  Search,
  Filter,
  Reply
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const VendorReviews = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);

  const reviewStats = {
    averageRating: 4.7,
    totalReviews: 156,
    ratingDistribution: {
      5: 78,
      4: 45,
      3: 23,
      2: 7,
      1: 3
    },
    recentTrend: "+0.3",
    responseRate: "92%"
  };

  const reviews = [
    {
      id: 1,
      customerName: "Rahul Sharma",
      avatar: "/api/placeholder/40/40",
      rating: 5,
      date: "2024-10-22",
      property: "Luxury 3BHK Apartment in Powai",
      title: "Excellent service and professional approach",
      comment: "Amazing experience working with this vendor. Very professional, responsive, and helped us find our dream home. The entire process was smooth and transparent. Highly recommended!",
      helpful: 12,
      notHelpful: 1,
      verified: true,
      hasReply: false,
      tags: ["Professional", "Responsive", "Helpful"]
    },
    {
      id: 2,
      customerName: "Priya Patel",
      avatar: "/api/placeholder/40/40",
      rating: 4,
      date: "2024-10-20",
      property: "Modern Villa with Private Garden",
      title: "Good service, minor issues with communication",
      comment: "Overall good experience. The vendor was knowledgeable about the market and showed us relevant properties. Some delays in communication but issues were resolved quickly.",
      helpful: 8,
      notHelpful: 2,
      verified: true,
      hasReply: true,
      reply: {
        text: "Thank you for your feedback! We've improved our communication processes to ensure faster responses. We appreciate your patience and look forward to serving you again.",
        date: "2024-10-21"
      },
      tags: ["Knowledgeable", "Market Expert"]
    },
    {
      id: 3,
      customerName: "Amit Kumar",
      avatar: "/api/placeholder/40/40",
      rating: 5,
      date: "2024-10-18",
      property: "Commercial Office Space",
      title: "Outstanding support for commercial property",
      comment: "Exceptional service for our office space requirements. Deep understanding of commercial real estate market. Negotiated a great deal for us and handled all paperwork efficiently.",
      helpful: 15,
      notHelpful: 0,
      verified: true,
      hasReply: true,
      reply: {
        text: "Thank you for the wonderful review! It was a pleasure helping you secure the perfect office space. Wishing you success in your new venture!",
        date: "2024-10-19"
      },
      tags: ["Commercial Expert", "Negotiation Skills", "Efficient"]
    },
    {
      id: 4,
      customerName: "Sneha Reddy",
      avatar: "/api/placeholder/40/40",
      rating: 3,
      date: "2024-10-15",
      property: "Budget 2BHK Flat",
      title: "Average experience, room for improvement",
      comment: "The vendor helped us find a property within our budget but the service could be more proactive. Property visits were well organized but follow-up could be better.",
      helpful: 5,
      notHelpful: 8,
      verified: true,
      hasReply: false,
      tags: ["Budget Friendly"]
    },
    {
      id: 5,
      customerName: "Karthik Menon",
      avatar: "/api/placeholder/40/40",
      rating: 5,
      date: "2024-10-12",
      property: "Luxury Penthouse",
      title: "Exceptional service for luxury properties",
      comment: "Top-notch service for our luxury property search. Excellent market knowledge, professional presentation, and personalized attention. Made the entire buying process enjoyable.",
      helpful: 20,
      notHelpful: 1,
      verified: true,
      hasReply: true,
      reply: {
        text: "Thank you for choosing us for your luxury property needs! We're delighted that you had an exceptional experience. Congratulations on your new penthouse!",
        date: "2024-10-13"
      },
      tags: ["Luxury Expert", "Personalized Service", "Market Knowledge"]
    }
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.property.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "5") return matchesSearch && review.rating === 5;
    if (selectedFilter === "4") return matchesSearch && review.rating === 4;
    if (selectedFilter === "3") return matchesSearch && review.rating === 3;
    if (selectedFilter === "2") return matchesSearch && review.rating === 2;
    if (selectedFilter === "1") return matchesSearch && review.rating === 1;
    if (selectedFilter === "no-reply") return matchesSearch && !review.hasReply;
    
    return matchesSearch;
  });

  const renderStars = (rating: number, size: "sm" | "md" = "md") => {
    const starSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleReply = (reviewId: number) => {
    // Handle reply submission
    setShowReplyForm(null);
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews & Ratings</h1>
          <p className="text-muted-foreground">Manage customer feedback and maintain your reputation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Rating Insights
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{reviewStats.averageRating}</div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(reviewStats.averageRating))}
            </div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">{reviewStats.recentTrend} this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{reviewStats.totalReviews}</div>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
            <div className="mt-2">
              <Badge className="bg-blue-100 text-blue-800">
                <Award className="w-3 h-3 mr-1" />
                Top Rated
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{reviewStats.responseRate}</div>
            <p className="text-sm text-muted-foreground">Response Rate</p>
            <p className="text-xs text-green-600 mt-2">Excellent response rate!</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-3">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm w-8">{rating}★</span>
                  <Progress 
                    value={(reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution] / reviewStats.totalReviews) * 100} 
                    className="flex-1 h-2" 
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {reviewStats.ratingDistribution[rating as keyof typeof reviewStats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all-reviews" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all-reviews">All Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="pending-replies">Pending Replies (2)</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="all-reviews" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
                <SelectItem value="no-reply">No Reply</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={review.avatar} />
                      <AvatarFallback>{review.customerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{review.customerName}</h4>
                          <div className="flex items-center space-x-2">
                            {renderStars(review.rating, "sm")}
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{review.property}</p>
                      <h5 className="font-medium mb-2">{review.title}</h5>
                      <p className="text-sm mb-3">{review.comment}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {review.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Review Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{review.helpful}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsDown className="w-4 h-4 text-red-600" />
                            <span className="text-sm">{review.notHelpful}</span>
                          </div>
                        </div>
                        
                        {!review.hasReply && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowReplyForm(review.id)}
                          >
                            <Reply className="w-4 h-4 mr-2" />
                            Reply
                          </Button>
                        )}
                      </div>
                      
                      {/* Reply Form */}
                      {showReplyForm === review.id && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <Textarea
                            placeholder="Write your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="mb-3"
                          />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setShowReplyForm(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleReply(review.id)}
                            >
                              Post Reply
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Existing Reply */}
                      {review.hasReply && review.reply && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Your Reply</span>
                            <span className="text-xs text-blue-600">{review.reply.date}</span>
                          </div>
                          <p className="text-sm text-blue-800">{review.reply.text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedFilter !== "all" 
                    ? "No reviews match your search criteria" 
                    : "Customer reviews will appear here"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending-replies" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Pending Replies</h3>
              <p className="text-muted-foreground mb-4">
                Reviews that need your response will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Mentioned Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Professional", "Responsive", "Helpful", "Knowledgeable", "Efficient"].map((keyword, index) => (
                    <div key={keyword} className="flex justify-between items-center">
                      <span className="text-sm">{keyword}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={90 - (index * 15)} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground">{25 - (index * 3)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Positive Trend</p>
                      <p className="text-sm text-green-600">Rating improved by 0.3 points</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-800">Response Time</p>
                      <p className="text-sm text-blue-600">Average reply time: 2.3 hours</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorReviews;