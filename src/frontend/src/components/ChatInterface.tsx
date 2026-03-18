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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { firebaseService } from "@/lib/firebase";
import { geminiService } from "@/lib/geminiService";
import type { Message } from "@/lib/metrics";
import {
  AlertCircle,
  Key,
  Loader2,
  Lock,
  Send,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ApiKeyModal from "./ApiKeyModal";
import { ErrorBoundary } from "./ErrorBoundary";

interface ChatInterfaceProps {
  onMessagesUpdate: (messages: Message[]) => void;
}

function ChatInterfaceContent({ onMessagesUpdate }: ChatInterfaceProps) {
  const { geminiApiKey, isPro } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (geminiApiKey && isPro) {
      geminiService.setApiKey(geminiApiKey);
    }
  }, [geminiApiKey, isPro]);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        setIsInitializing(true);

        if (
          !firebaseService ||
          typeof firebaseService.initialize !== "function"
        ) {
          console.error("[ChatInterface] Firebase service not available");
          setIsOnline(false);
          setError("Firebase service unavailable. Running in offline mode.");
          return;
        }

        const available = await firebaseService.initialize();
        setIsOnline(available);

        if (!available) {
          toast.info("Running in offline mode - all data stored locally");
        }
      } catch (err) {
        console.error("[ChatInterface] Firebase initialization error:", err);
        setIsOnline(false);
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to initialize: ${errorMsg}. Running in offline mode.`);
      } finally {
        setIsInitializing(false);
      }
    };

    initFirebase();
  }, []);

  useEffect(() => {
    const loadMessages = () => {
      try {
        if (
          !firebaseService ||
          typeof firebaseService.getLocalMessages !== "function"
        ) {
          console.error(
            "[ChatInterface] Firebase service getLocalMessages not available",
          );
          return;
        }

        if (!sessionId || typeof sessionId !== "string") {
          console.error("[ChatInterface] Invalid sessionId");
          return;
        }

        const localMessages = firebaseService.getLocalMessages(sessionId);

        if (!localMessages || !Array.isArray(localMessages)) {
          console.warn("[ChatInterface] Invalid local messages format");
          return;
        }

        if (localMessages.length > 0) {
          const formattedMessages: Message[] = localMessages.map(
            (msg, index) => ({
              id: msg.id || `${Date.now()}-${index}`,
              text: msg.text || "",
              timestamp: msg.timestamp || Date.now(),
              sender: msg.sender || "system",
            }),
          );

          setMessages(formattedMessages);

          if (onMessagesUpdate && typeof onMessagesUpdate === "function") {
            onMessagesUpdate(formattedMessages);
          }
        }
      } catch (err) {
        console.error("[ChatInterface] Error loading local messages:", err);
      }
    };

    if (!isInitializing) {
      loadMessages();
    }
  }, [sessionId, onMessagesUpdate, isInitializing]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages change
  useEffect(() => {
    try {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    } catch (err) {
      console.error("[ChatInterface] Error scrolling:", err);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText || !inputText.trim()) {
      return;
    }

    if (!isPro) {
      toast.error("Upgrade to Pro Access to use chat functionality");
      return;
    }

    if (!geminiService.isConfigured()) {
      setShowApiKeyModal(true);
      toast.error("Please add your Gemini API key in Settings to enable chat");
      return;
    }

    setError(null);
    setIsSending(true);

    const userMessageText = inputText.trim();
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      text: userMessageText,
      timestamp: Date.now(),
      sender: "user",
    };

    try {
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);

      if (onMessagesUpdate && typeof onMessagesUpdate === "function") {
        onMessagesUpdate(updatedMessages);
      }

      setInputText("");

      try {
        if (
          firebaseService &&
          typeof firebaseService.addLocalMessage === "function"
        ) {
          firebaseService.addLocalMessage(sessionId, {
            text: userMessageText,
            sender: "user",
            timestamp: Date.now(),
            sessionId,
          });
        }

        if (
          isOnline &&
          firebaseService &&
          typeof firebaseService.sendToSTI === "function"
        ) {
          try {
            await firebaseService.sendToSTI(userMessageText, sessionId);
          } catch (stiError) {
            console.error("[ChatInterface] STI send error:", stiError);
          }
        }
      } catch (storageError) {
        console.error("[ChatInterface] Storage error:", storageError);
      }

      try {
        const geminiResponse = await geminiService.sendMessage(userMessageText);

        const systemMessage: Message = {
          id: `${Date.now()}-${Math.random()}`,
          text: geminiResponse.text,
          timestamp: Date.now(),
          sender: "system",
        };

        const finalMessages = [...updatedMessages, systemMessage];
        setMessages(finalMessages);

        if (onMessagesUpdate && typeof onMessagesUpdate === "function") {
          onMessagesUpdate(finalMessages);
        }

        if (
          firebaseService &&
          typeof firebaseService.addLocalMessage === "function"
        ) {
          try {
            firebaseService.addLocalMessage(sessionId, {
              text: systemMessage.text,
              sender: "system",
              timestamp: systemMessage.timestamp,
              sessionId,
            });
          } catch (addError) {
            console.error(
              "[ChatInterface] Error storing system message:",
              addError,
            );
          }
        }

        toast.success("Message sent");
      } catch (geminiError) {
        console.error("[ChatInterface] Gemini API error:", geminiError);

        const errorMessage =
          geminiError instanceof Error
            ? geminiError.message
            : "Failed to get response from Gemini";
        const errorChatMessage: Message = {
          id: `error-${Date.now()}`,
          text: `⚠️ ${errorMessage}`,
          timestamp: Date.now(),
          sender: "system",
        };

        const errorMessages = [...updatedMessages, errorChatMessage];
        setMessages(errorMessages);

        if (onMessagesUpdate && typeof onMessagesUpdate === "function") {
          onMessagesUpdate(errorMessages);
        }

        toast.error("Failed to get response from Gemini");
      }
    } catch (error) {
      console.error("[ChatInterface] Error sending message:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to send message: ${errorMessage}`);

      try {
        const errorChatMessage: Message = {
          id: `error-${Date.now()}`,
          text: `⚠️ Error: ${errorMessage}. Your message was not sent.`,
          timestamp: Date.now(),
          sender: "system",
        };

        setMessages((prev) => {
          const newMessages = [...prev, errorChatMessage];

          if (onMessagesUpdate && typeof onMessagesUpdate === "function") {
            onMessagesUpdate(newMessages);
          }

          return newMessages;
        });
      } catch (stateError) {
        console.error(
          "[ChatInterface] Error updating state with error message:",
          stateError,
        );
      }

      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    try {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    } catch (err) {
      console.error("[ChatInterface] Error handling key press:", err);
    }
  };

  const isGeminiConfigured = geminiService.isConfigured();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Chat Interface
                {!isPro && <Lock className="h-4 w-4 text-muted-foreground" />}
                {isInitializing ? (
                  <Loader2
                    className="h-4 w-4 animate-spin text-muted-foreground"
                    aria-label="Initializing"
                  />
                ) : isOnline ? (
                  <Wifi className="h-4 w-4 text-chart-2" aria-label="Online" />
                ) : (
                  <WifiOff
                    className="h-4 w-4 text-muted-foreground"
                    aria-label="Offline"
                  />
                )}
              </CardTitle>
              <CardDescription>
                {isInitializing
                  ? "Initializing..."
                  : !isPro
                    ? "Upgrade to Pro Access to enable AI chat"
                    : isGeminiConfigured
                      ? "Gemini AI enabled - messages will receive AI responses"
                      : "Add Gemini API key in Settings to enable AI chat"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {!isPro && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Pro Only
                </Badge>
              )}
              {!isGeminiConfigured && isPro && (
                <Badge variant="secondary" className="gap-1">
                  <Key className="h-3 w-3" />
                  No API Key
                </Badge>
              )}
              <Badge variant={isOnline ? "default" : "secondary"}>
                {isInitializing
                  ? "Initializing"
                  : isOnline
                    ? "Online"
                    : "Offline"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPro && (
            <Alert className="border-primary/30 bg-primary/5">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Gemini AI chat is a Pro Access feature. Upgrade to unlock
                AI-powered insights and support.
              </AlertDescription>
            </Alert>
          )}

          {isPro && !isGeminiConfigured && (
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Gemini API key required for chat functionality.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeyModal(true)}
                >
                  Add API Key
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <ScrollArea
            className="h-[300px] rounded-lg border p-4"
            ref={scrollRef}
          >
            <div className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  {isPro
                    ? "No messages yet. Start a conversation to see USP/PES metrics."
                    : "Upgrade to Pro Access to enable chat functionality."}
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                      <p className="mt-1 text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Textarea
              placeholder={
                !isPro
                  ? "Upgrade to Pro to enable chat..."
                  : isGeminiConfigured
                    ? "Type your message... (Press Enter to send, Shift+Enter for new line)"
                    : "Add Gemini API key to enable chat..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[60px] resize-none"
              disabled={
                isSending || isInitializing || !isGeminiConfigured || !isPro
              }
              aria-label="Message input"
            />
            <Button
              onClick={handleSend}
              disabled={
                !inputText.trim() ||
                isSending ||
                isInitializing ||
                !isGeminiConfigured ||
                !isPro
              }
              size="icon"
              className="h-[60px] w-[60px] shrink-0"
              aria-label={isSending ? "Sending message" : "Send message"}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isSending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Sending to Gemini...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <ApiKeyModal open={showApiKeyModal} onOpenChange={setShowApiKeyModal} />
    </>
  );
}

export default function ChatInterface(props: ChatInterfaceProps) {
  return (
    <ErrorBoundary
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Chat Interface Error
            </CardTitle>
            <CardDescription>
              The chat interface encountered an error and needs to be reloaded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                An unexpected error occurred in the chat interface. Please
                refresh the page to continue.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      }
    >
      <ChatInterfaceContent {...props} />
    </ErrorBoundary>
  );
}
