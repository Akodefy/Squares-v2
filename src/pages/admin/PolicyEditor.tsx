import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, ArrowLeft, FileText, Loader2 } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface PolicyData {
  type: "privacy-policy" | "refund-policy";
  content: string;
  lastUpdated: string;
  updatedBy?: string;
}

const PolicyEditor = () => {
  const { policyType } = useParams<{ policyType: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalContent, setOriginalContent] = useState("");

  const policyTitle = useMemo(() => {
    if (policyType === "privacy-policy") return "Privacy Policy";
    if (policyType === "refund-policy") return "Refund & Cancellation Policy";
    return "Policy";
  }, [policyType]);

  useEffect(() => {
    loadPolicy();
  }, [policyType]);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/policies/admin/${policyType}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const policyContent = data.data.content || getDefaultContent();
        setContent(policyContent);
        setOriginalContent(policyContent);
      } else {
        const defaultContent = getDefaultContent();
        setContent(defaultContent);
        setOriginalContent(defaultContent);
      }
    } catch (error) {
      console.error("Error loading policy:", error);
      const defaultContent = getDefaultContent();
      setContent(defaultContent);
      setOriginalContent(defaultContent);
      toast({
        title: "Info",
        description: "Loaded default policy content",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = () => {
    if (policyType === "privacy-policy") {
      return `
        <h2>1. Information We Collect</h2>
        <p>We collect information that you provide directly to us, including when you create an account, list a property, contact us, or use our services.</p>
        
        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services.</p>
        
        <h2>3. Information Sharing</h2>
        <p>We do not share your personal information with third parties except as described in this policy.</p>
        
        <h2>4. Data Security</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal information.</p>
        
        <h2>5. Your Rights</h2>
        <p>You have the right to access, update, or delete your personal information at any time.</p>
      `;
    } else {
      return `
        <h2>1. Subscription Refund Policy</h2>
        <p>We offer a 7-day money-back guarantee on all subscription plans.</p>
        
        <h2>2. Cancellation Process</h2>
        <p>You may cancel your subscription at any time through your account settings.</p>
        
        <h2>3. Refund Eligibility</h2>
        <p>Refunds are available under specific conditions outlined in this section.</p>
        
        <h2>4. Non-Refundable Items</h2>
        <p>Certain items and services are not eligible for refunds.</p>
        
        <h2>5. Refund Processing Time</h2>
        <p>Approved refunds will be processed within 5-7 business days.</p>
      `;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/policies/admin/${policyType}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        setOriginalContent(content);
        toast({
          title: "Success",
          description: `${policyTitle} updated successfully. Email notifications sent to all users.`,
        });
      } else {
        throw new Error("Failed to save policy");
      }
    } catch (error) {
      console.error("Error saving policy:", error);
      toast({
        title: "Error",
        description: "Failed to save policy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
  ];

  const hasChanges = content !== originalContent;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span className="text-lg">Loading policy...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="w-8 h-8 text-primary" />
              {policyTitle}
            </h1>
            <p className="text-muted-foreground mt-1">
              Edit and manage your {policyTitle.toLowerCase()}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policy Content</CardTitle>
          <CardDescription>
            Use the rich text editor below to edit the policy content. Changes will be reflected on the public-facing pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              className="min-h-[500px]"
            />
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-card border rounded-lg shadow-lg p-4 flex items-center gap-4">
          <p className="text-sm text-muted-foreground">You have unsaved changes</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadPolicy}>
              Discard
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyEditor;
