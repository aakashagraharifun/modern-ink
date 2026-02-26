import { useParams } from "react-router-dom";
import { useWork } from "@/hooks/useWorks";
import { HeartButton } from "@/components/HeartButton";
import { CommentBox } from "@/components/CommentBox";
import { SEOHead } from "@/components/SEOHead";
import { RollingPdfViewer } from "@/components/RollingPdfViewer";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Clock, BookOpen, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function estimateReadTime(wordCount: number): string {
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

export default function WorkReaderPage() {
  const { id } = useParams<{ id: string }>();
  const { data: work, isLoading } = useWork(id!);
  const [fontSize, setFontSize] = useState(18);

  // Track view
  useEffect(() => {
    if (work) {
      const viewedKey = `viewed_${work.id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, "1");
        supabase.from("works").update({ view_count: work.view_count + 1 }).eq("id", work.id);
      }
    }
  }, [work]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!work) {
    return <div className="container mx-auto px-4 py-10 text-muted-foreground">Work not found.</div>;
  }

  const isTextContent = work.format !== "pdf" && !!work.content;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <SEOHead
        title={work.title}
        description={work.description || undefined}
        image={work.cover_image_url}
      />

      <div className="mb-8 flex items-start gap-4">
        {work.cover_image_url && (
          <img src={work.cover_image_url} alt={work.title} className="h-36 w-24 rounded object-cover" />
        )}
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-bold">{work.title}</h1>
          {work.description && <p className="mt-2 text-muted-foreground">{work.description}</p>}
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            {work.word_count > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {estimateReadTime(work.word_count)}
              </span>
            )}
            <HeartButton table="works" id={work.id} initialCount={work.like_count} />
          </div>
        </div>
      </div>

      {/* Font size control for text content */}
      {isTextContent && (
        <div className="mb-4 flex items-center gap-3">
          <Type className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Aa</span>
          <Slider
            value={[fontSize]}
            onValueChange={([v]) => setFontSize(v)}
            min={14}
            max={28}
            step={1}
            className="w-32"
          />
          <span className="text-sm text-muted-foreground">Aa</span>
        </div>
      )}

      {work.format === "pdf" && work.pdf_url ? (
        <div className="mb-8">
          <RollingPdfViewer url={work.pdf_url} title={work.title} />
        </div>
      ) : work.content ? (
        <div
          className="mb-8 max-w-none font-serif leading-relaxed text-foreground"
          style={{ whiteSpace: "pre-wrap", fontSize: `${fontSize}px` }}
        >
          {work.content}
        </div>
      ) : (
        <div className="mb-8 flex items-center gap-2 text-muted-foreground">
          <BookOpen className="h-5 w-5" />
          <span>No content available.</span>
        </div>
      )}

      <CommentBox workId={work.id} />
    </main>
  );
}
