/**
 * Firebase Integration Module (Placeholder Implementation)
 * Provides optional Firebase connectivity with graceful offline fallback
 * Note: This is a placeholder implementation. To enable Firebase, install:
 * - firebase (npm install firebase)
 * And configure environment variables in .env
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface ChatMessage {
  id?: string;
  text: string;
  sender: "user" | "system";
  timestamp: number;
  sessionId?: string;
}

export interface GeminiResponse {
  text: string;
  uspScore?: number;
  pesLoad?: number;
}

type Unsubscribe = () => void;

class FirebaseService {
  private isConfigured = false;
  private localMessages: Map<string, ChatMessage[]> = new Map();

  /**
   * Initialize Firebase with environment configuration
   * Returns true if successful, false if Firebase is not configured
   */
  async initialize(): Promise<boolean> {
    try {
      // Check for Firebase configuration in environment
      const config: FirebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId:
          import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
      };

      // Check if all required fields are present
      if (!config.apiKey || !config.projectId || !config.appId) {
        console.info(
          "[FirebaseService] Firebase not configured - running in offline mode",
        );
        return false;
      }

      // Firebase SDK not installed - running in offline mode
      console.info(
        "[FirebaseService] Firebase SDK not available - running in offline mode",
      );
      console.info(
        "[FirebaseService] To enable Firebase: npm install firebase",
      );
      this.isConfigured = false;
      return false;
    } catch (error) {
      console.warn(
        "[FirebaseService] Firebase initialization failed - running in offline mode:",
        error,
      );
      this.isConfigured = false;
      return false;
    }
  }

  /**
   * Check if Firebase is configured and available
   */
  isAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Send message to STI session (offline implementation with safe guards)
   */
  async sendToSTI(message: string, sessionId: string): Promise<void> {
    // Validate inputs
    if (!message || typeof message !== "string") {
      throw new Error("Invalid message: message must be a non-empty string");
    }

    if (!sessionId || typeof sessionId !== "string") {
      throw new Error(
        "Invalid sessionId: sessionId must be a non-empty string",
      );
    }

    try {
      if (!this.isAvailable()) {
        // Offline mode - store locally
        const messages = this.localMessages.get(sessionId) || [];
        messages.push({
          text: message,
          sender: "user",
          timestamp: Date.now(),
          sessionId,
        });
        this.localMessages.set(sessionId, messages);
        return;
      }

      // If Firebase is available, this would be the place to send to Firestore
      throw new Error("Firebase not available");
    } catch (error) {
      console.error("[FirebaseService] Error in sendToSTI:", error);
      throw error;
    }
  }

  /**
   * Subscribe to messages in a session (offline implementation)
   */
  subscribeToMessages(
    sessionId: string,
    callback: (messages: ChatMessage[]) => void,
  ): Unsubscribe | null {
    // Validate inputs
    if (!sessionId || typeof sessionId !== "string") {
      console.error(
        "[FirebaseService] Invalid sessionId in subscribeToMessages",
      );
      return null;
    }

    if (!callback || typeof callback !== "function") {
      console.error(
        "[FirebaseService] Invalid callback in subscribeToMessages",
      );
      return null;
    }

    try {
      if (!this.isAvailable()) {
        // Offline mode - return local messages
        const messages = this.localMessages.get(sessionId) || [];
        callback(messages);

        // Return unsubscribe function
        return () => {
          // No-op for offline mode
        };
      }

      return null;
    } catch (error) {
      console.error("[FirebaseService] Error in subscribeToMessages:", error);
      return null;
    }
  }

  /**
   * Handle Gemini API response (placeholder for REST integration with safe guards)
   */
  async handleGeminiResponse(prompt: string): Promise<GeminiResponse> {
    // Validate input
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Invalid prompt: prompt must be a non-empty string");
    }

    try {
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

      if (!geminiApiKey) {
        throw new Error("Gemini API key not configured");
      }

      // Placeholder response - replace with actual API call when needed
      return {
        text: "This is a placeholder response. To enable Gemini API integration, configure VITE_GEMINI_API_KEY and implement the REST API call.",
        uspScore: 50,
        pesLoad: 25,
      };
    } catch (error) {
      console.error("[FirebaseService] Error calling Gemini API:", error);
      throw error;
    }
  }

  /**
   * Get current user ID (offline implementation)
   */
  getUserId(): string | null {
    try {
      return `offline-user-${Date.now()}`;
    } catch (error) {
      console.error("[FirebaseService] Error getting user ID:", error);
      return null;
    }
  }

  /**
   * Get local messages for a session (offline mode helper with safe guards)
   */
  getLocalMessages(sessionId: string): ChatMessage[] {
    try {
      // Validate input
      if (!sessionId || typeof sessionId !== "string") {
        console.error(
          "[FirebaseService] Invalid sessionId in getLocalMessages",
        );
        return [];
      }

      const messages = this.localMessages.get(sessionId);
      return messages ? [...messages] : [];
    } catch (error) {
      console.error("[FirebaseService] Error getting local messages:", error);
      return [];
    }
  }

  /**
   * Add local message (offline mode helper with safe guards)
   */
  addLocalMessage(sessionId: string, message: ChatMessage): void {
    try {
      // Validate inputs
      if (!sessionId || typeof sessionId !== "string") {
        console.error("[FirebaseService] Invalid sessionId in addLocalMessage");
        return;
      }

      if (!message || typeof message !== "object") {
        console.error("[FirebaseService] Invalid message in addLocalMessage");
        return;
      }

      if (!message.text || typeof message.text !== "string") {
        console.error(
          "[FirebaseService] Invalid message.text in addLocalMessage",
        );
        return;
      }

      const messages = this.localMessages.get(sessionId) || [];
      messages.push({
        ...message,
        id: message.id || `${Date.now()}-${Math.random()}`,
        timestamp: message.timestamp || Date.now(),
      });
      this.localMessages.set(sessionId, messages);
    } catch (error) {
      console.error("[FirebaseService] Error adding local message:", error);
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
