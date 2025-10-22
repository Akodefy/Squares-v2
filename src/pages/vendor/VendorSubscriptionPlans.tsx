import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap, ArrowRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const VendorSubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      id: "basic",
      name: "Basic",
      icon: Zap,
      description: "Perfect for new vendors getting started",
      monthlyPrice: 999,
      yearlyPrice: 9990,
      yearlyDiscount: 17,
      features: [
        "Up to 10 property listings",
        "Basic lead management",
        "Email support",
        "Standard property photos",
        "Basic analytics",
        "Property status updates"
      ],
      limitations: [
        "No featured listings",
        "No priority support",
        "Limited customization"
      ],
      popular: false
    },
    {
      id: "premium",
      name: "Premium",
      icon: Crown,
      description: "Most popular choice for active vendors",
      monthlyPrice: 2499,
      yearlyPrice: 24990,
      yearlyDiscount: 17,
      features: [
        "Up to 50 property listings",
        "Advanced lead management",
        "Priority email & phone support",
        "HD property photos & videos",
        "Detailed analytics & insights",
        "Featured listings (5 per month)",
        "Custom property brochures",
        "Lead scoring & tracking",
        "Social media integration",
        "Mobile app access"
      ],
      limitations: [],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: Star,
      description: "For large vendors and agencies",
      monthlyPrice: 4999,
      yearlyPrice: 49990,
      yearlyDiscount: 17,
      features: [
        "Unlimited property listings",
        "Complete CRM integration",
        "24/7 dedicated support",
        "Professional photography service",
        "Advanced analytics & reports",
        "Unlimited featured listings",
        "Custom branding & themes",
        "API access",
        "Multi-user accounts",
        "White-label solutions",
        "Virtual tour creation",
        "Marketing automation"
      ],
      limitations: [],
      popular: false
    }
  ];

  const addOnServices = [
    {
      name: "Professional Photography",
      description: "High-quality photos by professional photographers",
      price: 2999,
      unit: "per property"
    },
    {
      name: "Virtual Tour Creation",
      description: "360° virtual tours for immersive property viewing",
      price: 4999,
      unit: "per property"
    },
    {
      name: "Drone Photography",
      description: "Aerial shots and videos for premium properties",
      price: 3999,
      unit: "per property"
    },
    {
      name: "Social Media Marketing",
      description: "Promoted posts on Facebook, Instagram, and Google",
      price: 1999,
      unit: "per month"
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCurrentPrice = (plan: any) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getDisplayPrice = (plan: any) => {
    const price = getCurrentPrice(plan);
    if (billingCycle === "yearly") {
      return `${formatPrice(price)}/year`;
    }
    return `${formatPrice(price)}/month`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your business needs. Upgrade or downgrade anytime.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <RadioGroup
            value={billingCycle}
            onValueChange={setBillingCycle}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly">Monthly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yearly" id="yearly" />
              <Label htmlFor="yearly">Yearly</Label>
              <Badge variant="secondary" className="ml-2">Save 17%</Badge>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 ${
                plan.popular 
                  ? 'ring-2 ring-primary shadow-lg scale-105' 
                  : isSelected 
                    ? 'ring-2 ring-primary/50' 
                    : 'hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.popular ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      plan.popular ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    {getDisplayPrice(plan)}
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(plan.monthlyPrice)}/month billed yearly
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {isSelected ? "Current Plan" : "Choose Plan"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {plan.popular && (
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      14-day free trial
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add-on Services */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Add-on Services</h2>
          <p className="text-muted-foreground">
            Enhance your listings with professional services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addOnServices.map((service, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-bold text-lg">
                      {formatPrice(service.price)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {service.unit}
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Add to Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Current Plan Status */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Current Plan: Premium (Monthly)</h3>
              <p className="text-sm text-muted-foreground">
                Next billing date: March 15, 2024
              </p>
            </div>
            <div className="space-x-3">
              <Button variant="outline">Manage Plan</Button>
              <Button>Upgrade Plan</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorSubscriptionPlans;