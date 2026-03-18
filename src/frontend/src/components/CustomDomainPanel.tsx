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
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CustomDomainPanel() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get the current canister URL
  const currentUrl = window.location.host;
  const isCustomDomain =
    !currentUrl.includes(".ic0.app") && !currentUrl.includes(".localhost");

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (_error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Globe className="h-5 w-5 text-primary" />
            <span className="font-mono uppercase tracking-wider">
              Custom Domain Setup
            </span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure a custom domain to make your app accessible at your own
            URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="space-y-2">
            <p className="text-sm font-medium font-mono uppercase tracking-wider">
              Current Status
            </p>
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/50 p-3">
              <div className="flex items-center gap-2">
                {isCustomDomain ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        Custom Domain Active
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {currentUrl}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Using Default Canister URL
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {currentUrl}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <Badge
                variant={isCustomDomain ? "default" : "outline"}
                className="font-mono"
              >
                {isCustomDomain ? "ACTIVE" : "DEFAULT"}
              </Badge>
            </div>
          </div>

          {/* Canister URL for CNAME */}
          <div className="space-y-2">
            <p className="text-sm font-medium font-mono uppercase tracking-wider">
              Your Canister URL
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-primary/20 bg-background/50 p-3">
                <p className="text-sm font-mono break-all">{currentUrl}</p>
              </div>
              <Button
                onClick={() => handleCopy(currentUrl, "canister")}
                variant="outline"
                size="sm"
                className="border-primary/30"
              >
                {copiedField === "canister" ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this URL as the target for your CNAME record
            </p>
          </div>

          {/* DNS Configuration Instructions */}
          <div className="space-y-4">
            <p className="text-sm font-medium font-mono uppercase tracking-wider">
              DNS Configuration Steps
            </p>

            <div className="space-y-3">
              <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 font-mono">
                    1
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">
                      Access Your DNS Provider
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Log in to your domain registrar or DNS hosting provider
                      (e.g., Cloudflare, GoDaddy, Namecheap, Route53)
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 font-mono">
                    2
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">Add CNAME Record</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Create a new CNAME record with these values:
                    </p>
                    <div className="space-y-2 text-xs font-mono bg-background/80 rounded p-3 border border-primary/10">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="text-foreground">CNAME</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="text-foreground">@ or www</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-muted-foreground">Target:</span>
                        <span className="text-foreground break-all">
                          {currentUrl}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 font-mono">
                    3
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">
                      Configure www Subdomain (Optional)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Add another CNAME record for the www subdomain pointing to
                      the same target, or set up a redirect from www to your
                      apex domain
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 font-mono">
                    4
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">
                      Wait for DNS Propagation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      DNS changes can take 5 minutes to 48 hours to propagate
                      globally. Most changes are visible within 1-2 hours.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-background/50 p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 font-mono">
                    5
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium">Verify Configuration</p>
                    <p className="text-xs text-muted-foreground">
                      Once DNS propagates, visit your custom domain in a
                      browser. The app should load normally and the URL bar will
                      show your custom domain.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <Alert className="border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm space-y-2">
              <p className="font-medium">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                <li>
                  SSL/TLS certificates are automatically provided by the
                  Internet Computer
                </li>
                <li>
                  DNS configuration happens at your domain registrar - not in
                  this app
                </li>
                <li>
                  Some providers may use different terminology (Alias, ANAME)
                  instead of CNAME
                </li>
                <li>
                  If using Cloudflare, disable the orange cloud (proxy)
                  initially for testing
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Help Resources */}
          <div className="space-y-2">
            <p className="text-sm font-medium font-mono uppercase tracking-wider">
              Need Help?
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-primary/30 justify-start"
                asChild
              >
                <a
                  href="https://internetcomputer.org/docs/current/developer-docs/web-apps/custom-domains/using-custom-domains"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Internet Computer Custom Domain Docs
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
