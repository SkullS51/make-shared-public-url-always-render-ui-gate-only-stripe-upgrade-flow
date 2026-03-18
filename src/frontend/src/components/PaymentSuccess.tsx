import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";

export default function PaymentSuccess() {
  const { updateSubscriptionInfo, subscriptionInfo } = useApp();
  const [verifying, setVerifying] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        updateSubscriptionInfo({
          status: "proMonthly",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          lastChecked: Date.now(),
        });

        setVerifying(false);
        toast.success("Payment successful! Pro Access activated.");
      } catch (error) {
        console.error("Error verifying payment:", error);
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [updateSubscriptionInfo]);

  const handleContinue = () => {
    navigate({ to: "/" });
  };

  if (verifying) {
    return (
      <div className="container flex min-h-screen items-center justify-center py-12">
        <Card className="w-full max-w-md border-primary/30 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">
              Verifying your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPro =
    subscriptionInfo.status === "proMonthly" ||
    subscriptionInfo.status === "proAnnual";

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md border-primary/30 bg-card/50">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {isPro ? (
                <CheckCircle className="h-10 w-10 text-primary" />
              ) : (
                <AlertCircle className="h-10 w-10 text-destructive" />
              )}
            </div>
          </div>
          <CardTitle className="text-center font-bold uppercase tracking-wider font-cinzel">
            {isPro ? "Payment Successful!" : "Payment Processing"}
          </CardTitle>
          <CardDescription className="text-center">
            {isPro
              ? "Your Pro Access has been activated"
              : "Your payment is being processed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPro ? (
            <Alert className="border-primary/30 bg-primary/5">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                Welcome to ForeverRaw Pro! You now have access to:
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Unlimited scans</li>
                  <li>• Dragon Consultant</li>
                  <li>• Full resolution tools</li>
                  <li>• Priority Dragon Guard</li>
                </ul>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your payment is being processed. This may take a few moments.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleContinue}
            className="w-full bg-blood-red hover:bg-blood-red-light text-white font-cinzel tracking-widest"
          >
            Continue to App
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            You can manage your subscription anytime from Profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
