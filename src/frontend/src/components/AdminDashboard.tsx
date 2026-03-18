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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@dfinity/principal";
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Key,
  Loader2,
  Lock,
  RefreshCw,
  Shield,
  Store,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { StripeConfiguration } from "../backend";
import { useApp } from "../contexts/AppContext";
import {
  useGetMarketConfig,
  useIsStripeConfigured,
  useSetStripeConfiguration,
  useUpdateMarketConfig,
} from "../hooks/useQueries";
import { validatePrincipalId } from "../lib/validation";
import MarketPublishingStatus from "./MarketPublishingStatus";

// Local types for market config (not exported from backend interface)
type MarketCategory =
  | "productivity"
  | "finance"
  | "education"
  | "health"
  | "entertainment"
  | "utility"
  | "business"
  | "other";
type PayoutCurrency = "usdc" | "btc" | "icp";

interface MarketConfig {
  priceUSD: bigint;
  description: string;
  category: MarketCategory;
  walletPrincipal?: Principal;
  payoutCurrency: PayoutCurrency;
  isPublished: boolean;
  totalRoyaltiesEarned: bigint;
}

export default function AdminDashboard() {
  const { setStripePublishableKey } = useApp();

  // Stripe state
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [allowedCountries, setAllowedCountries] = useState("US,CA,GB");
  const [validationErrors, setValidationErrors] = useState<{
    publishable?: string;
    secret?: string;
    countries?: string;
    walletPrincipal?: string;
  }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Market config state
  const [priceUSD, setPriceUSD] = useState("0");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MarketCategory>("other");
  const [walletPrincipal, setWalletPrincipal] = useState("");
  const [payoutCurrency, setPayoutCurrency] = useState<PayoutCurrency>("usdc");

  const setStripeConfig = useSetStripeConfiguration();
  const {
    data: configStatus,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useIsStripeConfigured();
  const { data: marketConfig, isLoading: marketConfigLoading } =
    useGetMarketConfig();
  const updateMarketConfig = useUpdateMarketConfig();

  const isConfigured = configStatus === true;

  useEffect(() => {
    if (marketConfig) {
      const mc = marketConfig as unknown as MarketConfig;
      setPriceUSD(mc.priceUSD?.toString() ?? "0");
      setDescription(mc.description ?? "");
      setCategory((mc.category as MarketCategory) ?? "other");
      setWalletPrincipal(mc.walletPrincipal?.toString() ?? "");
      setPayoutCurrency((mc.payoutCurrency as PayoutCurrency) ?? "usdc");
    }
  }, [marketConfig]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const validatePublishableKey = (key: string): boolean => {
    if (!key.trim()) {
      setValidationErrors((prev) => ({
        ...prev,
        publishable: "Publishable key is required",
      }));
      return false;
    }
    if (!key.startsWith("pk_")) {
      setValidationErrors((prev) => ({
        ...prev,
        publishable: "Publishable key must start with pk_test_ or pk_live_",
      }));
      return false;
    }
    setValidationErrors((prev) => ({ ...prev, publishable: undefined }));
    return true;
  };

  const validateSecretKey = (key: string): boolean => {
    if (!key.trim()) {
      setValidationErrors((prev) => ({
        ...prev,
        secret: "Secret key is required",
      }));
      return false;
    }
    if (!key.startsWith("sk_")) {
      setValidationErrors((prev) => ({
        ...prev,
        secret: "Secret key must start with sk_test_ or sk_live_",
      }));
      return false;
    }
    setValidationErrors((prev) => ({ ...prev, secret: undefined }));
    return true;
  };

  const validateCountries = (countries: string): boolean => {
    const countryList = countries
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (countryList.length === 0) {
      setValidationErrors((prev) => ({
        ...prev,
        countries: "At least one country is required",
      }));
      return false;
    }
    const invalidCountries = countryList.filter((c) => !/^[A-Z]{2}$/.test(c));
    if (invalidCountries.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        countries: `Invalid country codes: ${invalidCountries.join(", ")}. Use 2-letter ISO codes.`,
      }));
      return false;
    }
    setValidationErrors((prev) => ({ ...prev, countries: undefined }));
    return true;
  };

  const handleSaveStripe = async () => {
    setLastError(null);
    const isPubValid = validatePublishableKey(publishableKey);
    const isSecValid = validateSecretKey(secretKey);
    const isCountriesValid = validateCountries(allowedCountries);

    if (!isPubValid || !isSecValid || !isCountriesValid) return;

    const countryList = allowedCountries
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const config: StripeConfiguration = {
      secretKey: secretKey.trim(),
      allowedCountries: countryList,
    };

    try {
      await setStripeConfig.mutateAsync(config);
      setStripePublishableKey(publishableKey.trim());
      setShowSuccess(true);
      setSecretKey("");
      toast.success("Stripe configuration saved successfully");
      await refetchStatus();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save Stripe configuration";
      setLastError(message);
      toast.error("Failed to save configuration", { description: message });
    }
  };

  const handleSaveMarketConfig = async () => {
    if (walletPrincipal && !validatePrincipalId(walletPrincipal)) {
      setValidationErrors((prev) => ({
        ...prev,
        walletPrincipal: "Invalid principal ID format",
      }));
      return;
    }
    setValidationErrors((prev) => ({ ...prev, walletPrincipal: undefined }));

    const config: MarketConfig = {
      priceUSD: BigInt(Number.parseInt(priceUSD) || 0),
      description,
      category,
      walletPrincipal: walletPrincipal
        ? Principal.fromText(walletPrincipal)
        : undefined,
      payoutCurrency,
      isPublished:
        (marketConfig as unknown as MarketConfig)?.isPublished ?? false,
      totalRoyaltiesEarned:
        (marketConfig as unknown as MarketConfig)?.totalRoyaltiesEarned ??
        BigInt(0),
    };

    try {
      await updateMarketConfig.mutateAsync(config as unknown as any);
      toast.success("Market configuration saved");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save market configuration";
      toast.error("Failed to save market config", { description: message });
    }
  };

  return (
    <div className="min-h-screen bg-void text-stone-200 p-6 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-cinzel text-3xl font-bold text-blood-red tracking-widest uppercase mb-2">
            Admin Dashboard
          </h1>
          <p className="text-stone-500 font-mono text-sm">
            Configure payment systems and market settings
          </p>
        </div>

        <Tabs defaultValue="stripe">
          <TabsList className="bg-stone-900/60 border border-stone-700/20 mb-6">
            <TabsTrigger value="stripe" className="font-cinzel tracking-wider">
              <Key className="mr-2 h-4 w-4" />
              Stripe
            </TabsTrigger>
            <TabsTrigger value="market" className="font-cinzel tracking-wider">
              <Store className="mr-2 h-4 w-4" />
              Market
            </TabsTrigger>
          </TabsList>

          {/* Stripe Tab */}
          <TabsContent value="stripe" className="space-y-6">
            <Card className="border-stone-700/20 bg-stone-900/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-cinzel text-blood-red tracking-widest uppercase flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Stripe Configuration
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {statusLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-stone-500" />
                    ) : isConfigured ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Configured
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-ember-orange border-ember-orange/30"
                      >
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Not Configured
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => refetchStatus()}
                      className="h-8 w-8 text-stone-500 hover:text-blood-red"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-stone-500">
                  Configure Stripe payment processing for Pro subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {showSuccess && (
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-400">
                      Stripe configuration saved successfully!
                    </AlertDescription>
                  </Alert>
                )}
                {lastError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{lastError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label className="font-cinzel text-stone-500 text-xs tracking-widest uppercase">
                    Publishable Key
                  </Label>
                  <Input
                    value={publishableKey}
                    onChange={(e) => setPublishableKey(e.target.value)}
                    placeholder="pk_test_..."
                    className="bg-void/60 border-stone-700/20 text-stone-200 font-mono text-sm"
                  />
                  {validationErrors.publishable && (
                    <p className="text-blood-red text-xs">
                      {validationErrors.publishable}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-cinzel text-stone-500 text-xs tracking-widest uppercase">
                    Secret Key
                  </Label>
                  <Input
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="sk_test_..."
                    className="bg-void/60 border-stone-700/20 text-stone-200 font-mono text-sm"
                  />
                  {validationErrors.secret && (
                    <p className="text-blood-red text-xs">
                      {validationErrors.secret}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-cinzel text-stone-500 text-xs tracking-widest uppercase">
                    Allowed Countries (comma-separated ISO codes)
                  </Label>
                  <Input
                    value={allowedCountries}
                    onChange={(e) => setAllowedCountries(e.target.value)}
                    placeholder="US,CA,GB"
                    className="bg-void/60 border-stone-700/20 text-stone-200 font-mono text-sm"
                  />
                  {validationErrors.countries && (
                    <p className="text-blood-red text-xs">
                      {validationErrors.countries}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSaveStripe}
                  disabled={setStripeConfig.isPending}
                  className="w-full bg-blood-red hover:bg-blood-red/80 text-white font-cinzel tracking-widest uppercase"
                >
                  {setStripeConfig.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Save Stripe Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Tab */}
          <TabsContent value="market" className="space-y-6">
            <MarketPublishingStatus />

            <Card className="border-stone-700/20 bg-stone-900/40">
              <CardHeader>
                <CardTitle className="font-cinzel text-blood-red tracking-widest uppercase flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Market Settings
                </CardTitle>
                <CardDescription className="text-stone-500">
                  Configure your app's marketplace listing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {marketConfigLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blood-red" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="font-cinzel text-stone-500 text-xs tracking-widest uppercase">
                        Price (USD)
                      </Label>
                      <Input
                        type="number"
                        value={priceUSD}
                        onChange={(e) => setPriceUSD(e.target.value)}
                        min="0"
                        className="bg-void/60 border-stone-700/20 text-stone-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-cinzel text-stone-500 text-xs tracking-widest uppercase">
                        Description
                      </Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your app..."
                        className="bg-void/60 border-stone-700/20 text-stone-200 min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-cinzel text-stone-500 text-xs tracking-widest uppercase">
                        Category
                      </Label>
                      <Select
                        value={category}
                        onValueChange={(v) => setCategory(v as MarketCategory)}
                      >
                        <SelectTrigger className="bg-void/60 border-stone-700/20 text-stone-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-900 border-stone-700">
                          {(
                            [
                              "productivity",
                              "finance",
                              "education",
                              "health",
                              "entertainment",
                              "utility",
                              "business",
                              "other",
                            ] as MarketCategory[]
                          ).map((cat) => (
                            <SelectItem
                              key={cat}
                              value={cat}
                              className="text-stone-200 capitalize"
                            >
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-cinzel text-stone-500 text-xs tracking-widest uppercase">
                        Wallet Principal (optional)
                      </Label>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-stone-500 flex-shrink-0" />
                        <Input
                          value={walletPrincipal}
                          onChange={(e) => setWalletPrincipal(e.target.value)}
                          placeholder="aaaaa-aa"
                          className="bg-void/60 border-stone-700/20 text-stone-200 font-mono text-sm"
                        />
                      </div>
                      {validationErrors.walletPrincipal && (
                        <p className="text-blood-red text-xs">
                          {validationErrors.walletPrincipal}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="font-cinzel text-stone-500 text-xs tracking-widest uppercase">
                        Payout Currency
                      </Label>
                      <RadioGroup
                        value={payoutCurrency}
                        onValueChange={(v) =>
                          setPayoutCurrency(v as PayoutCurrency)
                        }
                        className="flex gap-4"
                      >
                        {(["usdc", "btc", "icp"] as PayoutCurrency[]).map(
                          (currency) => (
                            <div
                              key={currency}
                              className="flex items-center gap-2"
                            >
                              <RadioGroupItem
                                value={currency}
                                id={`currency-${currency}`}
                              />
                              <Label
                                htmlFor={`currency-${currency}`}
                                className="text-stone-300 uppercase font-mono text-xs cursor-pointer"
                              >
                                {currency.toUpperCase()}
                              </Label>
                            </div>
                          ),
                        )}
                      </RadioGroup>
                    </div>

                    <Button
                      onClick={handleSaveMarketConfig}
                      disabled={updateMarketConfig.isPending}
                      className="w-full bg-ember-orange/80 hover:bg-ember-orange text-white font-cinzel tracking-widest uppercase"
                    >
                      {updateMarketConfig.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <DollarSign className="h-4 w-4 mr-2" />
                      )}
                      Save Market Configuration
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
