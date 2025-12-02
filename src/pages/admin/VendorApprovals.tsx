import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Download,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  User,
  MapPin
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth, handleApiResponse } from '@/utils/apiUtils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface VendorApplication {
  _id: string;
  businessInfo: {
    companyName: string;
    businessType: string;
    licenseNumber?: string;
    gstNumber?: string;
    panNumber?: string;
    website?: string;
  };
  user: {
    _id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
    };
    createdAt: string;
  };
  approval: {
    status: 'pending' | 'approved' | 'rejected' | 'under_review';
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: {
      profile: {
        firstName: string;
        lastName: string;
      };
      email: string;
    };
    approvalNotes?: string;
    rejectionReason?: string;
    submittedDocuments: Array<{
      documentType: string;
      documentName: string;
      documentUrl: string;
      verified: boolean;
      rejectionReason?: string;
    }>;
  };
  professionalInfo?: {
    experience: number;
    // specializations: string[];
    serviceAreas: Array<{
      city: string;
      state: string;
    }>;
  };
  contactInfo?: {
    officeAddress?: {
      city: string;
      state: string;
    };
  };
}

interface VendorApprovalStats {
  overview: {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    underReviewApplications: number;
    approvalRate: number;
  };
  trends: {
    thisMonthApplications: number;
    lastMonthApplications: number;
    growth: number;
  };
  recentApplications: Array<{
    id: string;
    companyName: string;
    applicantName: string;
    submittedAt: string;
    status: string;
  }>;
}

const VendorApprovals: React.FC = () => {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [stats, setStats] = useState<VendorApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: 'pending',
    search: '',
    businessType: '',
    experienceMin: '',
    experienceMax: '',
    page: 1,
    limit: 10
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Approval/Rejection form state
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [approverName, setApproverName] = useState("");
  const [checklist, setChecklist] = useState({
    businessVerified: false,
    documentsVerified: false,
    licenseValid: false,
    experienceConfirmed: false,
    referencesChecked: false,
    complianceVerified: false,
  });
  const [handwrittenComments, setHandwrittenComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        status: filters.status,
        search: filters.search,
        businessType: filters.businessType,
        experienceMin: filters.experienceMin,
        experienceMax: filters.experienceMax,
        sortBy: 'submittedAt',
        sortOrder: 'desc'
      });

      const response = await fetchWithAuth(`/admin/vendor-approvals?${queryParams}`);
      const data = await handleApiResponse<{ data: { vendors: VendorApplication[] } }>(response);
      setApplications(data.data.vendors || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch vendor applications",
        variant: "destructive"
      });
      setApplications([]);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetchWithAuth('/admin/vendor-approval-stats');
      const data = await handleApiResponse<{ data: VendorApprovalStats }>(response);
      setStats(data.data || null);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch statistics",
        variant: "destructive"
      });
      setStats(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchApplications(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [filters.status, filters.page, filters.search, filters.businessType, filters.experienceMin, filters.experienceMax]);

  const resetApprovalForm = () => {
    setChecklist({
      businessVerified: false,
      documentsVerified: false,
      licenseValid: false,
      experienceConfirmed: false,
      referencesChecked: false,
      complianceVerified: false,
    });
    setHandwrittenComments("");
    setRejectionReason("");
    setApproverName("");
  };

  const openApprovalDialog = (application: VendorApplication, type: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setActionType(type);
    resetApprovalForm();
    setApprovalDialogOpen(true);
  };

  // Handle approval
  const handleApprove = async () => {
    if (!selectedApplication || !approverName.trim()) {
      toast({
        title: "Error",
        description: "Approver name is required",
        variant: "destructive"
      });
      return;
    }

    setActionLoading('approve');

    try {
      const response = await fetchWithAuth(`/admin/vendor-approvals/${selectedApplication._id}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          approvalNotes: handwrittenComments,
          verificationLevel: 'basic'
        })
      });

      const data = await handleApiResponse<{ success: boolean; message: string }>(response);

      if (!data.success) throw new Error(data.message || 'Failed to approve vendor');

      toast({
        title: "Success",
        description: "Vendor application approved successfully",
        variant: "default"
      });

      fetchApplications();
      fetchStats();
      setShowDetails(false);
      setApprovalDialogOpen(false);
      resetApprovalForm();
    } catch (error) {
      console.error('Error approving vendor:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve vendor application",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle rejection
  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason.trim() || !approverName.trim()) {
      toast({
        title: "Error",
        description: "Approver name and rejection reason are required",
        variant: "destructive"
      });
      return;
    }

    setActionLoading('reject');

    try {
      const response = await fetchWithAuth(`/admin/vendor-approvals/${selectedApplication._id}/reject`, {
        method: 'POST',
        body: JSON.stringify({
          rejectionReason,
          allowResubmission: true
        })
      });

      const data = await handleApiResponse<{ success: boolean; message: string }>(response);

      if (!data.success) throw new Error(data.message || 'Failed to reject vendor');

      toast({
        title: "Success",
        description: "Vendor application rejected and vendor notified",
        variant: "default"
      });

      fetchApplications();
      fetchStats();
      setShowDetails(false);
      setApprovalDialogOpen(false);
      resetApprovalForm();
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject vendor application",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock },
      approved: { variant: 'default' as const, icon: CheckCircle },
      rejected: { variant: 'destructive' as const, icon: XCircle },
      under_review: { variant: 'default' as const, icon: Eye }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-start md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Vendor Applications</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">Review and manage vendor applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Pending</CardTitle>
              <Clock className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{stats.overview.pendingApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{stats.overview.approvedApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Under Review</CardTitle>
              <Eye className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{stats.overview.underReviewApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Approval Rate</CardTitle>
              <FileText className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{stats.overview.approvalRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Primary Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name, email, or license number..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="pl-10"
            />
          </div>
          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select value={filters.businessType || "all"} onValueChange={(value) => setFilters({ ...filters, businessType: value === "all" ? "" : value, page: 1 })}>
            <SelectTrigger>
              <SelectValue placeholder="Business Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Real Estate Agent">Real Estate Agent</SelectItem>
              <SelectItem value="Property Developer">Property Developer</SelectItem>
              <SelectItem value="Construction Company">Construction Company</SelectItem>
              <SelectItem value="Interior Designer">Interior Designer</SelectItem>
              <SelectItem value="Property Manager">Property Manager</SelectItem>
              <SelectItem value="Legal Services">Legal Services</SelectItem>
              <SelectItem value="Financial Services">Financial Services</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min Experience (years)"
            value={filters.experienceMin}
            onChange={(e) => setFilters({ ...filters, experienceMin: e.target.value, page: 1 })}
          />

          <Input
            type="number"
            placeholder="Max Experience (years)"
            value={filters.experienceMax}
            onChange={(e) => setFilters({ ...filters, experienceMax: e.target.value, page: 1 })}
          />
        </div>
      </div>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {applications.length === 0 ? (
              <li className="p-6 text-center text-muted-foreground">
                No applications found matching your criteria
              </li>
            ) : (
              applications.map((application) => (
                <li key={application._id} className="p-4 md:p-6 hover:bg-muted/50">
                  <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                          <div>
                            <h3 className="text-base md:text-lg font-medium">
                              {application.businessInfo.companyName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {application.user?.profile?.firstName || 'N/A'} {application.user?.profile?.lastName || ''}
                            </p>
                          </div>
                          <StatusBadge status={application.approval.status} />
                        </div>

                        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-4 md:space-y-0">
                          <div className="text-left md:text-right text-sm text-muted-foreground">
                            <p>Submitted: {formatDate(application.approval.submittedAt)}</p>
                            <p>Documents: {application.approval.submittedDocuments.length}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowDetails(true);
                            }}
                            className="w-full md:w-auto"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-sm text-muted-foreground">
                        {application.user?.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{application.user.email}</span>
                          </div>
                        )}
                        {application.user?.profile?.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{application.user.profile.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{application.businessInfo.businessType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Vendor Application Details</DialogTitle>
            <DialogDescription>Review and take action on the vendor application.</DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4 md:space-y-6 py-2 md:py-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium text-muted-foreground">Company Name:</span>
                      <span className="break-words">{selectedApplication.businessInfo.companyName}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium text-muted-foreground">Business Type:</span>
                      <span>{selectedApplication.businessInfo.businessType}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium text-muted-foreground">Contact Person:</span>
                      <span>{selectedApplication.user?.profile?.firstName || 'N/A'} {selectedApplication.user?.profile?.lastName || ''}</span>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium text-muted-foreground">Email:</span>
                      <span className="break-all">{selectedApplication.user?.email || 'N/A'}</span>
                    </div>
                    {selectedApplication.businessInfo.licenseNumber && (
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium text-muted-foreground">License Number:</span>
                        <span className="break-all">{selectedApplication.businessInfo.licenseNumber}</span>
                      </div>
                    )}
                    {selectedApplication.businessInfo.gstNumber && (
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium text-muted-foreground">GST Number:</span>
                        <span className="break-all">{selectedApplication.businessInfo.gstNumber}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Submitted Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedApplication.approval.submittedDocuments.map((doc, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/50 rounded-md gap-2 sm:gap-0">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{doc.documentName}</p>
                            <p className="text-xs text-muted-foreground">{doc.documentType.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-2 sm:flex-shrink-0">
                          {doc.verified ? (
                            <Badge variant="default" className="text-xs">Verified</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Pending</Badge>
                          )}
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline p-1"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDetails(false)} className="w-full sm:w-auto">
              Close
            </Button>
            {selectedApplication?.approval.status === 'pending' && (
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4 w-full sm:w-auto">
                <Button
                  onClick={() => {
                    setShowDetails(false);
                    openApprovalDialog(selectedApplication, 'reject');
                  }}
                  disabled={actionLoading === 'reject'}
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setShowDetails(false);
                    openApprovalDialog(selectedApplication, 'approve');
                  }}
                  disabled={actionLoading === 'approve'}
                  variant="default"
                  className="w-full sm:w-auto"
                >
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval/Rejection Form Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Vendor Application' : 'Reject Vendor Application'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? `Complete the verification checklist and provide your approval for ${selectedApplication?.businessInfo.companyName}.`
                : `Complete the form and provide a reason for rejecting ${selectedApplication?.businessInfo.companyName}. The vendor will be notified.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Approver Name */}
            <div className="space-y-2">
              <Label htmlFor="approver-name-vendor">Approver Name *</Label>
              <Input
                id="approver-name-vendor"
                placeholder="Enter your full name"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Verification Checklist */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {actionType === 'approve' ? 'Verification Checklist' : 'Issues Found (Check applicable items)'}
              </Label>
              <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="business"
                    checked={checklist.businessVerified}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, businessVerified: checked as boolean })
                    }
                  />
                  <label htmlFor="business" className="text-sm font-medium cursor-pointer">
                    {actionType === 'approve'
                      ? 'Business information is verified and legitimate'
                      : 'Business information is incomplete or invalid'
                    }
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="documents-vendor"
                    checked={checklist.documentsVerified}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, documentsVerified: checked as boolean })
                    }
                  />
                  <label htmlFor="documents-vendor" className="text-sm font-medium cursor-pointer">
                    {actionType === 'approve'
                      ? 'All required documents are submitted and verified'
                      : 'Required documents are missing or invalid'
                    }
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="license"
                    checked={checklist.licenseValid}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, licenseValid: checked as boolean })
                    }
                  />
                  <label htmlFor="license" className="text-sm font-medium cursor-pointer">
                    {actionType === 'approve'
                      ? 'Business license/registration is valid'
                      : 'Business license/registration is invalid or expired'
                    }
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="experience"
                    checked={checklist.experienceConfirmed}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, experienceConfirmed: checked as boolean })
                    }
                  />
                  <label htmlFor="experience" className="text-sm font-medium cursor-pointer">
                    {actionType === 'approve'
                      ? 'Professional experience is confirmed'
                      : 'Professional experience cannot be verified'
                    }
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="references"
                    checked={checklist.referencesChecked}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, referencesChecked: checked as boolean })
                    }
                  />
                  <label htmlFor="references" className="text-sm font-medium cursor-pointer">
                    {actionType === 'approve'
                      ? 'References have been checked and validated'
                      : 'References are insufficient or not verified'
                    }
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="compliance"
                    checked={checklist.complianceVerified}
                    onCheckedChange={(checked) =>
                      setChecklist({ ...checklist, complianceVerified: checked as boolean })
                    }
                  />
                  <label htmlFor="compliance" className="text-sm font-medium cursor-pointer">
                    {actionType === 'approve'
                      ? 'Compliance requirements are met'
                      : 'Compliance requirements are not met'
                    }
                  </label>
                </div>
              </div>
            </div>

            {/* Rejection Reason - only for reject */}
            {actionType === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="rejection-reason-vendor">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason-vendor"
                  placeholder="Enter the detailed reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
            )}

            {/* Handwritten Comments */}
            <div className="space-y-2">
              <Label htmlFor="handwritten-comments-vendor">
                {actionType === 'approve' ? 'Approval Notes & Comments' : 'Additional Feedback'}
              </Label>
              <Textarea
                id="handwritten-comments-vendor"
                placeholder="Type your handwritten comments or notes here..."
                value={handwrittenComments}
                onChange={(e) => setHandwrittenComments(e.target.value)}
                className="mt-1 min-h-[120px] font-handwriting"
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                {actionType === 'approve'
                  ? 'Add any additional observations, recommendations, or special notes'
                  : 'Add any additional feedback or suggestions for the vendor'
                }
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            {actionType === 'approve' ? (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={!approverName.trim() || actionLoading === 'approve'}
              >
                {actionLoading === 'approve' ? 'Approving...' : 'Approve Vendor'}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || !approverName.trim() || actionLoading === 'reject'}
              >
                {actionLoading === 'reject' ? 'Rejecting...' : 'Reject Vendor'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorApprovals;