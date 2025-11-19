import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Heart, TrendingUp } from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "@/hooks/use-toast";

interface PropertyEngagement {
  _id: string;
  title: string;
  favoriteCount: number;
  propertyType: string;
  listingType: string;
  address: {
    city?: string;
    locality?: string;
  };
}

const EngagementDetails = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFavorites: 0,
    totalProperties: 0,
    engagementRate: 0,
    avgFavoritesPerProperty: 0
  });

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const fetchEngagementData = async () => {
    try {
      const token = authService.getToken();
      const favoritesRes = await fetch(`${import.meta.env.VITE_API_URL}/favorites/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!favoritesRes.ok) throw new Error('Failed to fetch favorites data');

      const favoritesData = await favoritesRes.json();
      
      if (favoritesData.success && favoritesData.data) {
        const { properties: propertiesWithFavorites, totalFavorites, totalProperties } = favoritesData.data;

        setProperties(propertiesWithFavorites);

        const totalProps = propertiesWithFavorites.length;
        const engagementRate = totalProps > 0 ? (totalFavorites / totalProps) * 100 : 0;

        setStats({
          totalFavorites,
          totalProperties: totalProps,
          engagementRate: Math.round(engagementRate * 10) / 10,
          avgFavoritesPerProperty: totalProps > 0 ? Math.round((totalFavorites / totalProps) * 10) / 10 : 0
        });
      }
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      toast({
        title: "Error",
        description: "Failed to load engagement data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/v2/admin/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Engagement Details</h1>
          <p className="text-muted-foreground">Property engagement metrics and favorite statistics</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalProperties}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Favorites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{stats.totalFavorites}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.engagementRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Favorites/Property</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgFavoritesPerProperty}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Engaged Properties */}
      <Card>
        <CardHeader>
          <CardTitle>Properties by Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {properties.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No properties found</p>
            ) : (
              properties.slice(0, 50).map((property, index) => (
                <div key={property._id} className="border rounded-lg p-4 hover:bg-accent/50 transition">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="font-medium">{property.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.address.locality}, {property.address.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="text-sm font-medium">{property.propertyType}</p>
                      <p className="text-xs text-muted-foreground">{property.listingType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-600 fill-pink-600" />
                      <div>
                        <p className="text-2xl font-bold text-pink-600">{property.favoriteCount}</p>
                        <p className="text-xs text-muted-foreground">favorites</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngagementDetails;
