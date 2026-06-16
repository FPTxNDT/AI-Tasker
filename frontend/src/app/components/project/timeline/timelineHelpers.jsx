import { Bot, FileText, MessageSquare } from "lucide-react";

// =============================================================================
// Timeline helpers — pure utility functions for ProjectTimelineManager
// =============================================================================

/** Return an icon element for a given actor label. */
export function getActorIcon(actor) {
  if (actor === "AI") return <Bot className="w-4 h-4" />;
  if (actor === "Client") return <MessageSquare className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
}
