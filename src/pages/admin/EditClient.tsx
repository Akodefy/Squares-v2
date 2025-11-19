import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import subscriptionService, { Subscription } from "@/services/subscriptionService";

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await subscriptionService.getSubscription(id);
        setSubscription(response.data.subscription);
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
        toast({
          title: "Error",
          description: "Failed to load client data.",
          variant: "destructive",
        });
        navigate("/v2/admin/clients");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [id, navigate, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Client updated",
      description: "The client details have been updated successfully.",
    });
    navigate("/clients");
  };

  if (!subscription) {
    return (
        <div>Client not found</div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Client</h1>
            <p className="text-muted-foreground mt-2">Update client subscription details</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    value={subscription.user?.name || ''}
                    onChange={(e) => setSubscription({ 
                      ...subscription, 
                      user: { ...subscription.user!, name: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={subscription.user?.email || ''}
                    onChange={(e) => setSubscription({ 
                      ...subscription, 
                      user: { ...subscription.user!, email: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planName">Plan</Label>
                  <Input
                    id="planName"
                    value={subscription.plan?.name || ''}
                    onChange={(e) => setSubscription({ 
                      ...subscription, 
                      plan: { ...subscription.plan!, name: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={subscription.amount}
                    onChange={(e) => setSubscription({ ...subscription, amount: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscriptionDate">Subscription Date</Label>
                  <Input
                    id="subscriptionDate"
                    type="date"
                    value={subscription.startDate?.split('T')[0] || ''}
                    onChange={(e) => setSubscription({ ...subscription, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={subscription.endDate?.split('T')[0] || ''}
                    onChange={(e) => setSubscription({ ...subscription, endDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={subscription.status} 
                    onValueChange={(value: "active" | "expired" | "cancelled") => setSubscription({ ...subscription, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => navigate("/clients")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
  );
};

export default EditClient;
