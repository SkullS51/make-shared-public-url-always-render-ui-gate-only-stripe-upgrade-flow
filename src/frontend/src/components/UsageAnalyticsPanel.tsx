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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  AlertCircle,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useGetUsageStats } from "../hooks/useQueries";

export default function UsageAnalyticsPanel() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetUsageStats();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Usage statistics refreshed");
    } catch (_error) {
      toast.error("Failed to refresh statistics");
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    // Convert nanoseconds to milliseconds
    const ms = Number(timestamp / 1_000_000n);
    const date = new Date(ms);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card className="border-primary/30 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-mono uppercase tracking-wider">
              Usage Analytics
            </span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Loading usage statistics...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-primary/30 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-mono uppercase tracking-wider">
              Usage Analytics
            </span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Application usage tracking and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load usage statistics. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const hasNoData =
    !stats ||
    (stats.totalAppOpenCount === 0n && stats.recentAppOpenEvents.length === 0);

  return (
    <Card className="border-primary/30 bg-card/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-mono uppercase tracking-wider">
                Usage Analytics
              </span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Application usage tracking and statistics
            </CardDescription>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isFetching}
            variant="outline"
            size="sm"
            className="border-primary/30"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasNoData ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No usage data recorded yet. Statistics will appear as users
              interact with the application.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-mono uppercase tracking-wider">
                    Total Opens
                  </span>
                </div>
                <div className="text-3xl font-bold text-primary font-mono">
                  {stats.totalAppOpenCount.toString()}
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-mono uppercase tracking-wider">
                    Unique Users
                  </span>
                </div>
                <div className="text-3xl font-bold text-primary font-mono">
                  {stats.uniqueUserEstimate.toString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Authenticated users only
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium font-mono uppercase tracking-wider">
                  Recent Activity
                </h3>
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 text-primary"
                >
                  Last {Math.min(stats.recentAppOpenEvents.length, 500)} events
                </Badge>
              </div>

              {stats.recentAppOpenEvents.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No recent activity recorded.
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-[300px] rounded-lg border border-primary/20 bg-background/50">
                  <div className="p-4 space-y-2">
                    {stats.recentAppOpenEvents
                      .slice()
                      .reverse()
                      .map((timestamp, index) => (
                        <div
                          key={`event-${index}-${String(timestamp)}`}
                          className="flex items-center justify-between py-2 px-3 rounded border border-primary/10 bg-background/30 hover:bg-background/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm font-mono">
                              App opened
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatTimestamp(timestamp)}
                          </span>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
