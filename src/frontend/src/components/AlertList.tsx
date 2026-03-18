import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, DollarSign, ShieldAlert } from "lucide-react";
import type { DetectedTrigger } from "../lib/types";

interface AlertListProps {
  triggers: DetectedTrigger[];
}

type TriggerType = DetectedTrigger["type"];

const TYPE_ICONS: Record<TriggerType, React.ElementType> = {
  financial: DollarSign,
  urgency: Clock,
  coercion: ShieldAlert,
  suspicious: AlertTriangle,
};

const TYPE_COLORS: Record<TriggerType, string> = {
  financial: "text-chart-2",
  urgency: "text-chart-5",
  coercion: "text-destructive",
  suspicious: "text-chart-1",
};

export default function AlertList({ triggers }: AlertListProps) {
  const getSeverityVariant = (
    severity: DetectedTrigger["severity"],
  ): "secondary" | "default" | "destructive" => {
    switch (severity) {
      case "low":
        return "secondary";
      case "medium":
        return "default";
      case "high":
        return "default";
      case "critical":
        return "destructive";
    }
  };

  const groupedTriggers = triggers.reduce(
    (acc, trigger) => {
      if (!acc[trigger.type]) {
        acc[trigger.type] = [];
      }
      acc[trigger.type].push(trigger);
      return acc;
    },
    {} as Record<TriggerType, DetectedTrigger[]>,
  );

  return (
    <Card
      aria-label="Detected threats"
      className="border-primary/30 bg-card/50"
    >
      <CardHeader>
        <CardTitle className="text-foreground font-mono uppercase tracking-wider">
          Detected Threats ({triggers.length})
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Suspicious patterns found in the message. Click each item to learn
          more about why it was flagged.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {(
            Object.entries(groupedTriggers) as [
              TriggerType,
              DetectedTrigger[],
            ][]
          ).map(([type, typeTriggers], typeIndex) => {
            const Icon = TYPE_ICONS[type];
            const color = TYPE_COLORS[type];

            return (
              <div key={type} className={cn(typeIndex > 0 && "mt-4")}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", color)} aria-hidden="true" />
                  <h3 className="font-semibold capitalize font-mono">
                    {type} Patterns
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-primary/30"
                    aria-label={`${typeTriggers.length} ${type} patterns detected`}
                  >
                    {typeTriggers.length}
                  </Badge>
                </div>
                {typeTriggers.map((trigger, index) => (
                  <AccordionItem
                    key={`${type}-${trigger.type}-${index}`}
                    value={`${type}-${index}`}
                    className="border-l-2 border-l-primary/30 pl-4"
                  >
                    <AccordionTrigger
                      className="hover:no-underline"
                      aria-label={`${trigger.context}, severity: ${trigger.severity}`}
                    >
                      <div className="flex flex-1 items-center justify-between gap-2 pr-4 text-left">
                        <div className="flex-1">
                          <p className="font-medium">{trigger.context}</p>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            "{trigger.pattern}"
                          </p>
                        </div>
                        <Badge
                          variant={getSeverityVariant(trigger.severity)}
                          className="uppercase tracking-wider"
                        >
                          {trigger.severity}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Alert className="mt-2 border-primary/30 bg-primary/5">
                        <AlertTitle className="text-sm font-mono uppercase tracking-wider">
                          Why this matters
                        </AlertTitle>
                        <AlertDescription className="text-sm">
                          {trigger.educationalInfo}
                        </AlertDescription>
                      </Alert>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </div>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
