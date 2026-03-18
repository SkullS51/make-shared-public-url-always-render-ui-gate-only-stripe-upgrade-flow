// Shared application types used across components and lib modules

export type AnalysisMode = "paranoid" | "balanced" | "vent";

export interface DetectedTrigger {
  type: "financial" | "urgency" | "coercion" | "suspicious";
  pattern: string;
  severity: "low" | "medium" | "high" | "critical";
  context: string;
  educationalInfo: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  text: string;
  score: number;
  triggers: DetectedTrigger[];
  mode: AnalysisMode;
}

export type SubscriptionStatus = "free" | "proMonthly" | "proAnnual";

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  expiresAt?: number;
  lastChecked: number;
}

export interface AppSettings {
  mode: AnalysisMode;
  debounceMs: number;
  persistHistory: boolean;
  maxHistoryItems: number;
}
