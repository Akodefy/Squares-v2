import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const PrivacyPolicy = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/policies/privacy-policy`
      );

      if (response.ok) {
        const data = await response.json();
        setContent(data.data.content);
        setLastUpdated(new Date(data.data.lastUpdated));
      }
    } catch (error) {
      console.error("Error loading privacy policy:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div 
        className="prose prose-slate max-w-none space-y-6"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {lastUpdated && (
        <p className="text-sm text-muted-foreground mt-8">
          Last updated:{" "}
          {lastUpdated.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}
    </div>
  );
};

export default PrivacyPolicy;
