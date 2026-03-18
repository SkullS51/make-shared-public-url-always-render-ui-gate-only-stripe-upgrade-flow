import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import type { BpmCategory } from "../components/HeartRateMonitor";
import { usePersistedState } from "../hooks/usePersistedState";
import { useGetCallerSubscription } from "../hooks/useQueries";
import type {
  AnalysisMode,
  AnalysisResult,
  AppSettings,
  DetectedTrigger,
  SubscriptionInfo,
  SubscriptionStatus,
} from "../lib/types";

// Re-export types for backward compatibility with existing imports
export type {
  AnalysisMode,
  DetectedTrigger,
  AnalysisResult,
  SubscriptionStatus,
  SubscriptionInfo,
  AppSettings,
};

const DEFAULT_SETTINGS: AppSettings = {
  mode: "balanced",
  debounceMs: 500,
  persistHistory: true,
  maxHistoryItems: 100,
};

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  status: "free",
  lastChecked: Date.now(),
};

export const FREE_TIER_DAILY_LIMIT = 10;

// Sanctuary mode type
export type SanctuaryMode = "PERIMETER_DEFENSE" | "INNER_FORGE";

// Threat scan state namespace
export interface ThreatScanState {
  analysisHistory: AnalysisResult[];
  detectedTriggers: DetectedTrigger[];
  threatActive: boolean;
}

// Anxiety tool state namespace
export interface AnxietyToolState {
  medicationLogs: Record<string, { seroquel: boolean; symbicort: boolean }>;
  consultantSessionData: Record<string, unknown>;
}

// BPM data from physiological monitor
export interface BpmData {
  bpm: number;
  category: BpmCategory;
}

interface AppContextType {
  // BPM / physiological state
  bpmData: BpmData | null;
  setBpmState: (bpm: number, category: BpmCategory) => void;
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  // History (legacy — maps to threatScanState.analysisHistory)
  history: AnalysisResult[];
  addToHistory: (result: AnalysisResult) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  exportHistory: () => void;
  // API Keys
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  // Stripe
  stripePublishableKey: string;
  setStripePublishableKey: (key: string) => void;
  // Subscription
  subscriptionInfo: SubscriptionInfo;
  updateSubscriptionInfo: (info: SubscriptionInfo) => void;
  subscriptionStatus: SubscriptionStatus;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  isPro: boolean;
  // Daily scans (local fallback)
  dailyScans: number;
  incrementDailyScans: () => void;
  resetDailyScans: () => void;
  // Daily scan count alias
  dailyScanCount: number;
  setDailyScanCount: (count: number) => void;
  // Sanctuary Mode
  sanctuaryMode: SanctuaryMode;
  setSanctuaryMode: (mode: SanctuaryMode) => void;
  // Threat Scan State (decoupled namespace)
  threatScanState: ThreatScanState;
  addThreatScanResult: (result: AnalysisResult) => void;
  setThreatActive: (active: boolean) => void;
  // Anxiety Tool State (decoupled namespace)
  anxietyToolState: AnxietyToolState;
  addAnxietyToolLog: (
    date: string,
    log: { seroquel: boolean; symbicort: boolean },
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_THREAT_SCAN_STATE: ThreatScanState = {
  analysisHistory: [],
  detectedTriggers: [],
  threatActive: false,
};

const DEFAULT_ANXIETY_TOOL_STATE: AnxietyToolState = {
  medicationLogs: {},
  consultantSessionData: {},
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [bpmData, setBpmData] = useState<BpmData | null>(null);

  const setBpmState = useCallback((bpm: number, category: BpmCategory) => {
    setBpmData({ bpm, category });
  }, []);

  const [settings, setSettings] = usePersistedState<AppSettings>(
    "zts-settings",
    DEFAULT_SETTINGS,
  );
  const [history, setHistory] = usePersistedState<AnalysisResult[]>(
    "zts-history",
    [],
  );
  const [geminiApiKey, setGeminiApiKey] = usePersistedState<string>(
    "zts-gemini-api-key",
    "",
  );
  const [stripePublishableKey, setStripePublishableKey] =
    usePersistedState<string>("zts-stripe-publishable-key", "");
  const [subscriptionInfo, setSubscriptionInfo] =
    usePersistedState<SubscriptionInfo>(
      "zts-subscription",
      DEFAULT_SUBSCRIPTION,
    );
  const [dailyScans, setDailyScans] = usePersistedState<number>(
    "zts-daily-scans",
    0,
  );
  const [lastScanDate, setLastScanDate] = usePersistedState<string>(
    "zts-last-scan-date",
    new Date().toDateString(),
  );
  const [dailyScanCount, setDailyScanCount] = useState(0);

  // Sanctuary Mode — persisted
  const [sanctuaryMode, setSanctuaryModeState] =
    usePersistedState<SanctuaryMode>(
      "gutpunch-sanctuary-mode",
      "PERIMETER_DEFENSE",
    );

  // Decoupled threat scan state
  const [threatScanState, setThreatScanState] =
    usePersistedState<ThreatScanState>(
      "threatScanState",
      DEFAULT_THREAT_SCAN_STATE,
    );

  // Decoupled anxiety tool state
  const [anxietyToolState, setAnxietyToolState] =
    usePersistedState<AnxietyToolState>(
      "anxietyToolState",
      DEFAULT_ANXIETY_TOOL_STATE,
    );

  // Sync subscription from backend
  const { data: backendSubscription } = useGetCallerSubscription();
  useEffect(() => {
    if (backendSubscription?.status) {
      const status = backendSubscription.status as string;
      if (
        status === "proMonthly" ||
        status === "proAnnual" ||
        status === "free"
      ) {
        setSubscriptionInfo((prev) => ({
          ...prev,
          status: status as SubscriptionStatus,
        }));
      }
    }
  }, [backendSubscription, setSubscriptionInfo]);

  const isPro =
    subscriptionInfo.status === "proMonthly" ||
    subscriptionInfo.status === "proAnnual";
  const subscriptionStatus: SubscriptionStatus = subscriptionInfo.status;

  const setSubscriptionStatus = useCallback(
    (status: SubscriptionStatus) => {
      setSubscriptionInfo((prev) => ({ ...prev, status }));
    },
    [setSubscriptionInfo],
  );

  const setSanctuaryMode = useCallback(
    (mode: SanctuaryMode) => {
      setSanctuaryModeState(mode);
    },
    [setSanctuaryModeState],
  );

  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        if (newSettings.persistHistory === false) {
          localStorage.removeItem("zts-history");
          setHistory([]);
        }
        return updated;
      });
    },
    [setSettings, setHistory],
  );

  const addToHistory = useCallback(
    (result: AnalysisResult) => {
      if (!settings.persistHistory) return;
      setHistory((prev) => {
        const isDuplicate = prev.some(
          (item) =>
            item.text === result.text &&
            item.score === result.score &&
            item.mode === result.mode,
        );
        if (isDuplicate) return prev;
        return [result, ...prev].slice(0, settings.maxHistoryItems);
      });
    },
    [settings.persistHistory, settings.maxHistoryItems, setHistory],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem("zts-history");
  }, [setHistory]);

  const deleteHistoryItem = useCallback(
    (id: string) => {
      setHistory((prev) => prev.filter((item) => item.id !== id));
    },
    [setHistory],
  );

  const exportHistory = useCallback(() => {
    try {
      const dataStr = JSON.stringify(history, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `foreverraw-history-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting history:", error);
    }
  }, [history]);

  const updateSubscriptionInfo = useCallback(
    (info: SubscriptionInfo) => {
      setSubscriptionInfo(info);
    },
    [setSubscriptionInfo],
  );

  // On mount, reset scans if the stored date is not today
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    const today = new Date().toDateString();
    if (lastScanDate !== today) {
      setDailyScans(0);
      setLastScanDate(today);
    }
  }, []);

  const incrementDailyScans = useCallback(() => {
    const today = new Date().toDateString();
    if (today !== lastScanDate) {
      setDailyScans(1);
      setLastScanDate(today);
    } else {
      setDailyScans((prev) => prev + 1);
    }
  }, [lastScanDate, setDailyScans, setLastScanDate]);

  const resetDailyScans = useCallback(() => {
    setDailyScans(0);
    setLastScanDate(new Date().toDateString());
  }, [setDailyScans, setLastScanDate]);

  // Threat scan namespace helpers
  const addThreatScanResult = useCallback(
    (result: AnalysisResult) => {
      setThreatScanState((prev) => ({
        ...prev,
        analysisHistory: [result, ...prev.analysisHistory].slice(0, 100),
      }));
    },
    [setThreatScanState],
  );

  const setThreatActive = useCallback(
    (active: boolean) => {
      setThreatScanState((prev) => ({ ...prev, threatActive: active }));
    },
    [setThreatScanState],
  );

  // Anxiety tool namespace helpers
  const addAnxietyToolLog = useCallback(
    (date: string, log: { seroquel: boolean; symbicort: boolean }) => {
      setAnxietyToolState((prev) => ({
        ...prev,
        medicationLogs: { ...prev.medicationLogs, [date]: log },
      }));
    },
    [setAnxietyToolState],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: setDailyScanCount is stable setter
  const contextValue = useMemo(
    () => ({
      bpmData,
      setBpmState,
      settings,
      updateSettings,
      history,
      addToHistory,
      clearHistory,
      deleteHistoryItem,
      exportHistory,
      geminiApiKey,
      setGeminiApiKey,
      stripePublishableKey,
      setStripePublishableKey,
      subscriptionInfo,
      updateSubscriptionInfo,
      subscriptionStatus,
      setSubscriptionStatus,
      isPro,
      dailyScans,
      incrementDailyScans,
      resetDailyScans,
      dailyScanCount,
      setDailyScanCount,
      sanctuaryMode,
      setSanctuaryMode,
      threatScanState,
      addThreatScanResult,
      setThreatActive,
      anxietyToolState,
      addAnxietyToolLog,
    }),
    [
      bpmData,
      setBpmState,
      settings,
      updateSettings,
      history,
      addToHistory,
      clearHistory,
      deleteHistoryItem,
      exportHistory,
      geminiApiKey,
      setGeminiApiKey,
      stripePublishableKey,
      setStripePublishableKey,
      subscriptionInfo,
      updateSubscriptionInfo,
      subscriptionStatus,
      setSubscriptionStatus,
      isPro,
      dailyScans,
      incrementDailyScans,
      resetDailyScans,
      dailyScanCount,
      setDailyScanCount,
      sanctuaryMode,
      setSanctuaryMode,
      threatScanState,
      addThreatScanResult,
      setThreatActive,
      anxietyToolState,
      addAnxietyToolLog,
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

// Alias for new code
export function useAppContext() {
  return useApp();
}
