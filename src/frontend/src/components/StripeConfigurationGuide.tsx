import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface StripeConfigurationGuideProps {
  onComplete?: () => void;
  currentStep?: number;
}

const GUIDE_STEPS = [
  {
    step: 1,
    title: "Get Your Stripe API Keys",
    description: "Visit the Stripe Dashboard to retrieve your API keys",
    action: "Open Stripe Dashboard",
    url: "https://dashboard.stripe.com/apikeys",
    details: [
      "Sign in to your Stripe account",
      "Navigate to Developers → API keys",
      "Copy both your Publishable key (pk_test_...) and Secret key (sk_test_...)",
      "Use test keys for testing, live keys only for production",
    ],
  },
  {
    step: 2,
    title: "Configure Stripe in Admin Dashboard",
    description:
      "Enter your API keys in the Admin Dashboard configuration panel",
    details: [
      "Navigate to Settings → Admin tab",
      "Paste your Publishable key in the first field",
      "Paste your Secret key in the second field",
      "Configure allowed countries (e.g., US, CA, GB)",
      'Click "Save and Activate Stripe"',
    ],
  },
  {
    step: 3,
    title: "Test Your Configuration",
    description: "Verify that payment processing is working correctly",
    details: [
      "Return to the Pro Access tab",
      'Click "Upgrade Now" on a subscription plan',
      "Complete a test checkout using Stripe test card: 4242 4242 4242 4242",
      "Verify successful payment and Pro Access activation",
    ],
  },
];

export default function StripeConfigurationGuide({
  onComplete,
  currentStep = 1,
}: StripeConfigurationGuideProps) {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const progress = (completedSteps.length / GUIDE_STEPS.length) * 100;

  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep]);

  const handleStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    if (step < GUIDE_STEPS.length) {
      setActiveStep(step + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const isStepCompleted = (step: number) => completedSteps.includes(step);
  const isStepActive = (step: number) => activeStep === step;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background/50">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="font-mono uppercase tracking-wider text-foreground">
              Stripe Configuration Guide
            </CardTitle>
            <Badge variant="outline" className="border-primary/30 font-mono">
              Step {activeStep} of {GUIDE_STEPS.length}
            </Badge>
          </div>
          <CardDescription>
            Follow these steps to enable payment processing for Pro Access
            subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Configuration Progress
              </span>
              <span className="font-medium text-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert className="border-yellow-500/30 bg-yellow-500/5">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-sm">
          <strong className="text-yellow-500">Important:</strong> Use test keys
          (pk_test_ and sk_test_) during development. Only use live keys
          (pk_live_ and sk_live_) in production. Both keys must be from the same
          environment.
        </AlertDescription>
      </Alert>

      {/* Step Cards */}
      <div className="space-y-4">
        {GUIDE_STEPS.map((guideStep) => {
          const completed = isStepCompleted(guideStep.step);
          const active = isStepActive(guideStep.step);

          return (
            <Card
              key={guideStep.step}
              className={cn(
                "border-primary/30 transition-all",
                active &&
                  "border-primary shadow-lg shadow-primary/20 bg-primary/5",
                completed && "border-primary/50 bg-primary/5 opacity-75",
              )}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold transition-all",
                      completed && "bg-primary text-primary-foreground",
                      active &&
                        !completed &&
                        "bg-primary/20 text-primary ring-2 ring-primary/50",
                      !active && !completed && "bg-muted text-muted-foreground",
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      guideStep.step
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-mono uppercase tracking-wider">
                      {guideStep.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {guideStep.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Step Details */}
                <div className="ml-14 space-y-2">
                  <ul className="space-y-2">
                    {guideStep.details.map((detail, index) => (
                      <li
                        key={`${detail.slice(0, 20)}-${index}`}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary mt-0.5">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                {active && !completed && (
                  <div className="ml-14 flex items-center gap-3">
                    {guideStep.url && (
                      <Button
                        onClick={() => window.open(guideStep.url, "_blank")}
                        variant="outline"
                        size="sm"
                        className="border-primary/30"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {guideStep.action}
                      </Button>
                    )}
                    <Button
                      onClick={() => handleStepComplete(guideStep.step)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      {guideStep.step === GUIDE_STEPS.length ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Complete Setup
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {completed && (
                  <div className="ml-14">
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-primary"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Section */}
      <Card className="border-primary/30 bg-background/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Need Help?</p>
              <p className="text-xs text-muted-foreground">
                If you encounter any issues during configuration, check the
                Stripe documentation or contact support. Make sure both keys are
                from the same Stripe account and environment (test or live).
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://stripe.com/docs/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Stripe API Keys Documentation
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href="https://stripe.com/docs/testing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Test Card Numbers
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
