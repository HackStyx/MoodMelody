"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  selectedEmoji?: string;
}

// Face/smiley emojis relevant for mood tracking
const FACE_EMOJIS = [
  { emoji: "😋", label: "Playful" },
  { emoji: "😊", label: "Content" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🤩", label: "Excited" },
  { emoji: "😱", label: "Surprised" },
  { emoji: "🥳", label: "Celebratory" },
  { emoji: "😔", label: "Disappointed" },
  { emoji: "😇", label: "Blessed" },
  { emoji: "🤔", label: "Thoughtful" },
];

export function EmojiPicker({ onEmojiSelect, selectedEmoji }: EmojiPickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-[2px] rounded-full bg-slate-900 dark:bg-slate-800 shadow-sm hover:shadow-md transition-all active:scale-95 border-0 cursor-pointer h-10 w-10 flex items-center justify-center"
        aria-label="Pick an emoji"
      >
        <div className="inline-flex items-center justify-center w-full h-full rounded-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
          {selectedEmoji ? (
            <span className="text-xl">{selectedEmoji}</span>
          ) : (
            <Smile className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          )}
        </div>
      </button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-8 max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col items-center">
          <DialogTitle className="text-2xl font-bold mb-2">Pick your mood</DialogTitle>
          <DialogDescription className="text-center mb-4">
            Select an emoji that best represents how you're feeling right now.
          </DialogDescription>
          <div className="grid grid-cols-6 gap-3 mb-4 w-full">
            {FACE_EMOJIS.map((item) => (
              <button
                key={item.emoji}
                onClick={() => handleEmojiClick(item.emoji)}
                className={`text-3xl rounded-full p-2 transition-all border-2 ${
                  selectedEmoji === item.emoji
                    ? "border-pink-400 bg-pink-100 dark:bg-pink-900/30 shadow-md"
                    : "border-transparent hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                }`}
                aria-label={item.label}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
