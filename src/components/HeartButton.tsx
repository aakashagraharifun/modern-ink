import { Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface HeartButtonProps {
  table: "works" | "chapters";
  id: string;
  initialCount: number;
}

export function HeartButton({ table, id, initialCount }: HeartButtonProps) {
  const storageKey = `liked_${table}_${id}`;
  const [liked, setLiked] = useState(() => localStorage.getItem(storageKey) === "1");
  const [count, setCount] = useState(initialCount);

  const toggle = async () => {
    const newLiked = !liked;
    const newCount = newLiked ? count + 1 : count - 1;

    setLiked(newLiked);
    setCount(newCount);

    if (newLiked) {
      localStorage.setItem(storageKey, "1");
    } else {
      localStorage.removeItem(storageKey);
    }

    await supabase
      .from(table)
      .update({ like_count: newCount })
      .eq("id", id);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      className="gap-1.5"
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          liked ? "fill-accent text-accent" : "text-muted-foreground"
        )}
      />
      <span className="text-sm">{count}</span>
    </Button>
  );
}
