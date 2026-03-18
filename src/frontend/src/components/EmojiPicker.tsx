import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState } from "react";
import { DRAGON_EMOJIS } from "../lib/emojis";

interface EmojiPickerProps {
  onSelect: (emojiId: string) => void;
  disabled?: boolean;
}

export default function EmojiPicker({ onSelect, disabled }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (emojiId: string) => {
    onSelect(emojiId);
    setOpen(false);
  };

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="flex-shrink-0 p-1 text-stone-500 hover:text-ember-orange transition-colors disabled:opacity-40"
            title="ForeverRaw Dragon Emojis"
            aria-label="Open emoji picker"
          >
            <img
              src="/assets/generated/dragon-icon-small.dim_32x32.png"
              alt="Dragon Emoji"
              className="w-5 h-5 object-contain"
              draggable={false}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="start"
          className="w-72 p-3 border border-stone-700 shadow-blood-lg"
          style={{
            background: "oklch(0.08 0.005 270)",
            backgroundImage:
              "url(/assets/generated/stone-texture.dim_512x512.png)",
            backgroundSize: "200px 200px",
            backgroundBlendMode: "overlay",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-800">
            <img
              src="/assets/generated/gargoyle-dragon-emblem.dim_256x256.png"
              alt=""
              className="w-5 h-5 object-contain opacity-70"
              draggable={false}
            />
            <span className="font-cinzel text-blood-red text-xs tracking-widest font-bold">
              FOREVERRAW EMOJIS
            </span>
          </div>

          {/* Emoji grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {DRAGON_EMOJIS.map((emoji) => (
              <Tooltip key={emoji.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleSelect(emoji.id)}
                    className="group flex flex-col items-center justify-center p-1.5 rounded-sm border border-transparent hover:border-blood-red/50 hover:bg-blood-red/10 transition-all duration-150 cursor-pointer"
                    aria-label={emoji.name}
                  >
                    <img
                      src={emoji.filename}
                      alt={emoji.name}
                      className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-150"
                      draggable={false}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-stone-900 border-stone-700 text-stone-200 text-xs font-mono"
                >
                  {emoji.name}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-stone-800 text-center">
            <span className="text-stone-600 text-xs font-mono tracking-wider">
              GARGOYLE DRAGON · 15 EMOJIS
            </span>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
