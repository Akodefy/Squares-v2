import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import roleService from "@/services/roleService";

interface Permission {
  id: string;
  label: string;
  description: string;
  category: string;
}

const PERMISSIONS: Permission[] = [
  // Property Management
  { id: 'create_property', label: 'Create Properties', description: 'Can create new property listings', category: 'Property Management' },
  { id: 'read_property', label: 'View Properties', description: 'Can view property listings', category: 'Property Management' },
  { id: 'update_property', label: 'Edit Properties', description: 'Can edit existing properties', category: 'Property Management' },
  { id: 'delete_property', label: 'Delete Properties', description: 'Can delete property listings', category: 'Property Management' },
  { id: 'review_properties', label: 'Review Properties', description: 'Can review property submissions', category: 'Property Management' },
  { id: 'approve_properties', label: 'Approve Properties', description: 'Can approve property listings', category: 'Property Management' },
  { id: 'reject_properties', label: 'Reject Properties', description: 'Can reject property listings', category: 'Property Management' },
  
  // User Management
  { id: 'manage_users', label: 'Manage Users', description: 'Can manage user accounts', category: 'User Management' },
  { id: 'manage_roles', label: 'Manage Roles', description: 'Can create and manage user roles', category: 'User Management' },
  
  // Vendor Management
  { id: 'approve_vendors', label: 'Approve Vendors', description: 'Can approve vendor applications', category: 'Vendor Management' },
  { id: 'reject_vendors', label: 'Reject Vendors', description: 'Can reject vendor applications', category: 'Vendor Management' },
  { id: 'review_vendors', label: 'Review Vendors', description: 'Can review vendor profiles', category: 'Vendor Management' },
  { id: 'track_vendor_performance', label: 'Track Vendor Performance', description: 'Can monitor vendor activities', category: 'Vendor Management' },
  
  // System Management
  { id: 'manage_plans', label: 'Manage Plans', description: 'Can manage subscription plans', category: 'System Management' },
  { id: 'view_dashboard', label: 'View Dashboard', description: 'Can access admin dashboard', category: 'System Management' },
  { id: 'manage_settings', label: 'Manage Settings', description: 'Can modify system settings', category: 'System Management' },
  { id: 'manage_content', label: 'Manage Content', description: 'Can manage site content', category: 'System Management' },
  
  // Communication
  { id: 'send_messages', label: 'Send Messages', description: 'Can send messages to users', category: 'Communication' },
  { id: 'moderate_content', label: 'Moderate Content', description: 'Can moderate user content', category: 'Communication' },
  { id: 'moderate_user_content', label: 'Moderate User Content', description: 'Can review and moderate user posts', category: 'Communication' },
  { id: 'send_notifications', label: 'Send Notifications', description: 'Can send system notifications', category: 'Communication' },
  
  // Support & Operations
  { id: 'handle_support_tickets', label: 'Handle Support Tickets', description: 'Can manage customer support tickets', category: 'Support & Operations' },
  { id: 'approve_promotions', label: 'Approve Promotions', description: 'Can approve promotional campaigns', category: 'Support & Operations' },
  { id: 'generate_reports', label: 'Generate Reports', description: 'Can create system reports', category: 'Support & Operations' },
  
  // Analytics
  { id: 'access_analytics', label: 'Access Analytics', description: 'Can view system analytics', category: 'Analytics' },
];

const AddRole = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    isActive: true,
    level: 1,
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSelectAllInCategory = (category: string) => {
    const categoryPermissions = PERMISSIONS
      .filter(p => p.category === category)
      .map(p => p.id);

    const allSelected = categoryPermissions.every(p => formData.permissions.includes(p));

    if (allSelected) {
      // Deselect all in category
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !categoryPermissions.includes(p))
      }));
    } else {
      // Select all in category
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.name.length < 3) {
      toast({
        title: "Validation Error",
        description: "Role name must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Role description is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.description.length < 10) {
      toast({
        title: "Validation Error",
        description: "Role description must be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }

    if (formData.permissions.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one permission must be selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await roleService.createRole(formData);
      toast({
        title: "Success",
        description: "Role created successfully!",
      });
      navigate('/admin/roles');
    } catch (error) {
      console.error('Failed to create role:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionsByCategory = () => {
    const categories = [...new Set(PERMISSIONS.map(p => p.category))];
    return categories.reduce((acc, category) => {
      acc[category] = PERMISSIONS.filter(p => p.category === category);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const permissionsByCategory = getPermissionsByCategory();

  return (
    <div className="space-y-6 relative top-[60px] pb-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/roles')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Add New Role</h1>
          <p className="text-muted-foreground mt-2">
            Create a new user role with specific permissions and access levels
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Roles define what users can do in the system. Higher level roles (closer to 10) have more authority. 
          Make sure to select only the necessary permissions for this role.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">1</span>
              </div>
              Basic Information
            </CardTitle>
            <CardDescription>
              Provide essential details about the role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  Role Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Property Manager, Content Moderator"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className={formData.name && formData.name.length < 3 ? "border-destructive" : ""}
                />
                {formData.name && formData.name.length < 3 && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Must be at least 3 characters
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="level" className="flex items-center gap-1">
                  Authorization Level <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="level"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 1)}
                  required
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Level {formData.level}/10 - {
                    formData.level >= 8 ? 'High Authority' :
                    formData.level >= 5 ? 'Medium Authority' :
                    'Low Authority'
                  }
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-1">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the responsibilities and purpose of this role..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                rows={4}
                className={formData.description && formData.description.length < 10 ? "border-destructive" : ""}
              />
              <div className="flex justify-between items-center">
                {formData.description && formData.description.length < 10 ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Must be at least 10 characters
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length} characters
                  </p>
                )}
                {formData.description.length >= 10 && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex-1">
                <Label htmlFor="isActive" className="text-base font-medium cursor-pointer">
                  Active Role
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Users can be assigned to this role immediately after creation
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">2</span>
              </div>
              Permissions
            </CardTitle>
            <CardDescription>
              Select what actions users with this role can perform. Click on category badges to select/deselect all permissions in that category.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(permissionsByCategory).map(([category, permissions]) => {
              const selectedInCategory = permissions.filter(p => formData.permissions.includes(p.id)).length;
              const allSelected = selectedInCategory === permissions.length;
              
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={allSelected ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80 transition-colors text-sm px-3 py-1"
                        onClick={() => handleSelectAllInCategory(category)}
                      >
                        {category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedInCategory} of {permissions.length} selected
                      </span>
                    </div>
                    {allSelected && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissions.map((permission) => {
                      const isSelected = formData.permissions.includes(permission.id);
                      return (
                        <div
                          key={permission.id}
                          className={`flex items-start space-x-3 p-3 border-2 rounded-lg transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          <Checkbox
                            id={permission.id}
                            checked={isSelected}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                            className="mt-1"
                          />
                          <div className="flex-1" onClick={() => handlePermissionToggle(permission.id)}>
                            <Label 
                              htmlFor={permission.id}
                              className="cursor-pointer font-medium text-sm"
                            >
                              {permission.label}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {formData.permissions.length === 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select at least one permission for this role
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Summary & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">3</span>
              </div>
              Review & Submit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Role Name</p>
                <p className="font-medium">{formData.name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <Badge variant={formData.level >= 8 ? 'destructive' : formData.level >= 5 ? 'default' : 'secondary'}>
                  Level {formData.level}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Permissions</p>
                <p className="font-medium">
                  {formData.permissions.length} selected
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/roles')}
                disabled={loading}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name || !formData.description || formData.permissions.length === 0}
                className="flex items-center gap-2"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Role...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Create Role
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AddRole;