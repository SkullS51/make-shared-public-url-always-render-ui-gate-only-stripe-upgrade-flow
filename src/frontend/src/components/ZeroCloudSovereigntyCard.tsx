import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Lock, Search, Shield } from "lucide-react";

export default function ZeroCloudSovereigntyCard() {
  return (
    <Card className="border-primary/30 bg-card/50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary uppercase tracking-wider font-mono flex items-center gap-3">
          <Shield className="h-7 w-7" />
          Zero-Cloud Sovereignty
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-foreground leading-relaxed">
          Unlike traditional platforms that "manage" your data through
          third-party silos and regulatory middle-men,
          <span className="text-primary font-semibold"> GUT-PUNCH</span>{" "}
          operates on a{" "}
          <span className="text-primary font-semibold">
            Zero-Trust Security Model
          </span>
          .
        </p>

        <div className="space-y-4">
          {/* Local Scrubbing */}
          <div className="flex gap-4 p-4 rounded-lg border border-primary/20 bg-background/50">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
                <Lock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-primary uppercase tracking-wider font-mono">
                Local Scrubbing
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All PII (Personally Identifiable Information) is detected and
                scrubbed at the device level before any "Handshake" occurs.
              </p>
            </div>
          </div>

          {/* Resolution over Regulation */}
          <div className="flex gap-4 p-4 rounded-lg border border-primary/20 bg-background/50">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
                <Search className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-primary uppercase tracking-wider font-mono">
                Resolution over Regulation
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By classifying this as a{" "}
                <span className="text-primary font-semibold">
                  Security Search Engine
                </span>
                , we provide a "Secure Enclave" for emotional resolution without
                the vulnerabilities of cloud-based medical tracking.
              </p>
            </div>
          </div>

          {/* The Sentinel Guard */}
          <div className="flex gap-4 p-4 rounded-lg border border-primary/20 bg-background/50">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
                <Eye className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-primary uppercase tracking-wider font-mono">
                The Sentinel Guard
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our integrated Sentinel layer identifies "fake ass bullshit" and
                social engineering in real-time, ensuring your internal
                "Mandate" stays private and protected.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
