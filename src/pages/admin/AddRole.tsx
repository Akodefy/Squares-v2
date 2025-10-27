import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import roleService from "@/services/roleService";

interface Permission {
  id: string;
  label: string;
  description: string;
  category: string;
}

const PERMISSIONS: Permission[] = [
  // Property Management
  { id: 'create_property', label: 'Create Properties', description: 'Can create new property listings', category: 'Property' },
  { id: 'read_property', label: 'View Properties', description: 'Can view property listings', category: 'Property' },
  { id: 'update_property', label: 'Edit Properties', description: 'Can edit existing properties', category: 'Property' },
  { id: 'delete_property', label: 'Delete Properties', description: 'Can delete property listings', category: 'Property' },
  
  // User Management
  { id: 'manage_users', label: 'Manage Users', description: 'Can manage user accounts', category: 'User Management' },
  { id: 'manage_roles', label: 'Manage Roles', description: 'Can create and manage user roles', category: 'User Management' },
  
  // System Management
  { id: 'manage_plans', label: 'Manage Plans', description: 'Can manage subscription plans', category: 'System' },
  { id: 'view_dashboard', label: 'View Dashboard', description: 'Can access admin dashboard', category: 'System' },
  { id: 'manage_settings', label: 'Manage Settings', description: 'Can modify system settings', category: 'System' },
  { id: 'manage_content', label: 'Manage Content', description: 'Can manage site content', category: 'System' },
  
  // Communication
  { id: 'send_messages', label: 'Send Messages', description: 'Can send messages to users', category: 'Communication' },
  { id: 'moderate_content', label: 'Moderate Content', description: 'Can moderate user content', category: 'Communication' },
  
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
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Role description is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.permissions.length === 0) {
      toast({
        title: "Error",
        description: "At least one permission must be selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await roleService.createRole(formData);
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
    <div className="space-y-6 relative top-[60px]">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/roles')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Roles
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Role</h1>
          <p className="text-muted-foreground mt-2">
            Create a new user role with specific permissions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Property Manager"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level (1-10) *</Label>
                <Input
                  id="level"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', parseInt(e.target.value))}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Higher levels have more authority (1 = lowest, 10 = highest)
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this role is responsible for..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Active Role</Label>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select the permissions this role should have. You can select all permissions in a category by clicking the category badge.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(permissionsByCategory).map(([category, permissions]) => {
              const selectedInCategory = permissions.filter(p => formData.permissions.includes(p.id)).length;
              const allSelected = selectedInCategory === permissions.length;
              
              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={allSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleSelectAllInCategory(category)}
                    >
                      {category} ({selectedInCategory}/{permissions.length})
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <Checkbox
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
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
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {formData.permissions.length} permission{formData.permissions.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/roles')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Create Role
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AddRole;