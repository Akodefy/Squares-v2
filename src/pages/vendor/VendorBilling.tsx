import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  TrendingUp,
  Wallet,
  RefreshCw,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const VendorBilling = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("current");
  const [searchQuery, setSearchQuery] = useState("");

  const billingStats = {
    currentBalance: "₹8,450",
    pendingAmount: "₹2,340",
    totalEarnings: "₹1,25,600",
    nextPayout: "₹6,110",
    payoutDate: "Nov 5, 2024"
  };

  const recentTransactions = [
    {
      id: "TXN001",
      type: "commission",
      description: "Commission from Luxury 3BHK Apartment sale",
      amount: "₹45,000",
      status: "completed",
      date: "2024-10-22",
      property: "Luxury 3BHK Apartment in Powai",
      client: "Rahul Sharma"
    },
    {
      id: "TXN002",
      type: "service",
      description: "Moving service commission",
      amount: "₹1,200",
      status: "completed",
      date: "2024-10-21",
      property: "Modern Villa with Private Garden",
      client: "Priya Patel"
    },
    {
      id: "TXN003",
      type: "promotion",
      description: "Premium package payment",
      amount: "-₹2,499",
      status: "completed",
      date: "2024-10-20",
      property: "Commercial Office Space",
      client: "Package Purchase"
    },
    {
      id: "TXN004",
      type: "commission",
      description: "Property consultation fee",
      amount: "₹3,500",
      status: "pending",
      date: "2024-10-19",
      property: "Budget 2BHK Flat",
      client: "Sneha Reddy"
    }
  ];

  const invoices = [
    {
      id: "INV-2024-001",
      period: "October 2024",
      amount: "₹48,700",
      status: "paid",
      dueDate: "2024-10-31",
      paidDate: "2024-10-28",
      items: [
        { description: "Property commission (3 sales)", amount: "₹45,000" },
        { description: "Service commissions", amount: "₹3,700" }
      ]
    },
    {
      id: "INV-2024-002",
      period: "September 2024",
      amount: "₹32,450",
      status: "paid",
      dueDate: "2024-09-30",
      paidDate: "2024-09-25",
      items: [
        { description: "Property commission (2 sales)", amount: "₹30,000" },
        { description: "Service commissions", amount: "₹2,450" }
      ]
    },
    {
      id: "INV-2024-003",
      period: "August 2024",
      amount: "₹28,200",
      status: "overdue",
      dueDate: "2024-08-31",
      paidDate: null,
      items: [
        { description: "Property commission (2 sales)", amount: "₹25,000" },
        { description: "Service commissions", amount: "₹3,200" }
      ]
    }
  ];

  const paymentMethods = [
    {
      id: 1,
      type: "bank",
      name: "HDFC Bank",
      details: "****1234",
      isDefault: true,
      status: "verified"
    },
    {
      id: 2,
      type: "upi",
      name: "PhonePe",
      details: "vendor@phonepe",
      isDefault: false,
      status: "verified"
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "commission": return <DollarSign className="w-4 h-4 text-green-600" />;
      case "service": return <FileText className="w-4 h-4 text-blue-600" />;
      case "promotion": return <TrendingUp className="w-4 h-4 text-orange-600" />;
      default: return <Receipt className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      case "paid": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "paid": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
      case "overdue": return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
          <p className="text-muted-foreground">Manage your earnings, payments, and billing history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Statement
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Balance
          </Button>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-green-600">{billingStats.currentBalance}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">{billingStats.pendingAmount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-blue-600">{billingStats.totalEarnings}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Payout</p>
                <p className="text-2xl font-bold text-purple-600">{billingStats.nextPayout}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Next Payout Date</p>
            <p className="text-lg font-bold">{billingStats.payoutDate}</p>
            <Button size="sm" className="mt-2">
              Request Early Payout
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="tax-documents">Tax Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="last">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="bg-muted p-2 rounded-lg">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{transaction.description}</h4>
                        <p className="text-sm text-muted-foreground">{transaction.property}</p>
                        <p className="text-xs text-muted-foreground">Client: {transaction.client}</p>
                        <div className="flex items-center mt-2">
                          {getStatusIcon(transaction.status)}
                          <Badge className={`ml-2 ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.amount}
                      </p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      <p className="text-xs text-muted-foreground">ID: {transaction.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{invoice.id}</h4>
                      <p className="text-muted-foreground">{invoice.period}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{invoice.amount}</p>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">{invoice.dueDate}</p>
                    </div>
                    {invoice.paidDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Paid Date</p>
                        <p className="font-medium">{invoice.paidDate}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium">Invoice Items:</h5>
                    {invoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.description}</span>
                        <span className="font-medium">{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Payment Methods</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.map((method) => (
              <Card key={method.id} className={`hover:shadow-md transition-shadow ${
                method.isDefault ? 'ring-2 ring-primary' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{method.name}</h4>
                        <p className="text-sm text-muted-foreground">{method.details}</p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <Badge>Default</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(method.status)}>
                      {method.status}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      {!method.isDefault && (
                        <Button variant="outline" size="sm">Set Default</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tax-documents" className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tax Documents</h3>
              <p className="text-muted-foreground mb-4">
                Your tax documents and receipts will be available here
              </p>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Tax Summary
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorBilling;