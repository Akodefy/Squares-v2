import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Store, 
  Mail,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

const VendorForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState(10);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStep("otp");
        if (data.expiryMinutes) {
          setExpiryMinutes(data.expiryMinutes);
        }
        toast({
          title: "OTP Sent!",
          description: "Check your email for the password reset code.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Request OTP error:", error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      toast({
        title: "All Fields Required",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setStep("success");
        toast({
          title: "Password Reset!",
          description: "Your password has been successfully reset.",
        });
      } else {
        toast({
          title: "Reset Failed",
          description: data.message || "Invalid OTP or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Store className="w-4 h-4 mr-2" />
              Vendor Portal
            </Badge>
            <h1 className="text-3xl font-bold mb-2">
              {step === "email" && "Forgot Password"}
              {step === "otp" && "Reset Your Password"}
              {step === "success" && "Password Reset Successful"}
            </h1>
            <p className="text-muted-foreground">
              {step === "email" && "Enter your email to receive a reset code"}
              {step === "otp" && "Enter the OTP sent to your email"}
              {step === "success" && "You can now login with your new password"}
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              {step === "email" && (
                <form onSubmit={handleRequestOTP} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="vendor@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Code"}
                  </Button>

                  <div className="text-center">
                    <Link 
                      to="/vendor/login" 
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Code sent to {email} • Expires in {expiryMinutes} minutes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="text-sm text-primary hover:underline"
                    >
                      Didn't receive code? Try again
                    </button>
                  </div>
                </form>
              )}

              {step === "success" && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">All Set!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your password has been successfully reset.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/vendor/login")} className="w-full">
                    Go to Vendor Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Don't have a vendor account?{" "}
              <Link to="/vendor/register" className="text-primary hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorForgotPassword;