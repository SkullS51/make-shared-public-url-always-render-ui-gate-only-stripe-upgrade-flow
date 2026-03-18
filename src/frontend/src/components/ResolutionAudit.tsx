import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Message, getPESLabel, getUSPLabel } from "@/lib/metrics";
import { cn } from "@/lib/utils";
import { Activity, Bot, Clock, Lock, TrendingUp, User } from "lucide-react";

interface ResolutionAuditProps {
  messages: Message[];
  uspScore: number;
  pesLoad: number;
  isPro?: boolean;
}

export default function ResolutionAudit({
  messages,
  uspScore,
  pesLoad,
  isPro = false,
}: ResolutionAuditProps) {
  const uspLabel = getUSPLabel(uspScore);
  const pesLabel = getPESLabel(pesLoad);

  const displayUSP = isPro ? uspScore : Math.round(uspScore / 10) * 10;
  const displayPES = isPro ? pesLoad : Math.round(pesLoad / 10) * 10;

  const getUSPColor = (score: number) => {
    if (score >= 80) return "text-chart-2";
    if (score >= 65) return "text-chart-3";
    if (score >= 50) return "text-chart-5";
    if (score >= 35) return "text-chart-1";
    return "text-destructive";
  };

  const getPESColor = (load: number) => {
    if (load >= 75) return "text-destructive";
    if (load >= 50) return "text-chart-1";
    if (load >= 25) return "text-chart-5";
    return "text-chart-2";
  };

  return (
    <div className="space-y-6">
      {!isPro && (
        <Alert className="border-primary/30 bg-primary/5">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Upgrade to Pro Access for full resolution metrics and detailed audit
            history.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-primary/30 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-mono uppercase tracking-wider">
            <Activity className="h-5 w-5 text-primary" />
            Current Metrics Summary
            {!isPro && <Lock className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          <CardDescription>
            {isPro
              ? "Real-time emotional and psychological indicators"
              : "Basic metrics overview"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium font-mono uppercase">
                    USP
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cn("font-mono", getUSPColor(displayUSP))}
                >
                  {isPro ? uspLabel : "Basic"}
                </Badge>
              </div>
              <div
                className={cn(
                  "text-3xl font-bold font-mono",
                  getUSPColor(displayUSP),
                )}
              >
                {displayUSP}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unconditional Self-Pride
              </p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium font-mono uppercase">
                    PES Load
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cn("font-mono", getPESColor(displayPES))}
                >
                  {isPro ? pesLabel : "Basic"}
                </Badge>
              </div>
              <div
                className={cn(
                  "text-3xl font-bold font-mono",
                  getPESColor(displayPES),
                )}
              >
                {displayPES}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Primal Energy System
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-mono uppercase tracking-wider">
            <Clock className="h-5 w-5 text-primary" />
            Message History
          </CardTitle>
          <CardDescription>
            Chronological record of chat interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-lg border border-primary/20 bg-background/50 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No messages yet. Start a conversation to see audit history.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-lg border border-primary/20 bg-card/50 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {message.sender === "user" ? (
                          <User className="h-4 w-4 text-primary" />
                        ) : (
                          <Bot className="h-4 w-4 text-chart-3" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {message.sender === "user" ? "User" : "System"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
