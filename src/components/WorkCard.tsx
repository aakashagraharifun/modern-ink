import { Heart, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WorkCardProps {
  id: string;
  title: string;
  type: "novel" | "story" | "poem";
  coverImageUrl?: string | null;
  wordCount?: number;
  likeCount: number;
  isPinned?: boolean;
}

function estimateReadTime(wordCount: number): string {
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

export function WorkCard({
  id,
  title,
  type,
  coverImageUrl,
  wordCount = 0,
  likeCount,
  isPinned,
}: WorkCardProps) {
  const linkPath = type === "novel" ? `/novels/${id}` : type === "story" ? `/stories/${id}` : `/poems/${id}`;

  return (
    <Link
      to={linkPath}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
    >
      {isPinned && (
        <Badge className="absolute left-2 top-2 z-10 bg-accent text-accent-foreground">
          Featured
        </Badge>
      )}
      <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-serif text-2xl text-muted-foreground/40">{title[0]}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="font-serif text-base font-semibold leading-tight line-clamp-2">
          {title}
        </h3>
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          {wordCount > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {estimateReadTime(wordCount)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Heart className={cn("h-3 w-3", likeCount > 0 && "fill-accent text-accent")} />
            {likeCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
