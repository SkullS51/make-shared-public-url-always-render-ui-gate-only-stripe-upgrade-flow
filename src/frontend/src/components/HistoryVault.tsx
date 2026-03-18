import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { cn } from "@/lib/utils";
import { AlertTriangle, Archive, Clock, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";

export default function HistoryVault() {
  const { history, deleteHistoryItem, clearHistory } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedItem = history.find((item) => item.id === selectedId);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getRiskColor = (score: number) => {
    if (score < 25) return "text-chart-2";
    if (score < 50) return "text-chart-5";
    if (score < 75) return "text-chart-1";
    return "text-destructive";
  };

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    if (selectedId === id) {
      setSelectedId(null);
    }
    toast.success("History item deleted");

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleClearAll = () => {
    clearHistory();
    setSelectedId(null);

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Archive
            className="mb-4 h-12 w-12 text-muted-foreground/50"
            aria-hidden="true"
          />
          <h3 className="mb-2 text-lg font-semibold">No History Yet</h3>
          <p className="text-center text-sm text-muted-foreground">
            Your analysis history will appear here. Analyze messages to start
            building your vault.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* History List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analysis History</CardTitle>
              <CardDescription>
                {history.length} stored analyses
              </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {history.length} stored
                    analysis results. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll}>
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <ul className="space-y-2" aria-label="Analysis history list">
              {history.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                      selectedId === item.id && "border-primary bg-accent",
                    )}
                    aria-label={`Analysis from ${formatDate(item.timestamp)} with risk score ${item.score}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={cn("h-4 w-4", getRiskColor(item.score))}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            "text-lg font-bold",
                            getRiskColor(item.score),
                          )}
                        >
                          {item.score}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.mode}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {item.triggers.length} triggers
                        </Badge>
                      </div>
                    </div>
                    <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                      {item.text}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatDate(item.timestamp)}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail View */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Details</CardTitle>
          <CardDescription>
            {selectedItem
              ? "View detailed information about this analysis"
              : "Select an item to view details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedItem ? (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {/* Score */}
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-sm font-medium text-muted-foreground">
                    Risk Score
                  </div>
                  <div
                    className={cn(
                      "text-4xl font-bold",
                      getRiskColor(selectedItem.score),
                    )}
                  >
                    {selectedItem.score}/100
                  </div>
                </div>

                {/* Message */}
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-sm font-medium text-muted-foreground">
                    Message
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {selectedItem.text}
                  </p>
                </div>

                {/* Metadata */}
                <div className="rounded-lg border p-4">
                  <div className="mb-2 text-sm font-medium text-muted-foreground">
                    Metadata
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Analysis Mode:
                      </span>
                      <Badge variant="outline">{selectedItem.mode}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Triggers Found:
                      </span>
                      <span className="font-medium">
                        {selectedItem.triggers.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Analyzed:</span>
                      <span className="font-medium">
                        {new Date(selectedItem.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Triggers */}
                <div className="rounded-lg border p-4">
                  <div className="mb-3 text-sm font-medium text-muted-foreground">
                    Detected Triggers
                  </div>
                  <div className="space-y-3">
                    {selectedItem.triggers.map((trigger, index) => (
                      <div
                        key={`${trigger.type}-${trigger.pattern}-${index}`}
                        className="rounded-lg border-l-2 border-l-muted bg-muted/30 p-3"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {trigger.type}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {trigger.severity}
                          </Badge>
                        </div>
                        <p className="mb-1 text-xs text-muted-foreground">
                          {trigger.context}
                        </p>
                        <p className="font-mono text-xs break-words">
                          "{trigger.pattern}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete This Analysis
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Analysis?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this analysis from your
                        history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(selectedItem.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-[600px] items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Select an analysis to view details
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
