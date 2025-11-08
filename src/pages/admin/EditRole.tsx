import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, Shield, CheckCircle2, Info, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import roleService, { Role } from "@/services/roleService";
import { useAuth } from "@/contexts/AuthContext";

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSuperAdmin } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch role and permissions in parallel
        const [roleResponse, permissions] = await Promise.all([
          roleService.getRole(id),
          roleService.getPermissions() // Fetch from API instead of local
        ]);
        
        console.log('Fetched role:', roleResponse.data.role);
        console.log('Fetched permissions:', permissions);
        
        setRole(roleResponse.data.role);
        setAvailablePermissions(permissions);
      } catch (error) {
        console.error("Failed to fetch role:", error);
        toast({
          title: "Error",
          description: "Failed to load role data.",
          variant: "destructive",
        });
        navigate("/admin/roles");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role || !id) return;

    try {
      setSaving(true);
      await roleService.updateRole(id, {
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive,
        level: role.level
      });
      navigate("/admin/roles");
    } catch (error) {
      console.error("Failed to update role:", error);
      // Error is already handled by the service
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permission: string) => {
    if (!role) return;
    // Only allow editing if not a system role OR if user is superadmin
    if (role.isSystemRole && !isSuperAdmin) return;
    
    console.log('Toggling permission:', permission);
    console.log('Current permissions:', role.permissions);
    
    const newPermissions = role.permissions.includes(permission)
      ? role.permissions.filter((p) => p !== permission)
      : [...role.permissions, permission];
    
    console.log('New permissions:', newPermissions);
    setRole({ ...role, permissions: newPermissions });
  };

  const formatPermissionName = (permission: string) => {
    return permission.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const groupPermissionsByCategory = () => {
    const categories: Record<string, string[]> = {
      'Property Management': [],
      'User Management': [],
      'Vendor Management': [],
      'System Management': [],
      'Communication': [],
      'Support & Operations': [],
      'Analytics': []
    };

    availablePermissions.forEach(permission => {
      if (permission.includes('property') || permission.includes('review') || permission.includes('approve_properties') || permission.includes('reject_properties')) {
        categories['Property Management'].push(permission);
      } else if (permission.includes('user') || permission.includes('role')) {
        categories['User Management'].push(permission);
      } else if (permission.includes('vendor')) {
        categories['Vendor Management'].push(permission);
      } else if (permission.includes('plan') || permission.includes('dashboard') || permission.includes('settings') || permission.includes('content') && !permission.includes('moderate')) {
        categories['System Management'].push(permission);
      } else if (permission.includes('message') || permission.includes('moderate') || permission.includes('notification')) {
        categories['Communication'].push(permission);
      } else if (permission.includes('support') || permission.includes('promotion') || permission.includes('report')) {
        categories['Support & Operations'].push(permission);
      } else if (permission.includes('analytics')) {
        categories['Analytics'].push(permission);
      }
    });

    return Object.entries(categories).filter(([_, perms]) => perms.length > 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading role...</span>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/roles")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Not Found</h1>
            <p className="text-muted-foreground mt-2">The requested role could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative top-[60px] pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/roles")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
            {role.isSystemRole && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                System Role
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            Update role details and permissions
          </p>
        </div>
      </div>

      {role.isSystemRole && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a system role. Some fields are restricted to maintain system integrity. 
            You can only update the description.
          </AlertDescription>
        </Alert>
      )}

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
              Core details about this role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  Role Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={role.name}
                  onChange={(e) => setRole({ ...role, name: e.target.value })}
                  disabled={role.isSystemRole && !isSuperAdmin}
                  required
                  className={role.isSystemRole && !isSuperAdmin ? "bg-muted" : ""}
                />
                {role.isSystemRole && !isSuperAdmin && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    System roles cannot be renamed
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
                  value={role.level}
                  onChange={(e) => setRole({ ...role, level: parseInt(e.target.value) || 1 })}
                  disabled={role.isSystemRole && !isSuperAdmin}
                  required
                  className={role.isSystemRole && !isSuperAdmin ? "bg-muted" : ""}
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Level {role.level}/10 - {
                    role.level >= 8 ? 'High Authority' :
                    role.level >= 5 ? 'Medium Authority' :
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
                value={role.description}
                onChange={(e) => setRole({ ...role, description: e.target.value })}
                rows={4}
                required
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {role.description.length} characters
                </p>
                {role.description.length >= 10 && (
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
                  {role.isActive ? 'Users can be assigned to this role' : 'Role is currently disabled'}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={role.isActive}
                onCheckedChange={(checked) => setRole({ ...role, isActive: checked })}
                disabled={role.isSystemRole && role.isActive && !isSuperAdmin}
              />
            </div>
            {role.isSystemRole && role.isActive && !isSuperAdmin && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                System roles cannot be deactivated
              </p>
            )}
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
              Define what actions users with this role can perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {role.isSystemRole && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  System role permissions are managed by the system and cannot be modified
                </AlertDescription>
              </Alert>
            )}

            {groupPermissionsByCategory().map(([category, permissions]) => {
              const selectedInCategory = permissions.filter(p => role.permissions.includes(p)).length;
              const allSelected = selectedInCategory === permissions.length;

              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={allSelected ? "default" : "outline"}
                        className="text-sm px-3 py-1"
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

                  <div className="grid gap-3 md:grid-cols-2">
                    {permissions.map((permission) => {
                      const isSelected = role.permissions.includes(permission);
                      const isDisabled = role.isSystemRole && !isSuperAdmin;
                      return (
                        <div
                          key={permission}
                          className={`flex items-start space-x-3 p-3 border-2 rounded-lg transition-all ${
                            isDisabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                          } ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          <Checkbox
                            id={permission}
                            checked={isSelected}
                            onCheckedChange={() => !isDisabled && togglePermission(permission)}
                            disabled={isDisabled}
                            className="mt-1"
                          />
                          <div className="flex-1" onClick={() => !isDisabled && togglePermission(permission)}>
                            <Label
                              htmlFor={permission}
                              className={`font-medium text-sm ${
                                isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            >
                              {formatPermissionName(permission)}
                            </Label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {role.permissions.length === 0 && !role.isSystemRole && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This role has no permissions assigned. Users with this role won't be able to perform any actions.
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
              Review & Save
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Role Name</p>
                <p className="font-medium">{role.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <Badge variant={role.level >= 8 ? 'destructive' : role.level >= 5 ? 'default' : 'secondary'}>
                  Level {role.level}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Permissions</p>
                <p className="font-medium">{role.permissions.length} selected</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={role.isActive ? "default" : "secondary"}>
                  {role.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={saving}
                className="flex items-center gap-2"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/roles")}
                disabled={saving}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditRole;
