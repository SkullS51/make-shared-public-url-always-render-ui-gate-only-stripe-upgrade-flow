/**
 * Gemini API Service
 * Handles communication with Google's Gemini API using user-configured API keys
 */

export interface GeminiResponse {
  text: string;
  uspScore?: number;
  pesLoad?: number;
}

class GeminiService {
  private apiKey = "";
  private readonly GEMINI_ENDPOINT =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

  /**
   * Set the API key for Gemini requests
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Get the current API key
   */
  getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  /**
   * Send a message to Gemini API
   */
  async sendMessage(prompt: string): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      throw new Error(
        "Gemini API key not configured. Please add your API key in Settings.",
      );
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      throw new Error("Invalid prompt: prompt must be a non-empty string");
    }

    try {
      const response = await fetch(
        `${this.GEMINI_ENDPOINT}?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}. ${
            errorData.error?.message ||
            "Please check your API key and try again."
          }`,
        );
      }

      const data = await response.json();

      // Extract text from Gemini response
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from Gemini";

      return {
        text,
        uspScore: undefined,
        pesLoad: undefined,
      };
    } catch (error) {
      console.error("[GeminiService] Error calling Gemini API:", error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "Failed to communicate with Gemini API. Please check your connection and API key.",
      );
    }
  }

  /**
   * Validate API key format
   * Checks for valid Gemini API key prefixes and reasonable length
   */
  validateApiKey(key: string): boolean {
    if (!key || typeof key !== "string") {
      return false;
    }

    const trimmedKey = key.trim();

    // Check minimum length
    if (trimmedKey.length < 30) {
      return false;
    }

    // Check for valid Gemini API key prefixes
    const validPrefixes = ["AIza"];
    const hasValidPrefix = validPrefixes.some((prefix) =>
      trimmedKey.startsWith(prefix),
    );

    return hasValidPrefix;
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
