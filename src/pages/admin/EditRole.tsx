import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import roleService, { Role } from "@/services/roleService";

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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
          roleService.getAvailablePermissions()
        ]);
        
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
    const newPermissions = role.permissions.includes(permission)
      ? role.permissions.filter((p) => p !== permission)
      : [...role.permissions, permission];
    setRole({ ...role, permissions: newPermissions });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 relative top-[60px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading role...</span>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="space-y-6 relative top-[60px]">
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

      <div className="space-y-6 relative top-[60px]">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/roles")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
            <p className="text-muted-foreground mt-2">Update role details and permissions</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={role.name}
                    onChange={(e) => setRole({ ...role, name: e.target.value })}
                    disabled={role.isSystemRole}
                    required
                  />
                  {role.isSystemRole && (
                    <p className="text-sm text-muted-foreground">System roles cannot be renamed</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level (1-10)</Label>
                  <Input
                    id="level"
                    type="number"
                    min={1}
                    max={10}
                    value={role.level}
                    onChange={(e) => setRole({ ...role, level: parseInt(e.target.value) })}
                    disabled={role.isSystemRole}
                    required
                  />
                  {role.isSystemRole && (
                    <p className="text-sm text-muted-foreground">System role levels cannot be changed</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={role.description}
                  onChange={(e) => setRole({ ...role, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={role.isActive}
                  onCheckedChange={(checked) => setRole({ ...role, isActive: checked })}
                  disabled={role.isSystemRole && role.isActive}
                />
                <Label htmlFor="isActive">Active Role</Label>
                {role.isSystemRole && role.isActive && (
                  <p className="text-sm text-muted-foreground ml-2">System roles cannot be deactivated</p>
                )}
              </div>

              <div className="space-y-4">
                <Label>Permissions</Label>
                {role.isSystemRole && (
                  <p className="text-sm text-muted-foreground">System role permissions cannot be modified</p>
                )}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2 p-2 border rounded-lg">
                      <Checkbox
                        id={permission}
                        checked={role.permissions.includes(permission)}
                        onCheckedChange={() => togglePermission(permission)}
                        disabled={role.isSystemRole}
                      />
                      <label
                        htmlFor={permission}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {permission.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/admin/roles")}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

  );
};

export default EditRole;
