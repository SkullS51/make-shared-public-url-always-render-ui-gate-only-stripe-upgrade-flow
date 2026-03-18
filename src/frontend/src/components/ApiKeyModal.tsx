import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";
import { geminiService } from "../lib/geminiService";

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApiKeyModal({ open, onOpenChange }: ApiKeyModalProps) {
  const { geminiApiKey, setGeminiApiKey } = useApp();
  const [inputValue, setInputValue] = useState(geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (open) {
      setInputValue(geminiApiKey);
      setError(null);
    }
  }, [open, geminiApiKey]);

  useEffect(() => {
    if (inputValue && inputValue !== geminiApiKey) {
      setIsValidating(true);
      const timer = setTimeout(() => {
        if (inputValue.trim() && !geminiService.validateApiKey(inputValue)) {
          setError(
            'Invalid API key format. Gemini keys should start with "AIza"',
          );
        } else {
          setError(null);
        }
        setIsValidating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    setError(null);
    setIsValidating(false);
  }, [inputValue, geminiApiKey]);

  const handleSave = () => {
    setError(null);
    if (!inputValue.trim()) {
      setError("API key cannot be empty");
      return;
    }
    if (!geminiService.validateApiKey(inputValue)) {
      setError(
        'Invalid API key format. Gemini API keys should start with "AIza" and be at least 30 characters long.',
      );
      return;
    }
    const trimmedKey = inputValue.trim();
    setGeminiApiKey(trimmedKey);
    geminiService.setApiKey(trimmedKey);
    toast.success("Saved Securely ✅", {
      description:
        "Your Gemini API key has been saved and chat is now enabled.",
    });
    onOpenChange(false);
  };

  const handleRemove = () => {
    if (
      window.confirm(
        "Are you sure you want to remove your Gemini API key? Chat functionality will be disabled.",
      )
    ) {
      setGeminiApiKey("");
      geminiService.setApiKey("");
      setInputValue("");
      toast.success("API key removed");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setInputValue(geminiApiKey);
    setError(null);
    onOpenChange(false);
  };

  const isKeyValid =
    inputValue.trim() && geminiService.validateApiKey(inputValue);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono uppercase tracking-wider">
            <Lock className="h-5 w-5 text-primary" />
            Gemini API Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your Google Gemini API key for enhanced chat
            functionality.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="api-key"
              className="font-mono uppercase tracking-wider text-sm"
            >
              API Key
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your Gemini API key (starts with AIza)..."
                className="pr-10 font-mono text-sm"
                autoComplete="off"
                spellCheck={false}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {inputValue && !isValidating && (
              <div className="flex items-center gap-2 text-xs">
                {isKeyValid ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    <span className="text-primary">Valid API key format</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">
                      Invalid format - should start with "AIza"
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription className="text-xs space-y-2">
              <p className="font-semibold">How to get your API key:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Visit Google AI Studio</li>
                <li>Sign in with your Google account</li>
                <li>Click "Get API Key" in the top right</li>
                <li>Copy your API key and paste it above</li>
              </ol>
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline mt-2"
              >
                Open Google AI Studio
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          {geminiApiKey && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              Remove Key
            </Button>
          )}
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!inputValue.trim() || !isKeyValid}
          >
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
