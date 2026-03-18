import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertOctagon, AlertTriangle, Info, Shield } from "lucide-react";

interface RiskMeterProps {
  score: number;
  isAnalyzing?: boolean;
}

export default function RiskMeter({ score, isAnalyzing }: RiskMeterProps) {
  const getRiskLevel = (score: number) => {
    if (score === 0)
      return { level: "None", color: "text-muted-foreground", icon: Info };
    if (score < 25)
      return { level: "Low", color: "text-chart-2", icon: Shield };
    if (score < 50)
      return { level: "Medium", color: "text-chart-5", icon: AlertTriangle };
    if (score < 75)
      return { level: "High", color: "text-chart-1", icon: AlertTriangle };
    return { level: "Critical", color: "text-destructive", icon: AlertOctagon };
  };

  const risk = getRiskLevel(score);
  const Icon = risk.icon;

  const getProgressColorClass = (score: number) => {
    if (score === 0) return "[&>div]:bg-muted";
    if (score < 25) return "[&>div]:bg-chart-2";
    if (score < 50) return "[&>div]:bg-chart-5";
    if (score < 75) return "[&>div]:bg-chart-1";
    return "[&>div]:bg-destructive";
  };

  return (
    <Card
      className={cn(
        "border-primary/30 bg-card/50 transition-all",
        score > 50 && "border-destructive/50",
      )}
      aria-label="Risk assessment meter"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Icon className={cn("h-5 w-5", risk.color)} aria-hidden="true" />
          Risk Assessment
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isAnalyzing
            ? "Analyzing message..."
            : "Real-time analysis of suspicious patterns and potential threats"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium font-mono uppercase tracking-wider">
              Risk Level
            </span>
            <output
              className={cn("text-2xl font-bold font-mono", risk.color)}
              aria-live="polite"
              aria-label={`Risk level: ${risk.level}`}
            >
              {risk.level}
            </output>
          </div>
          <Progress
            value={score}
            className={cn("h-3", getProgressColorClass(score))}
            aria-label={`Risk score: ${score} out of 100`}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>0 (Safe)</span>
            <span aria-label={`Current score: ${score}`}>{score}/100</span>
            <span>100 (Critical)</span>
          </div>
        </div>

        {score > 0 && (
          <div
            className={cn(
              "rounded-lg border p-3 animate-in fade-in-50 duration-300",
              score > 50
                ? "border-destructive/50 bg-destructive/5"
                : "border-chart-5/50 bg-chart-5/5",
            )}
            role="alert"
            aria-live="assertive"
          >
            <p className="text-sm">
              {score >= 75 && (
                <span className="font-semibold text-destructive">
                  ⚠️ Critical Risk: This message shows multiple red flags
                  commonly associated with scams. Do not respond or take any
                  action without independent verification.
                </span>
              )}
              {score >= 50 && score < 75 && (
                <span className="font-semibold text-chart-1">
                  ⚠️ High Risk: This message contains several suspicious
                  patterns. Exercise extreme caution and verify through official
                  channels.
                </span>
              )}
              {score >= 25 && score < 50 && (
                <span className="font-semibold text-chart-5">
                  ⚠️ Medium Risk: Some concerning patterns detected. Verify the
                  sender's identity and claims independently.
                </span>
              )}
              {score > 0 && score < 25 && (
                <span className="font-semibold text-chart-2">
                  ℹ️ Low Risk: Minor concerns detected. Always verify unexpected
                  messages through official channels.
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
