import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface SubscriptionPlan {
  _id: string;
  name: string;
  tier: 'basic' | 'premium' | 'enterprise';
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: string[];
  limits: {
    properties: number;
    leads: number;
    messages: number;
    analytics: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
  };
  isPopular: boolean;
  isActive: boolean;
}

export interface VendorSubscription {
  _id: string;
  vendorId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'trial';
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  autoRenew: boolean;
  trialEndsAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface Payment {
  _id: string;
  vendorId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'bank_transfer' | 'upi' | 'wallet';
  paymentGateway: 'razorpay' | 'stripe' | 'payu';
  transactionId?: string;
  gatewayOrderId?: string;
  description: string;
  paidAt?: string;
  failureReason?: string;
  refundAmount?: number;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  vendorId: string;
  subscriptionId: string;
  paymentId?: string;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  vendorDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    gst?: string;
  };
  downloadUrl?: string;
}

export interface BillingStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  nextBillingAmount: number;
  nextBillingDate: string;
  subscriptionStatus: string;
  usageStats: {
    properties: { used: number; limit: number };
    leads: { used: number; limit: number };
    messages: { used: number; limit: number };
  };
}

export interface BillingFilters {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: 'payments' | 'invoices' | 'subscriptions';
  sortBy?: 'createdAt' | 'amount' | 'dueDate';
  sortOrder?: 'asc' | 'desc';
}

class BillingService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || "An error occurred");
      }

      return await response.json();
    } catch (error) {
      console.error("Billing API request failed:", error);
      throw error;
    }
  }

  // Subscription Management
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        data: SubscriptionPlan[];
      }>("/billing/plans");

      return response.success ? response.data : [];
    } catch (error) {
      console.error("Failed to fetch subscription plans:", error);
      return [];
    }
  }

  async getCurrentSubscription(): Promise<VendorSubscription | null> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        data: VendorSubscription;
      }>("/vendors/subscription/current");

      return response.success ? response.data : null;
    } catch (error) {
      console.error("Failed to fetch current subscription:", error);
      return null;
    }
  }

  async upgradeSubscription(planId: string, billingCycle: 'monthly' | 'yearly'): Promise<{ success: boolean; paymentUrl?: string; message: string }> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        data: { paymentUrl?: string };
        message: string;
      }>("/vendors/subscription/upgrade", {
        method: "POST",
        body: JSON.stringify({ planId, billingCycle }),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Subscription upgrade initiated!",
        });
      }

      return {
        success: response.success,
        paymentUrl: response.data?.paymentUrl,
        message: response.message
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upgrade subscription";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, message: errorMessage };
    }
  }

  async cancelSubscription(reason?: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        message: string;
      }>("/vendors/subscription/cancel", {
        method: "POST",
        body: JSON.stringify({ reason }),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Subscription cancelled successfully!",
        });
        return true;
      }

      throw new Error(response.message || "Failed to cancel subscription");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel subscription";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }

  async reactivateSubscription(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        message: string;
      }>("/vendors/subscription/reactivate", {
        method: "POST",
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Subscription reactivated successfully!",
        });
        return true;
      }

      throw new Error(response.message || "Failed to reactivate subscription");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reactivate subscription";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }

  // Payment Management
  async getPayments(filters: BillingFilters = {}): Promise<{
    payments: Payment[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/vendors/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await this.makeRequest<{
        success: boolean;
        data: {
          payments: Payment[];
          totalCount: number;
          totalPages: number;
          currentPage: number;
        };
      }>(endpoint);

      if (response.success && response.data) {
        return response.data;
      }

      return {
        payments: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      return {
        payments: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
    }
  }

  // Invoice Management
  async getInvoices(filters: BillingFilters = {}): Promise<{
    invoices: Invoice[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = `/vendors/invoices${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await this.makeRequest<{
        success: boolean;
        data: {
          invoices: Invoice[];
          totalCount: number;
          totalPages: number;
          currentPage: number;
        };
      }>(endpoint);

      if (response.success && response.data) {
        return response.data;
      }

      return {
        invoices: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      return {
        invoices: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
      };
    }
  }

  async downloadInvoice(invoiceId: string): Promise<Blob | null> {
    try {
      // First try to get invoice details to generate PDF
      const invoiceDetails = await this.getInvoiceDetails(invoiceId);
      if (invoiceDetails) {
        return this.generateInvoicePDF(invoiceDetails);
      }

      // Fallback to server download if invoice details not available
      const response = await fetch(`${API_BASE_URL}/vendors/invoices/${invoiceId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to download invoice";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error("Invalid invoice format received from server");
      }

      const blob = await response.blob();

      // Check if blob has content
      if (blob.size === 0) {
        throw new Error("Invoice file is empty");
      }

      toast({
        title: "Success",
        description: "Invoice downloaded successfully!",
      });

      return blob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to download invoice";
      console.error("Invoice download error:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  }

  private generateInvoicePDF(invoice: Invoice): Blob {
    // Create A4 document (210 x 297 mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    try {
      // Set margins for A4
      const marginLeft = 20;
      const marginRight = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - marginLeft - marginRight;

      let yPosition = 25;

      // Header with borders
      doc.setFontSize(18);
      doc.setFont('courier', 'bold');
      const headerText = '=====================================';
      doc.text(headerText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(14);
      doc.text('         INVOICE', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(18);
      doc.text(headerText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Invoice details
      doc.setFontSize(10);
      doc.setFont('courier', 'normal');
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, marginLeft, yPosition);
      yPosition += 7;
      doc.text(`Issue Date: ${this.formatDate(invoice.issueDate)}`, marginLeft, yPosition);
      yPosition += 7;
      doc.text(`Due Date: ${this.formatDate(invoice.dueDate)}`, marginLeft, yPosition);
      yPosition += 7;
      doc.text(`Status: ${invoice.status.toUpperCase()}`, marginLeft, yPosition);
      yPosition += 15;

      // Bill to section
      doc.setFontSize(11);
      doc.setFont('courier', 'bold');
      doc.text('Bill To:', marginLeft, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.text(invoice.vendorDetails.name, marginLeft, yPosition);
      yPosition += 6;
      doc.text(invoice.vendorDetails.email, marginLeft, yPosition);
      yPosition += 6;
      doc.text(invoice.vendorDetails.phone, marginLeft, yPosition);
      yPosition += 6;
      if (invoice.vendorDetails.address) {
        doc.text(invoice.vendorDetails.address, marginLeft, yPosition);
        yPosition += 6;
      }
      if (invoice.vendorDetails.gst) {
        doc.text(`GST: ${invoice.vendorDetails.gst}`, marginLeft, yPosition);
        yPosition += 6;
      }
      yPosition += 8;

      // Items section
      doc.setFontSize(11);
      doc.setFont('courier', 'bold');
      doc.text('Items:', marginLeft, yPosition);
      yPosition += 7;

      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      const separator = '-------------------------------------';
      doc.text(separator, marginLeft, yPosition);
      yPosition += 7;

      // Items list
      invoice.items.forEach(item => {
        doc.text(`Description: ${item.description}`, marginLeft, yPosition);
        yPosition += 5;
        doc.text(`Quantity: ${item.quantity}`, marginLeft, yPosition);
        yPosition += 5;
        doc.text(`Unit Price: ₹${this.formatCurrency(item.unitPrice)}`, marginLeft, yPosition);
        yPosition += 5;
        doc.text(`Total: ₹${this.formatCurrency(item.total)}`, marginLeft, yPosition);
        yPosition += 8;
      });

      doc.text(separator, marginLeft, yPosition);
      yPosition += 8;

      // Totals section
      doc.setFontSize(10);
      doc.setFont('courier', 'normal');
      doc.text(`Subtotal: ₹${this.formatCurrency(invoice.amount)}`, marginLeft, yPosition);
      yPosition += 6;
      doc.text(`Tax (${invoice.tax > 0 ? Math.round((invoice.tax / invoice.amount) * 100) : 18}% GST): ₹${this.formatCurrency(invoice.tax)}`, marginLeft, yPosition);
      yPosition += 10;

      // Total with borders
      doc.setFontSize(12);
      doc.setFont('courier', 'bold');
      doc.text('=====================================', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 7;
      doc.text(`TOTAL: ₹${this.formatCurrency(invoice.total)}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 7;
      doc.text('=====================================', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Payment info
      if (invoice.paidDate) {
        doc.setFontSize(10);
        doc.setFont('courier', 'normal');
        doc.text(`Payment Method: ${invoice.status === 'paid' ? 'Razorpay' : 'Pending'}`, marginLeft, yPosition);
        yPosition += 6;
        doc.text(`Paid Date: ${this.formatDate(invoice.paidDate)}`, marginLeft, yPosition);
        yPosition += 15;
      }

      // Footer
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });

      doc.setFontSize(11);
      doc.setFont('courier', 'bold');
      doc.text('BuildHomeMartSquares', pageWidth / 2, pageHeight - 12, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.text('www.buildhomemartsquares.com', pageWidth / 2, pageHeight - 6, { align: 'center' });

      return doc.output('blob');
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw new Error('Failed to generate invoice PDF');
    }
  }

  // Statistics
  async getBillingStats(): Promise<BillingStats> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        data: BillingStats;
      }>("/vendors/billing/stats");

      if (response.success && response.data) {
        return response.data;
      }

      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeSubscriptions: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        overdueInvoices: 0,
        nextBillingAmount: 0,
        nextBillingDate: new Date().toISOString(),
        subscriptionStatus: 'inactive',
        usageStats: {
          properties: { used: 0, limit: 0 },
          leads: { used: 0, limit: 0 },
          messages: { used: 0, limit: 0 },
        },
      };
    } catch (error) {
      console.error("Failed to fetch billing stats:", error);
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeSubscriptions: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        overdueInvoices: 0,
        nextBillingAmount: 0,
        nextBillingDate: new Date().toISOString(),
        subscriptionStatus: 'inactive',
        usageStats: {
          properties: { used: 0, limit: 0 },
          leads: { used: 0, limit: 0 },
          messages: { used: 0, limit: 0 },
        },
      };
    }
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getStatusColor(status: string): string {
    const colors = {
      active: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
      expired: 'text-orange-600 bg-orange-100',
      pending: 'text-yellow-600 bg-yellow-100',
      trial: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100',
      refunded: 'text-purple-600 bg-purple-100',
      paid: 'text-green-600 bg-green-100',
      overdue: 'text-red-600 bg-red-100',
      sent: 'text-blue-600 bg-blue-100',
      draft: 'text-gray-600 bg-gray-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  }

  getUsagePercentage(used: number, limit: number): number {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async getPaymentDetails(paymentId: string): Promise<Payment | null> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        data: Payment;
      }>(`/vendors/payments/${paymentId}`);

      return response.success ? response.data : null;
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      toast({
        title: "Error",
        description: "Failed to load payment details",
        variant: "destructive",
      });
      return null;
    }
  }

  async getInvoiceDetails(invoiceId: string): Promise<Invoice | null> {
    try {
      const response = await this.makeRequest<{
        success: boolean;
        data: Invoice;
      }>(`/vendors/invoices/${invoiceId}`);

      return response.success ? response.data : null;
    } catch (error) {
      console.error("Failed to fetch invoice details:", error);
      toast({
        title: "Error",
        description: "Failed to load invoice details",
        variant: "destructive",
      });
      return null;
    }
  }

  async downloadReceipt(paymentId: string): Promise<Blob | null> {
    try {
      // First try to get payment details to generate PDF
      const paymentDetails = await this.getPaymentDetails(paymentId);
      if (paymentDetails) {
        return this.generateReceiptPDF(paymentDetails);
      }

      // Fallback to server download if payment details not available
      const response = await fetch(`${API_BASE_URL}/vendors/payments/${paymentId}/receipt`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to download receipt";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error("Invalid receipt format received from server");
      }

      const blob = await response.blob();

      // Check if blob has content
      if (blob.size === 0) {
        throw new Error("Receipt file is empty");
      }

      toast({
        title: "Success",
        description: "Receipt downloaded successfully!",
      });

      return blob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to download receipt";
      console.error("Receipt download error:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  }

  private generateReceiptPDF(payment: Payment): Blob {
    // Create A4 document (210 x 297 mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    try {
      // Set margins for A4
      const marginLeft = 20;
      const marginRight = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      let yPosition = 25;

      // Header with borders
      doc.setFontSize(18);
      doc.setFont('courier', 'bold');
      const headerText = '=====================================';
      doc.text(headerText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(14);
      doc.text('       PAYMENT RECEIPT', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(18);
      doc.text(headerText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Receipt details
      doc.setFontSize(10);
      doc.setFont('courier', 'normal');
      doc.text(`Receipt #: ${payment._id.slice(-8).toUpperCase()}`, marginLeft, yPosition);
      yPosition += 7;
      doc.text(`Date: ${this.formatDate(payment.paidAt || payment.createdAt)}`, marginLeft, yPosition);
      yPosition += 7;
      doc.text(`Status: ${payment.status.toUpperCase()}`, marginLeft, yPosition);
      yPosition += 15;

      // Payment details section
      doc.setFontSize(11);
      doc.setFont('courier', 'bold');
      doc.text('Payment Details:', marginLeft, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      const separator = '-------------------------------------';
      doc.text(separator, marginLeft, yPosition);
      yPosition += 7;

      // Payment information
      doc.text(`Description: ${payment.description || 'Payment'}`, marginLeft, yPosition);
      yPosition += 5;
      doc.text(`Amount: ₹${this.formatCurrency(payment.amount)}`, marginLeft, yPosition);
      yPosition += 8;

      doc.text(separator, marginLeft, yPosition);
      yPosition += 8;

      // Transaction details
      doc.setFontSize(11);
      doc.setFont('courier', 'bold');
      doc.text('Transaction Details:', marginLeft, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.text(separator, marginLeft, yPosition);
      yPosition += 7;

      doc.text(`Payment Method: ${payment.paymentMethod.replace('_', ' ').toUpperCase()}`, marginLeft, yPosition);
      yPosition += 5;

      if (payment.transactionId) {
        doc.text(`Transaction ID: ${payment.transactionId}`, marginLeft, yPosition);
        yPosition += 5;
      }

      if (payment.gatewayOrderId) {
        doc.text(`Gateway Order ID: ${payment.gatewayOrderId}`, marginLeft, yPosition);
        yPosition += 5;
      }

      doc.text(`Payment Gateway: ${payment.paymentGateway.toUpperCase()}`, marginLeft, yPosition);
      yPosition += 5;

      // Add subscription info if available
      if (payment.subscriptionId) {
        doc.text(`Subscription ID: ${payment.subscriptionId.slice(-8).toUpperCase()}`, marginLeft, yPosition);
        yPosition += 5;
      }

      doc.text(separator, marginLeft, yPosition);
      yPosition += 15;

      // Footer
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });

      doc.setFontSize(11);
      doc.setFont('courier', 'bold');
      doc.text('BuildHomeMartSquares', pageWidth / 2, pageHeight - 12, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.text('www.buildhomemartsquares.com', pageWidth / 2, pageHeight - 6, { align: 'center' });

      return doc.output('blob');
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      throw new Error('Failed to generate receipt PDF');
    }
  }

  async exportBillingData(format: 'csv' | 'pdf' | 'excel', filters: BillingFilters = {}): Promise<Blob | null> {
    try {
      if (format === 'pdf') {
        // Generate PDF client-side for better formatting
        return this.generateBillingReportPDF(filters);
      }

      const queryParams = new URLSearchParams();
      queryParams.append('format', format);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_BASE_URL}/vendors/billing/export?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export billing data");
      }

      const blob = await response.blob();

      toast({
        title: "Success",
        description: "Billing data exported successfully!",
      });

      return blob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to export billing data";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  }

  private async generateBillingReportPDF(filters: BillingFilters = {}): Promise<Blob> {
    // Create A4 document (210 x 297 mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    try {
      // Set margins for A4
      const marginLeft = 20;
      const marginRight = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - marginLeft - marginRight;

      let yPosition = 25;

      // Add header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('BILLING REPORT', pageWidth / 2, yPosition, { align: 'center' });

      // Add date range
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      yPosition += 15;
      const dateRange = filters.dateFrom && filters.dateTo
        ? `${this.formatDate(filters.dateFrom)} - ${this.formatDate(filters.dateTo)}`
        : 'All Time';
      doc.text(`Report Period: ${dateRange}`, marginLeft, yPosition);
      yPosition += 8;
      doc.text(`Generated: ${this.formatDate(new Date().toISOString())}`, marginLeft, yPosition);

      yPosition += 20;

      // Get billing stats
      const stats = await this.getBillingStats();

      // Add summary section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', marginLeft, yPosition);
      yPosition += 10;

      const summaryData = [
        ['Metric', 'Value'],
        ['Total Revenue', `₹${this.formatCurrency(stats.totalRevenue)}`],
        ['Monthly Revenue', `₹${this.formatCurrency(stats.monthlyRevenue)}`],
        ['Active Subscriptions', stats.activeSubscriptions.toString()],
        ['Total Invoices', stats.totalInvoices.toString()],
        ['Paid Invoices', stats.paidInvoices.toString()],
        ['Overdue Invoices', stats.overdueInvoices.toString()],
      ];

      autoTable(doc, {
        body: summaryData,
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], fontSize: 10 },
        columnStyles: {
          0: { cellWidth: contentWidth * 0.6 },
          1: { cellWidth: contentWidth * 0.4, halign: 'right' }
        },
        margin: { left: marginLeft, right: marginRight }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;

      // Get payments data
      const paymentsData = await this.getPayments(filters);
      if (paymentsData.payments.length > 0) {
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 25;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Recent Payments', marginLeft, yPosition);
        yPosition += 10;

        const paymentsTableData = [
          ['Date', 'Description', 'Amount', 'Status', 'Method']
        ];

        paymentsData.payments.slice(0, 10).forEach(payment => {
          paymentsTableData.push([
            this.formatDate(payment.paidAt || payment.createdAt),
            payment.description,
            `₹${this.formatCurrency(payment.amount)}`,
            payment.status.toUpperCase(),
            payment.paymentMethod.replace('_', ' ').toUpperCase()
          ]);
        });

        autoTable(doc, {
          body: paymentsTableData,
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [52, 152, 219], fontSize: 8 },
          columnStyles: {
            0: { cellWidth: contentWidth * 0.2 },
            1: { cellWidth: contentWidth * 0.35 },
            2: { cellWidth: contentWidth * 0.2, halign: 'right' },
            3: { cellWidth: contentWidth * 0.15, halign: 'center' },
            4: { cellWidth: contentWidth * 0.1 }
          },
          margin: { left: marginLeft, right: marginRight }
        });
      }

      // Get invoices data
      const invoicesData = await this.getInvoices(filters);
      if (invoicesData.invoices.length > 0) {
        yPosition = (doc as any).lastAutoTable.finalY + 15;

        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 25;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Recent Invoices', marginLeft, yPosition);
        yPosition += 10;

        const invoicesTableData = [
          ['Invoice #', 'Date', 'Amount', 'Status']
        ];

        invoicesData.invoices.slice(0, 10).forEach(invoice => {
          invoicesTableData.push([
            invoice.invoiceNumber,
            this.formatDate(invoice.issueDate),
            `₹${this.formatCurrency(invoice.total)}`,
            invoice.status.toUpperCase()
          ]);
        });

        autoTable(doc, {
          body: invoicesTableData,
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [155, 89, 182], fontSize: 9 },
          columnStyles: {
            0: { cellWidth: contentWidth * 0.3 },
            1: { cellWidth: contentWidth * 0.25 },
            2: { cellWidth: contentWidth * 0.25, halign: 'right' },
            3: { cellWidth: contentWidth * 0.2, halign: 'center' }
          },
          margin: { left: marginLeft, right: marginRight }
        });
      }

      // Add footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Generated by Squares Billing System', pageWidth / 2, pageHeight - 10, { align: 'center' });

      return doc.output('blob');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      // Create a basic error PDF
      const errorDoc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const pageWidth = errorDoc.internal.pageSize.getWidth();
      const pageHeight = errorDoc.internal.pageSize.getHeight();

      errorDoc.setFontSize(16);
      errorDoc.setFont('helvetica', 'bold');
      errorDoc.text('BILLING REPORT', pageWidth / 2, 40, { align: 'center' });
      errorDoc.setFontSize(12);
      errorDoc.setFont('helvetica', 'normal');
      errorDoc.text('Error generating detailed report.', 20, 60);
      errorDoc.text('Please try again later.', 20, 70);
      return errorDoc.output('blob');
    }
  }
}

export const billingService = new BillingService();
export default billingService;