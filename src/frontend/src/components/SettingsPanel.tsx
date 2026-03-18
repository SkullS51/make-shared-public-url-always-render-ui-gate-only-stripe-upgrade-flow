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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  CreditCard,
  Crown,
  ExternalLink,
  Globe,
  Key,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Settings,
  Shield,
  Trash2,
  User,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";
import { firebaseService } from "../lib/firebase";
import { geminiService } from "../lib/geminiService";
import AdminDashboard from "./AdminDashboard";
import ApiKeyModal from "./ApiKeyModal";
import CustomDomainPanel from "./CustomDomainPanel";
import ProAccessUpgrade from "./ProAccessUpgrade";
import UsageAnalyticsPanel from "./UsageAnalyticsPanel";

export default function SettingsPanel() {
  const {
    settings,
    updateSettings,
    clearHistory,
    history,
    geminiApiKey,
    isPro,
    subscriptionInfo,
  } = useApp();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const isFirebaseAvailable = firebaseService.isAvailable();
  const isGeminiConfigured = geminiService.isConfigured();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  // Reinitialize Gemini service when API key changes
  useEffect(() => {
    if (geminiApiKey) {
      geminiService.setApiKey(geminiApiKey);
    }
  }, [geminiApiKey]);

  const handleModeChange = (mode: "paranoid" | "balanced" | "vent") => {
    updateSettings({ mode });
    toast.success(`Analysis mode changed to ${mode}`);
  };

  const handleDebounceChange = (value: number[]) => {
    updateSettings({ debounceMs: value[0] });
  };

  const handleClearHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all analysis history? This action cannot be undone.",
      )
    ) {
      clearHistory();
      toast.success("Analysis history cleared");

      if ("vibrate" in navigator) {
        navigator.vibrate(100);
      }
    }
  };

  const handleLogin = async () => {
    try {
      await login();
      toast.success("Successfully logged in with Internet Identity");
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      } else {
        toast.error("Failed to log in. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    toast.success("Successfully logged out");
  };

  const getSubscriptionStatusLabel = () => {
    if (subscriptionInfo.status === "proMonthly") return "Pro Monthly";
    if (subscriptionInfo.status === "proAnnual") return "Pro Annual";
    return "Free";
  };

  return (
    <>
      <Card className="border-primary/30 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            <span className="font-mono uppercase tracking-wider">
              System Configuration
            </span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure analysis sensitivity, subscription, and system behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className={`grid w-full ${isAdmin ? "grid-cols-4" : "grid-cols-2"}`}
            >
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="subscription">
                <Crown className="mr-2 h-4 w-4" />
                Pro Access
              </TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger value="domain">
                    <Globe className="mr-2 h-4 w-4" />
                    Custom Domain
                  </TabsTrigger>
                  <TabsTrigger value="admin">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              {/* Authentication Status Banner */}
              <div className="space-y-2">
                <Label className="text-sm font-medium font-mono uppercase tracking-wider">
                  Authentication Status
                </Label>
                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/50 p-3">
                  <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                      <>
                        <User className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Logged In</p>
                          <p className="text-xs text-muted-foreground">
                            {identity.getPrincipal().toString().slice(0, 20)}...
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Not Logged In</p>
                          <p className="text-xs text-muted-foreground">
                            Sign in for Pro Access
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  {isAuthenticated ? (
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="border-primary/30"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  ) : (
                    <Button
                      onClick={handleLogin}
                      disabled={isLoggingIn}
                      variant="outline"
                      size="sm"
                      className="border-primary/30"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-4 w-4" />
                          Sign In
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Subscription Status Banner */}
              <div className="space-y-2">
                <Label className="text-sm font-medium font-mono uppercase tracking-wider">
                  Subscription Status
                </Label>
                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/50 p-3">
                  <div className="flex items-center gap-2">
                    {isPro ? (
                      <>
                        <Crown className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            {getSubscriptionStatusLabel()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            All premium features unlocked
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Free Tier</p>
                          <p className="text-xs text-muted-foreground">
                            Limited features
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={() => setActiveTab("subscription")}
                    variant="outline"
                    size="sm"
                    className="border-primary/30"
                  >
                    {isPro ? "Manage" : "Upgrade"}
                  </Button>
                </div>
              </div>

              {/* Enhanced Gemini API Key Section - Always Accessible */}
              <div className="space-y-3">
                <Label className="text-sm font-medium font-mono uppercase tracking-wider">
                  Gemini API Key
                </Label>

                {/* Connection Status Display */}
                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/50 p-3">
                  <div className="flex items-center gap-2">
                    {isGeminiConfigured ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            Connected
                            <Badge
                              variant="outline"
                              className="border-primary/30 bg-primary/10 text-primary text-xs"
                            >
                              ✅
                            </Badge>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isPro
                              ? "API key configured and ready"
                              : "Upgrade to Pro to use chat"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            Not Connected
                            <Badge
                              variant="outline"
                              className="border-muted/30 text-xs"
                            >
                              ❌
                            </Badge>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Configure your API key to enable chat
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={() => setShowApiKeyModal(true)}
                    variant="outline"
                    size="sm"
                    className="border-primary/30"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    {isGeminiConfigured ? "Update Key" : "Add Key"}
                  </Button>
                </div>

                {/* Info Alert */}
                <Alert className="border-primary/20 bg-primary/5">
                  <Lock className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    Your API key is stored locally in your browser and never
                    sent to our servers.
                    {!isPro && (
                      <span className="block mt-1 text-muted-foreground">
                        Note: Pro Access subscription required to use Gemini
                        chat features.
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              </div>

              {/* Analysis Mode */}
              <div className="space-y-3">
                <Label className="text-sm font-medium font-mono uppercase tracking-wider">
                  Analysis Mode
                </Label>
                <Select value={settings.mode} onValueChange={handleModeChange}>
                  <SelectTrigger className="border-primary/30 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paranoid">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">PARANOID</span>
                        <Badge variant="destructive" className="text-xs">
                          High Alert
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="balanced">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">BALANCED</span>
                        <Badge variant="outline" className="text-xs">
                          Recommended
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="vent">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">VENT</span>
                        <Badge variant="secondary" className="text-xs">
                          Relaxed
                        </Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {settings.mode === "paranoid" &&
                    "Maximum sensitivity - flags all potential risks"}
                  {settings.mode === "balanced" &&
                    "Balanced detection - recommended for most users"}
                  {settings.mode === "vent" &&
                    "Minimal alerts - for casual venting"}
                </p>
              </div>

              {/* Response Time */}
              <div className="space-y-3">
                <Label className="text-sm font-medium font-mono uppercase tracking-wider">
                  Response Time: {settings.debounceMs}ms
                </Label>
                <Slider
                  value={[settings.debounceMs]}
                  onValueChange={handleDebounceChange}
                  min={100}
                  max={2000}
                  step={100}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Delay before analysis triggers (lower = faster, higher = less
                  CPU usage)
                </p>
              </div>

              {/* Firebase Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium font-mono uppercase tracking-wider">
                  Cloud Sync Status
                </Label>
                <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-background/50 p-3">
                  {isFirebaseAvailable ? (
                    <>
                      <Wifi className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Online</p>
                        <p className="text-xs text-muted-foreground">
                          Cloud features available
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Offline</p>
                        <p className="text-xs text-muted-foreground">
                          Local storage only
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* History Management */}
              <div className="space-y-3">
                <Label className="text-sm font-medium font-mono uppercase tracking-wider">
                  Analysis History
                </Label>
                <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/50 p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {history.length} items stored
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {settings.persistHistory
                        ? "Persistence enabled"
                        : "Persistence disabled"}
                    </p>
                  </div>
                  <Button
                    onClick={handleClearHistory}
                    variant="outline"
                    size="sm"
                    disabled={history.length === 0}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="mt-6">
              <ProAccessUpgrade />
            </TabsContent>

            {isAdmin && (
              <>
                <TabsContent value="domain" className="mt-6">
                  <CustomDomainPanel />
                </TabsContent>

                <TabsContent value="admin" className="space-y-6 mt-6">
                  <AdminDashboard />
                  <UsageAnalyticsPanel />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <ApiKeyModal open={showApiKeyModal} onOpenChange={setShowApiKeyModal} />
    </>
  );
}
