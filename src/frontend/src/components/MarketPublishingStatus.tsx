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
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Loader2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useGetMarketConfig, usePublish } from "../hooks/useQueries";

export default function MarketPublishingStatus() {
  const { data: marketConfig, isLoading } = useGetMarketConfig();
  const publishMutation = usePublish();

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync();
      toast.success("App Published to Market! 🎉", {
        description: "Your app is now live on the Caffeine App Market",
      });
    } catch (error: any) {
      console.error("Failed to publish:", error);
      toast.error("Publishing Failed", {
        description: error.message || "Failed to publish app to market",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-background/80 to-background/50">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!marketConfig) {
    return null;
  }

  const isPublished = marketConfig.isPublished;
  const hasWallet = !!marketConfig.walletPrincipal;
  const priceUSD = Number(marketConfig.priceUSD);
  const totalRoyalties = Number(marketConfig.totalRoyaltiesEarned);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-background/80 to-background/50 shadow-lg shadow-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${isPublished ? "bg-primary/20" : "bg-yellow-500/20"}`}
            >
              {isPublished ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <div>
              <CardTitle className="font-mono uppercase tracking-wider text-foreground text-lg">
                Market Publishing Status
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                App marketplace listing and royalty tracking
              </CardDescription>
            </div>
          </div>
          {isPublished ? (
            <Badge className="bg-primary/20 text-primary border-primary/50 font-mono shadow-lg shadow-primary/20 animate-pulse">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Published ✅
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-yellow-500 border-yellow-500/50 font-mono"
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              Not Published
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Publishing Status */}
          <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              {isPublished ? (
                <CheckCircle2 className="h-3 w-3 text-primary" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-yellow-500" />
              )}
              <p className="text-xs font-medium text-foreground">Status</p>
            </div>
            <p className="text-sm font-mono text-muted-foreground">
              {isPublished ? "Published" : "Draft"}
            </p>
          </div>

          {/* Clone Price */}
          <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">Clone Price</p>
            </div>
            <p className="text-sm font-mono text-muted-foreground">
              {priceUSD === 0 ? "Free" : `$${priceUSD}`}
            </p>
          </div>

          {/* Wallet Status */}
          <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">Wallet</p>
            </div>
            <p className="text-sm font-mono text-muted-foreground">
              {hasWallet ? "Connected ✓" : "Not Set"}
            </p>
          </div>

          {/* Total Royalties */}
          <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">Royalties</p>
            </div>
            <p className="text-sm font-mono text-muted-foreground">
              ${totalRoyalties}
            </p>
          </div>
        </div>

        {/* Wallet Details */}
        {hasWallet && (
          <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-foreground">
                OISY Wallet Principal
              </p>
              <Badge variant="outline" className="text-xs font-mono">
                {marketConfig.payoutCurrency === "usdc"
                  ? "USDC"
                  : marketConfig.payoutCurrency === "btc"
                    ? "Bitcoin"
                    : "ICP"}
              </Badge>
            </div>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {marketConfig.walletPrincipal?.toString()}
            </p>
          </div>
        )}

        {/* Publish Button */}
        {!isPublished && (
          <Alert className="border-primary/20 bg-primary/5">
            <AlertDescription className="space-y-3">
              <p className="text-xs text-foreground">
                <strong className="text-primary">Ready to publish?</strong> Once
                published, your app will be available on the Caffeine App Market
                for others to clone and deploy.
              </p>
              <Button
                onClick={handlePublish}
                disabled={publishMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-mono"
              >
                {publishMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Publish to Market
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Published Success */}
        {isPublished && (
          <Alert className="border-primary/30 bg-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs">
              <strong className="text-primary">Your app is live!</strong> Users
              can now clone and deploy your app from the Caffeine App Market.{" "}
              {priceUSD > 0 && "You'll earn royalties when they go live."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
