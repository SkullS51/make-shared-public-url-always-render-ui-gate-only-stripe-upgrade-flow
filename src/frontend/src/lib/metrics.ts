/**
 * USP/PES Metrics Calculation Utility
 * Computes Unconditional Self-Pride (USP) and Primal Energy System (PES) scores
 * based on positive/negative keyword frequencies in message history
 */

export interface Message {
  id: string;
  text: string;
  timestamp: number;
  sender?: "user" | "system";
}

export interface MetricsResult {
  uspScore: number;
  pesLoad: number;
}

// Positive keywords that contribute to USP (Unconditional Self-Pride)
const POSITIVE_KEYWORDS = [
  "confident",
  "proud",
  "capable",
  "strong",
  "worthy",
  "valuable",
  "empowered",
  "resilient",
  "independent",
  "self-assured",
  "authentic",
  "grateful",
  "peaceful",
  "calm",
  "balanced",
  "centered",
  "grounded",
  "love",
  "joy",
  "happy",
  "content",
  "satisfied",
  "fulfilled",
  "growth",
  "progress",
  "success",
  "achievement",
  "accomplish",
  "trust",
  "believe",
  "faith",
  "hope",
  "optimistic",
  "positive",
  "healthy",
  "well",
  "good",
  "great",
  "excellent",
  "wonderful",
  "safe",
  "secure",
  "protected",
  "supported",
  "validated",
];

// Negative keywords that contribute to PES (Primal Energy System) load
const NEGATIVE_KEYWORDS = [
  "anxious",
  "worried",
  "stressed",
  "overwhelmed",
  "panic",
  "fear",
  "angry",
  "frustrated",
  "irritated",
  "annoyed",
  "rage",
  "furious",
  "sad",
  "depressed",
  "hopeless",
  "helpless",
  "worthless",
  "useless",
  "shame",
  "guilt",
  "embarrassed",
  "humiliated",
  "inadequate",
  "threat",
  "danger",
  "risk",
  "unsafe",
  "vulnerable",
  "exposed",
  "urgent",
  "emergency",
  "crisis",
  "critical",
  "desperate",
  "must",
  "have to",
  "need to",
  "required",
  "forced",
  "obligated",
  "failure",
  "mistake",
  "wrong",
  "bad",
  "terrible",
  "awful",
  "alone",
  "isolated",
  "abandoned",
  "rejected",
  "excluded",
  "confused",
  "lost",
  "uncertain",
  "doubt",
  "question",
];

/**
 * Calculate USP and PES metrics from chat history
 * @param chatHistory Array of messages to analyze
 * @returns Object containing uspScore (0-100) and pesLoad (0-100)
 */
export function calculateMetrics(chatHistory: Message[]): MetricsResult {
  if (!chatHistory || chatHistory.length === 0) {
    return { uspScore: 50, pesLoad: 0 };
  }

  // Combine all message text
  const combinedText = chatHistory
    .map((msg) => msg.text.toLowerCase())
    .join(" ");

  // Count positive keyword occurrences
  let positiveCount = 0;
  for (const keyword of POSITIVE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    const matches = combinedText.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  }

  // Count negative keyword occurrences
  let negativeCount = 0;
  for (const keyword of NEGATIVE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    const matches = combinedText.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  }

  // Calculate total words for normalization
  const wordCount = combinedText
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const normalizedPositive =
    wordCount > 0 ? (positiveCount / wordCount) * 100 : 0;
  const normalizedNegative =
    wordCount > 0 ? (negativeCount / wordCount) * 100 : 0;

  // USP Score: Higher positive keywords = higher score (0-100)
  // Base score of 50, adjusted by positive keyword density
  const uspScore = Math.min(100, Math.max(0, 50 + normalizedPositive * 10));

  // PES Load: Higher negative keywords = higher load (0-100)
  // Represents stress/threat response activation
  const pesLoad = Math.min(100, Math.max(0, normalizedNegative * 15));

  return {
    uspScore: Math.round(uspScore),
    pesLoad: Math.round(pesLoad),
  };
}

/**
 * Get descriptive label for USP score
 */
export function getUSPLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Moderate";
  if (score >= 35) return "Low";
  return "Critical";
}

/**
 * Get descriptive label for PES load
 */
export function getPESLabel(load: number): string {
  if (load >= 75) return "Critical";
  if (load >= 50) return "High";
  if (load >= 25) return "Moderate";
  if (load >= 10) return "Low";
  return "Minimal";
}
