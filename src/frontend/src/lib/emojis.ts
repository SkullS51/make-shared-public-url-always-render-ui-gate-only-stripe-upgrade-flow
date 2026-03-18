// ForeverRaw Gargoyle Dragon Emoji Registry
// All 15 custom emojis with dark cracked-stone / ember / dragon-scale aesthetic

export interface DragonEmoji {
  id: string;
  name: string;
  filename: string;
  description: string;
}

export const DRAGON_EMOJIS: DragonEmoji[] = [
  {
    id: "dragon-eye",
    name: "Dragon Eye",
    filename: "/assets/generated/emoji-dragon-eye.dim_128x128.png",
    description: "Glowing red dragon eye",
  },
  {
    id: "ember",
    name: "Ember",
    filename: "/assets/generated/emoji-ember.dim_128x128.png",
    description: "Flame with dragon scale",
  },
  {
    id: "chain-link",
    name: "Chain Link",
    filename: "/assets/generated/emoji-chain-link.dim_128x128.png",
    description: "Rusted chain link",
  },
  {
    id: "skull",
    name: "Skull",
    filename: "/assets/generated/emoji-skull.dim_128x128.png",
    description: "Cracked skull with cross in eye",
  },
  {
    id: "raw-heart",
    name: "Raw Heart",
    filename: "/assets/generated/emoji-raw-heart.dim_128x128.png",
    description: "Black heart with red cracks",
  },
  {
    id: "lightning-strike",
    name: "Lightning Strike",
    filename: "/assets/generated/emoji-lightning-strike.dim_128x128.png",
    description: "Dragon claw holding lightning",
  },
  {
    id: "stone",
    name: "Stone",
    filename: "/assets/generated/emoji-stone.dim_128x128.png",
    description: "Cracked black stone with ember",
  },
  {
    id: "blade",
    name: "Blade",
    filename: "/assets/generated/emoji-blade.dim_128x128.png",
    description: "Dragon fang dagger",
  },
  {
    id: "void",
    name: "Void",
    filename: "/assets/generated/emoji-void.dim_128x128.png",
    description: "Black circle with dragon silhouette",
  },
  {
    id: "dragon-shield",
    name: "Dragon Shield",
    filename: "/assets/generated/emoji-dragon-shield.dim_128x128.png",
    description: "Gargoyle wing shield",
  },
  {
    id: "raw-rage",
    name: "Raw Rage",
    filename: "/assets/generated/emoji-raw-rage.dim_128x128.png",
    description: "Dragon snout breathing fire",
  },
  {
    id: "burning-heart",
    name: "Burning Heart",
    filename: "/assets/generated/emoji-burning-heart.dim_128x128.png",
    description: "Heart on fire with chains",
  },
  {
    id: "prayer",
    name: "Prayer",
    filename: "/assets/generated/emoji-prayer.dim_128x128.png",
    description: "Dragon claw holding cross",
  },
  {
    id: "watching",
    name: "Watching",
    filename: "/assets/generated/emoji-watching.dim_128x128.png",
    description: "Glowing dragon eyes",
  },
  {
    id: "steel",
    name: "Steel",
    filename: "/assets/generated/emoji-steel.dim_128x128.png",
    description: "Dragon claw fist",
  },
];

// Regex to match emoji syntax :emoji-id: in message text
export const EMOJI_REGEX = /:([a-z0-9-]+):/g;

// Build a lookup map for fast resolution
export const EMOJI_MAP: Record<string, DragonEmoji> = Object.fromEntries(
  DRAGON_EMOJIS.map((e) => [e.id, e]),
);

// Parse message text into segments of plain text and emoji references
export type TextSegment = { type: "text"; value: string };
export type EmojiSegment = { type: "emoji"; emoji: DragonEmoji };
export type MessageSegment = TextSegment | EmojiSegment;

export function parseMessageSegments(text: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let lastIndex = 0;
  const regex = new RegExp(EMOJI_REGEX.source, "g");
  let match: RegExpExecArray | null;

  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop pattern
  while ((match = regex.exec(text)) !== null) {
    const emojiId = match[1];
    const emoji = EMOJI_MAP[emojiId];

    if (emoji) {
      if (match.index > lastIndex) {
        segments.push({
          type: "text",
          value: text.slice(lastIndex, match.index),
        });
      }
      segments.push({ type: "emoji", emoji });
      lastIndex = match.index + match[0].length;
    }
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }];
}
