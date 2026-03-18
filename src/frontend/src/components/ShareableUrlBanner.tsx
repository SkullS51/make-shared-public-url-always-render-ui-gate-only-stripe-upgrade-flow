import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ShareableUrlBanner() {
  const [copied, setCopied] = useState(false);
  const appUrl = window.location.origin;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      toast.success("App URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-3 px-4 rounded-lg border border-primary/20 bg-background/50">
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium font-mono uppercase tracking-wider text-muted-foreground">
          Share This App
        </span>
      </div>
      <div className="flex items-center gap-2">
        <code className="text-xs font-mono bg-background/80 px-3 py-1.5 rounded border border-primary/10 text-foreground">
          {appUrl}
        </code>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="border-primary/30"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
