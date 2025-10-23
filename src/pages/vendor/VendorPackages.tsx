/* 
// COMMENTED OUT - Will be used in future
// This packages section is temporarily disabled and will be used in the future

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Zap,
  Crown,
  TrendingUp,
  Eye,
  Users,
  Calendar,
  Check,
  ArrowRight,
  Sparkles,
  Target,
  Megaphone,
  Camera,
  Share2,
  Award,
  Gift
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const VendorPackages = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const packages = [
    {
      id: "basic",
      name: "Basic Promotion",
      price: "₹999",
      duration: "7 days",
      popular: false,
      description: "Essential visibility boost for your property",
      features: [
        "Featured in search results",
        "2x more visibility",
        "Basic analytics",
        "Email support"
      ],
      benefits: {
        views: "+150%",
        leads: "+75%",
        calls: "+50%"
      },
      icon: Star,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: "premium",
      name: "Premium Boost",
      price: "₹2,499",
      duration: "15 days",
      popular: true,
      description: "Maximum exposure with priority placement",
      features: [
        "Top of search results",
        "5x more visibility",
        "Advanced analytics",
        "Social media promotion",
        "WhatsApp support",
        "Custom property badge"
      ],
      benefits: {
        views: "+300%",
        leads: "+200%",
        calls: "+150%"
      },
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      id: "platinum",
      name: "Platinum Elite",
      price: "₹4,999",
      duration: "30 days",
      popular: false,
      description: "Ultimate promotion with exclusive benefits",
      features: [
        "Homepage featured listing",
        "10x more visibility",
        "Priority customer support",
        "Professional photography",
        "Virtual tour creation",
        "Dedicated relationship manager",
        "Multi-platform promotion",
        "Premium property badge"
      ],
      benefits: {
        views: "+500%",
        leads: "+350%",
        calls: "+250%"
      },
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const addOnServices = [
    {
      id: "photography",
      name: "Professional Photography",
      price: "₹1,499",
      description: "High-quality photos that showcase your property perfectly",
      icon: Camera,
      features: ["20+ professional photos", "HDR editing", "Same day delivery"]
    },
    {
      id: "virtual-tour",
      name: "360° Virtual Tour",
      price: "₹2,999",
      description: "Immersive virtual experience for potential buyers",
      icon: Eye,
      features: ["360° property tour", "Interactive hotspots", "Mobile optimized"]
    },
    {
      id: "social-boost",
      name: "Social Media Boost",
      price: "₹999",
      description: "Promote your property across social media platforms",
      icon: Share2,
      features: ["Facebook & Instagram ads", "Targeted audience", "Performance tracking"]
    },
    {
      id: "lead-priority",
      name: "Priority Lead Alerts",
      price: "₹499",
      description: "Get instant notifications for new leads",
      icon: Target,
      features: ["Real-time SMS alerts", "Priority email notifications", "Lead scoring"]
    }
  ];

  const currentPromotions = [
    {
      property: "Luxury 3BHK Apartment in Powai",
      package: "Premium Boost",
      startDate: "2024-10-15",
      endDate: "2024-10-30",
      progress: 60,
      views: 2340,
      leads: 45,
      status: "active"
    },
    {
      property: "Modern Villa with Private Garden",
      package: "Basic Promotion",
      startDate: "2024-10-20",
      endDate: "2024-10-27",
      progress: 85,
      views: 1980,
      leads: 38,
      status: "active"
    }
  ];

  const packageHistory = [
    {
      property: "Commercial Office Space",
      package: "Platinum Elite",
      duration: "30 days",
      totalViews: 5420,
      totalLeads: 89,
      conversions: 3,
      amount: "₹4,999",
      date: "Sep 2024",
      status: "completed"
    },
    {
      property: "Budget 2BHK Flat",
      package: "Premium Boost", 
      duration: "15 days",
      totalViews: 3200,
      totalLeads: 56,
      conversions: 2,
      amount: "₹2,499",
      date: "Aug 2024",
      status: "completed"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header * /}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotion Packages</h1>
          <p className="text-muted-foreground">Boost your property visibility and get more leads</p>
        </div>
        <Button>
          <Gift className="w-4 h-4 mr-2" />
          View Offers
        </Button>
      </div>

      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="addons">Add-ons</TabsTrigger>
          <TabsTrigger value="active">Active Promotions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          {/* Promotion Packages * /}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  pkg.popular ? 'ring-2 ring-primary' : ''
                } ${
                  selectedPackage === pkg.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${pkg.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <pkg.icon className={`w-8 h-8 ${pkg.color}`} />
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{pkg.price}</div>
                  <p className="text-sm text-muted-foreground">for {pkg.duration}</p>
                  <p className="text-sm text-muted-foreground mt-2">{pkg.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Benefits Preview * /}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-green-600">{pkg.benefits.views}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-blue-600">{pkg.benefits.leads}</div>
                      <div className="text-xs text-muted-foreground">Leads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-purple-600">{pkg.benefits.calls}</div>
                      <div className="text-xs text-muted-foreground">Calls</div>
                    </div>
                  </div>

                  {/* Features * /}
                  <div className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    Select Package
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Success Stories * /}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Success Stories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">87%</div>
                  <p className="text-sm text-muted-foreground">Average increase in leads</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">3.2x</div>
                  <p className="text-sm text-muted-foreground">More property views</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">24hrs</div>
                  <p className="text-sm text-muted-foreground">Average time to first lead</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addons" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addOnServices.map((addon) => (
              <Card key={addon.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <addon.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{addon.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{addon.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {addon.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <Check className="w-3 h-3 text-green-500 mr-2" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">{addon.price}</span>
                        <Button size="sm">Add to Cart</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          {currentPromotions.length > 0 ? (
            <div className="space-y-4">
              {currentPromotions.map((promotion, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{promotion.property}</h3>
                        <p className="text-sm text-muted-foreground">{promotion.package}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {promotion.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{promotion.views}</div>
                        <div className="text-sm text-muted-foreground">Total Views</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{promotion.leads}</div>
                        <div className="text-sm text-muted-foreground">Leads Generated</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{promotion.progress}%</div>
                        <div className="text-sm text-muted-foreground">Campaign Progress</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Campaign Progress</span>
                        <span>{promotion.startDate} - {promotion.endDate}</span>
                      </div>
                      <Progress value={promotion.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Promotions</h3>
                <p className="text-muted-foreground mb-4">Start promoting your properties to get more leads</p>
                <Button>Promote a Property</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {packageHistory.length > 0 ? (
            <div className="space-y-4">
              {packageHistory.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{item.property}</h3>
                        <p className="text-sm text-muted-foreground">{item.package} • {item.duration}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{item.amount}</div>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{item.totalViews}</div>
                        <div className="text-xs text-muted-foreground">Total Views</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-xl font-bold text-green-600">{item.totalLeads}</div>
                        <div className="text-xs text-muted-foreground">Total Leads</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-xl font-bold text-purple-600">{item.conversions}</div>
                        <div className="text-xs text-muted-foreground">Conversions</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-xl font-bold text-orange-600">
                          {((item.conversions / item.totalLeads) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Conversion Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No History Available</h3>
                <p className="text-muted-foreground">Your promotion history will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorPackages;
*/

// Placeholder component for future use
const VendorPackages = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Packages Feature Coming Soon</h2>
        <p className="text-gray-600">This feature will be available in a future update.</p>
      </div>
    </div>
  );
};

export default VendorPackages;