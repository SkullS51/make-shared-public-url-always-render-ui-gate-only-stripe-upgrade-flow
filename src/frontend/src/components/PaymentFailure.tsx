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
import { ArrowLeft, RefreshCw, XCircle } from "lucide-react";

export default function PaymentFailure() {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate({ to: "/upgrade" });
  };

  const handleGoBack = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="relative min-h-screen bg-void flex items-center justify-center py-12 px-4">
      {/* Dragon background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(/assets/generated/dragon-scale-texture.dim_512x512.png)",
            backgroundSize: "256px 256px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="border-blood-red/30 bg-stone-900/90">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-blood-red/10 border border-blood-red/30">
                <XCircle className="h-10 w-10 text-blood-red" />
              </div>
            </div>
            <CardTitle className="text-center font-cinzel font-bold uppercase tracking-wider text-stone-200">
              Payment Cancelled
            </CardTitle>
            <CardDescription className="text-center font-mono text-stone-500">
              Your payment was not completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert
              variant="destructive"
              className="border-blood-red/40 bg-blood-red/10"
            >
              <XCircle className="h-4 w-4" />
              <AlertDescription className="font-mono text-sm text-stone-300">
                Your payment was cancelled or failed to process. No charges were
                made to your account.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button
                onClick={handleRetry}
                className="w-full bg-blood-red hover:bg-blood-red/80 text-stone-100 font-cinzel tracking-wider"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={handleGoBack}
                className="w-full font-cinzel tracking-wider"
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to App
              </Button>
            </div>

            <p className="text-center text-xs text-stone-600 font-mono">
              If you're experiencing issues with payment, please contact
              support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
