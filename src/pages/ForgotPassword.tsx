import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState(10);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer for resend OTP cooldown (2 minutes = 120 seconds)
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
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

      if (response.ok && data.success) {
        setStep("otp");
        if (data.expiryMinutes) {
          setExpiryMinutes(data.expiryMinutes);
        }
        // Start resend timer (120 seconds = 2 minutes)
        setResendTimer(120);
        setCanResend(false);
        toast({
          title: "OTP Sent!",
          description: "Check your email for the password reset code.",
        });
      } else if (response.status === 429) {
        // Rate limit error
        toast({
          title: "Too Many Requests",
          description: data.message || "Please wait before requesting another OTP",
          variant: "destructive",
        });
      } else {
        // Even if user doesn't exist, we show success for security
        // But if there's an actual error, show it
        if (data.message && !data.message.includes("exists")) {
          toast({
            title: "Error",
            description: data.message,
            variant: "destructive",
          });
        } else {
          // Security: Don't reveal if email exists or not
          setStep("otp");
          toast({
            title: "Check Your Email",
            description: "If an account exists with this email, you will receive a password reset code.",
          });
        }
      }
    } catch (error) {
      console.error("Request OTP error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the server. Please try again.",
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

    // Validate OTP format (6 digits)
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP",
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

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*]/.test(newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
      toast({
        title: "Weak Password",
        description: "Password must contain uppercase, lowercase, number, and special character (!@#$%^&*)",
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

      if (response.ok && data.success) {
        setStep("success");
        toast({
          title: "Password Reset!",
          description: "Your password has been successfully reset.",
        });
        
        // Clear form data for security
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        // Handle specific error cases
        if (data.error === 'OTP_EXPIRED') {
          toast({
            title: "OTP Expired",
            description: "Your OTP has expired. Please request a new one.",
            variant: "destructive",
          });
          setStep("email");
        } else if (data.error === 'INVALID_OTP') {
          toast({
            title: "Invalid OTP",
            description: data.attemptsLeft 
              ? `Invalid OTP. ${data.attemptsLeft} attempts remaining.`
              : "Invalid OTP. Please try again.",
            variant: "destructive",
          });
        } else if (data.error === 'MAX_ATTEMPTS_EXCEEDED') {
          toast({
            title: "Too Many Attempts",
            description: "Maximum attempts exceeded. Please request a new OTP.",
            variant: "destructive",
          });
          setStep("email");
        } else {
          toast({
            title: "Reset Failed",
            description: data.message || "Invalid OTP or password",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Restart resend timer
        setResendTimer(120);
        setCanResend(false);
        toast({
          title: "OTP Resent!",
          description: "A new OTP has been sent to your email.",
        });
      } else if (response.status === 429) {
        const remainingSeconds = data.remainingSeconds || 120;
        setResendTimer(remainingSeconds);
        setCanResend(false);
        toast({
          title: "Please Wait",
          description: `You can request a new OTP in ${remainingSeconds} seconds`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to resend OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to resend OTP. Please try again.",
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
                        placeholder="you@example.com"
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
                      to="/login"
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
                  <div className="space-y-4">
                    <div className="text-center">
                      <Label className="text-base">Verification Code</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter the 6-digit code sent to {email}
                      </p>
                    </div>
                    
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      Code expires in {expiryMinutes} minutes
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
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters with uppercase, lowercase, and numbers
                    </p>
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

                  <div className="text-center space-y-2">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-sm text-primary hover:underline"
                        disabled={isLoading}
                      >
                        Didn't receive code? Resend OTP
                      </button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Resend OTP in {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setStep("email");
                        setOtp("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="block w-full text-sm text-muted-foreground hover:text-primary"
                    >
                      Use a different email
                    </button>
                  </div>
                </form>
              )}

              {step === "success" && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Password Reset Successful!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your password has been successfully changed. You can now sign in with your new password.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button onClick={() => navigate("/login")} className="w-full">
                      Go to Login
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      A confirmation email has been sent to {email}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
