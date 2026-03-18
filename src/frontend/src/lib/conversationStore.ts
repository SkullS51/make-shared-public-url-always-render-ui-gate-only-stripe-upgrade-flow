export interface ConversationEntry {
  userId: string; // other user's principal as string
  displayName?: string;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
}

export function getConversations(): ConversationEntry[] {
  try {
    return JSON.parse(localStorage.getItem("foreverraw_conversations") || "[]");
  } catch {
    return [];
  }
}

export function upsertConversation(entry: ConversationEntry): void {
  const all = getConversations();
  const idx = all.findIndex((c) => c.userId === entry.userId);
  if (idx >= 0) all[idx] = entry;
  else all.unshift(entry);
  all.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  localStorage.setItem("foreverraw_conversations", JSON.stringify(all));
}
