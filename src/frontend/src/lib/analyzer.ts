import type { AnalysisMode, DetectedTrigger } from "./types";

// Maximum text length for analysis (safety limit)
const MAX_TEXT_LENGTH = 50000;

// Homoglyph mapping for common substitutions
const HOMOGLYPH_MAP: Record<string, string> = {
  а: "a",
  е: "e",
  о: "o",
  р: "p",
  с: "c",
  у: "y",
  х: "x",
  А: "A",
  В: "B",
  Е: "E",
  К: "K",
  М: "M",
  Н: "H",
  О: "O",
  Р: "P",
  С: "C",
  Т: "T",
  Х: "X",
  "０": "0",
  "１": "1",
  "２": "2",
  "３": "3",
  "４": "4",
  "５": "5",
  "６": "6",
  "７": "7",
  "８": "8",
  "９": "9",
  ⅰ: "i",
  ⅱ: "ii",
  ⅲ: "iii",
  ⅳ: "iv",
  ⅴ: "v",
};

const FINANCIAL_PATTERNS = [
  {
    regex:
      /\b(send|wire|transfer|pay)\s+(me\s+)?(money|\$|usd|bitcoin|btc|crypto|funds)/gi,
    severity: "critical" as const,
    context: "Direct money request detected",
    education:
      "Legitimate organizations rarely ask for direct money transfers via text. Be extremely cautious of unsolicited payment requests.",
  },
  {
    regex:
      /\b(investment|profit|returns?|roi)\s+(guaranteed|assured|risk[- ]?free|100%)/gi,
    severity: "critical" as const,
    context: "Guaranteed investment scheme",
    education:
      "No legitimate investment is risk-free or guarantees returns. This is a classic hallmark of investment scams.",
  },
  {
    regex:
      /\b(bank|account|credit\s+card|password|pin|ssn|social\s+security)\s+(number|details|info|verification)/gi,
    severity: "critical" as const,
    context: "Request for sensitive financial information",
    education:
      "Banks and legitimate services never ask for passwords, PINs, or full account details via text or email.",
  },
  {
    regex:
      /\b(won|winner|prize|lottery|jackpot|claim|reward)\b.*\b(million|thousand|\$|usd)/gi,
    severity: "high" as const,
    context: "Prize or lottery scam pattern",
    education:
      "Legitimate lotteries don't notify winners via unsolicited messages. You can't win a contest you didn't enter.",
  },
  {
    regex:
      /\b(fee|tax|charge|payment)\s+(required|needed|must\s+pay)\s+(before|to\s+(claim|receive|unlock))/gi,
    severity: "high" as const,
    context: "Advance fee scam pattern",
    education:
      "Legitimate prizes or inheritances never require upfront payment. This is a classic advance-fee scam.",
  },
  {
    regex: /\b(paypal|venmo|cashapp|zelle|western\s+union|moneygram)\b/gi,
    severity: "medium" as const,
    context: "Payment service mentioned",
    education:
      "While these services are legitimate, scammers often request payments through them because transactions are hard to reverse.",
  },
];

const URGENCY_PATTERNS = [
  {
    regex:
      /\b(urgent|emergency|immediately|asap|right\s+now|hurry|quick|fast|expire[sd]?|deadline)/gi,
    severity: "high" as const,
    context: "Urgency pressure tactics",
    education:
      "Scammers create artificial urgency to prevent you from thinking critically. Legitimate businesses give you time to decide.",
  },
  {
    regex:
      /\b(limited\s+time|act\s+now|today\s+only|expires?\s+(today|tonight|soon)|last\s+chance|final\s+(notice|warning))/gi,
    severity: "high" as const,
    context: "Time-limited offer pressure",
    education:
      "High-pressure time limits are designed to rush your decision. Take time to verify any urgent claims independently.",
  },
  {
    regex: /\b(within|in\s+the\s+next)\s+(\d+\s+)?(hour|minute|day)s?/gi,
    severity: "medium" as const,
    context: "Specific time pressure",
    education:
      "Artificial deadlines are a manipulation tactic. Legitimate opportunities don't disappear in hours.",
  },
  {
    regex:
      /\b(suspended|locked|blocked|frozen|terminated|cancelled)\s+(account|service|card)/gi,
    severity: "critical" as const,
    context: "Account threat urgency",
    education:
      "Scammers impersonate services claiming your account is at risk. Always verify directly through official channels, not links in messages.",
  },
];

const COERCION_PATTERNS = [
  {
    regex:
      /\b(must|have\s+to|need\s+to|required\s+to)\s+(respond|reply|call|click|verify|confirm|act)/gi,
    severity: "high" as const,
    context: "Coercive language demanding action",
    education:
      "Legitimate organizations request action but don't use threatening or demanding language.",
  },
  {
    regex:
      /\b(legal\s+action|lawsuit|arrest|warrant|police|authorities|court|lawyer|attorney)\b/gi,
    severity: "critical" as const,
    context: "Legal threat intimidation",
    education:
      "Law enforcement and courts don't notify you of legal action via text or email. This is a common intimidation tactic.",
  },
  {
    regex:
      /\b(don'?t\s+(tell|share|show)|keep\s+(this\s+)?secret|confidential|private\s+matter)/gi,
    severity: "critical" as const,
    context: "Secrecy demand",
    education:
      "Scammers ask you to keep things secret to isolate you from people who might warn you. Legitimate businesses don't demand secrecy.",
  },
  {
    regex: /\b(penalty|fine|fee|charge|consequences)\s+(if|unless|will\s+be)/gi,
    severity: "high" as const,
    context: "Threat of penalties",
    education:
      "Threatening penalties for non-compliance is a manipulation tactic. Verify any such claims through official channels.",
  },
];

const SUSPICIOUS_PATTERNS = [
  {
    regex: /\b(click|tap|open)\s+(here|this|link|attachment|file)/gi,
    severity: "medium" as const,
    context: "Suspicious link request",
    education:
      "Be cautious of unsolicited links. Hover over links to see the actual URL before clicking, or navigate to sites directly.",
  },
  {
    regex:
      /\b(verify|confirm|update|validate)\s+(your\s+)?(account|identity|information|details|credentials)/gi,
    severity: "high" as const,
    context: "Phishing verification request",
    education:
      'Phishing attempts often ask you to "verify" information. Contact the organization directly using official contact methods.',
  },
  {
    regex: /\b(congratulations|congrats|selected|chosen|qualified)\b/gi,
    severity: "medium" as const,
    context: "Unsolicited congratulatory message",
    education:
      'Unexpected congratulations messages are often scams. Be skeptical of being "selected" for something you didn\'t apply for.',
  },
  {
    regex: /\b(refund|reimbursement|compensation|owed|entitled)\b/gi,
    severity: "medium" as const,
    context: "Unexpected refund or compensation",
    education:
      "Scammers lure victims with promises of refunds or money owed. Verify any such claims directly with the organization.",
  },
  {
    regex: /https?:\/\/[^\s]+|www\.[^\s]+/gi,
    severity: "low" as const,
    context: "URL detected in message",
    education:
      "Always verify URLs before clicking. Scammers use look-alike domains. When in doubt, navigate to sites directly.",
  },
];

export function sanitizeText(text: string): string {
  let sanitized = text.slice(0, MAX_TEXT_LENGTH);
  sanitized = sanitized.normalize("NFKC");
  sanitized = sanitized.replace(
    // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional control char sanitization
    // biome-ignore lint/suspicious/noMisleadingCharacterClass: intentional unicode range
    /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g,
    "",
  );
  sanitized = sanitized
    .split("")
    .map((char) => HOMOGLYPH_MAP[char] || char)
    .join("");
  return sanitized.slice(0, MAX_TEXT_LENGTH);
}

export interface AnalyzeTextResult {
  score: number;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  triggers: DetectedTrigger[];
  patterns: string[];
  summary: string;
}

export function analyzeText(
  text: string,
  mode: AnalysisMode = "balanced",
): AnalyzeTextResult {
  if (!text.trim()) {
    return {
      score: 0,
      riskScore: 0,
      riskLevel: "low",
      triggers: [],
      patterns: [],
      summary: "",
    };
  }

  const sanitized = sanitizeText(text);
  const triggers: DetectedTrigger[] = [];
  const seenPatterns = new Set<string>();

  const modeMultipliers: Record<AnalysisMode, number> = {
    paranoid: 1.5,
    balanced: 1.0,
    vent: 0.6,
  };

  const multiplier = modeMultipliers[mode];

  const processPatterns = (
    patternList: {
      regex: RegExp;
      severity: DetectedTrigger["severity"];
      context: string;
      education: string;
    }[],
    type: DetectedTrigger["type"],
  ) => {
    for (const pattern of patternList) {
      try {
        const matches = sanitized.match(pattern.regex);
        if (matches) {
          for (const match of matches) {
            const patternKey = `${type}:${pattern.context}:${match.toLowerCase()}`;
            if (!seenPatterns.has(patternKey)) {
              seenPatterns.add(patternKey);
              triggers.push({
                type,
                pattern: match,
                severity: pattern.severity,
                context: pattern.context,
                educationalInfo: pattern.education,
              });
            }
          }
        }
      } catch (error) {
        console.error("Pattern matching error:", error);
      }
    }
  };

  processPatterns(FINANCIAL_PATTERNS, "financial");
  processPatterns(URGENCY_PATTERNS, "urgency");
  processPatterns(COERCION_PATTERNS, "coercion");
  processPatterns(SUSPICIOUS_PATTERNS, "suspicious");

  const severityScores: Record<DetectedTrigger["severity"], number> = {
    low: 10,
    medium: 25,
    high: 50,
    critical: 100,
  };

  let rawScore = 0;
  for (const trigger of triggers) {
    rawScore += severityScores[trigger.severity];
  }

  const score = Math.min(100, Math.round(rawScore * multiplier));
  const riskScore = score;
  const riskLevel: "low" | "medium" | "high" =
    score >= 60 ? "high" : score >= 30 ? "medium" : "low";

  const patterns = triggers.map((t) => `${t.context}: "${t.pattern}"`);

  const summary =
    triggers.length === 0
      ? "No suspicious patterns detected. Stay vigilant."
      : `Detected ${triggers.length} suspicious pattern${triggers.length > 1 ? "s" : ""}. Review carefully before responding.`;

  return { score, riskScore, riskLevel, triggers, patterns, summary };
}
