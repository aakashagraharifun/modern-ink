import { useParams } from "react-router-dom";
import { useWork, useChapters } from "@/hooks/useWorks";
import { HeartButton } from "@/components/HeartButton";
import { CommentBox } from "@/components/CommentBox";
import { SEOHead } from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { RollingReader } from "@/components/RollingReader";

export default function NovelReaderPage() {
  const { id } = useParams<{ id: string }>();
  const { data: work, isLoading: workLoading } = useWork(id!);
  const { data: chapters, isLoading: chaptersLoading } = useChapters(id!);

  const progressKey = `novel_progress_${id}`;
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  // Load reading progress
  useEffect(() => {
    if (chapters && chapters.length > 0 && !selectedChapter) {
      const saved = localStorage.getItem(progressKey);
      if (saved && chapters.find((c) => c.id === saved)) {
        setSelectedChapter(saved);
      } else {
        setSelectedChapter(chapters[0].id);
      }
    }
  }, [chapters, selectedChapter, progressKey]);

  // Save reading progress
  useEffect(() => {
    if (selectedChapter) {
      localStorage.setItem(progressKey, selectedChapter);
    }
  }, [selectedChapter, progressKey]);

  // Track chapter view
  useEffect(() => {
    if (selectedChapter) {
      const viewedKey = `viewed_chapter_${selectedChapter}`;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, "1");
        const chapter = chapters?.find((c) => c.id === selectedChapter);
        if (chapter) {
          supabase
            .from("chapters")
            .update({ view_count: chapter.view_count + 1 })
            .eq("id", selectedChapter);
        }
      }
    }
  }, [selectedChapter, chapters]);

  // Track novel view
  useEffect(() => {
    if (work) {
      const viewedKey = `viewed_${work.id}`;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, "1");
        supabase.from("works").update({ view_count: work.view_count + 1 }).eq("id", work.id);
      }
    }
  }, [work]);

  const currentChapter = chapters?.find((c) => c.id === selectedChapter);

  if (workLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!work) {
    return <div className="container mx-auto px-4 py-10 text-muted-foreground">Novel not found.</div>;
  }

  const ChapterList = ({ onSelect }: { onSelect?: () => void }) => (
    <div className="space-y-1">
      {chapters?.map((ch) => (
        <button
          key={ch.id}
          onClick={() => {
            setSelectedChapter(ch.id);
            onSelect?.();
          }}
          className={cn(
            "w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
            ch.id === selectedChapter ? "bg-secondary font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          Ch. {ch.chapter_number}: {ch.title}
        </button>
      )) ?? null}
    </div>
  );

  return (
    <main className="container mx-auto px-4 py-6">
      <SEOHead
        title={currentChapter ? `${work.title} — Ch. ${currentChapter.chapter_number}` : work.title}
        description={work.description || undefined}
        image={work.cover_image_url}
      />

      <div className="mb-6 flex items-start gap-4">
        {work.cover_image_url && (
          <img src={work.cover_image_url} alt={work.title} className="h-28 w-20 rounded object-cover" />
        )}
        <div>
          <h1 className="font-serif text-2xl font-bold md:text-3xl">{work.title}</h1>
          {work.description && <p className="mt-1 text-sm text-muted-foreground">{work.description}</p>}
          <HeartButton table="works" id={work.id} initialCount={work.like_count} />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <h3 className="mb-3 font-serif text-sm font-semibold">Chapters</h3>
          {chaptersLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : (
            <ChapterList />
          )}
        </aside>

        {/* Mobile chapter drawer */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="mb-4 gap-2">
                <Menu className="h-4 w-4" /> Chapters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetTitle className="font-serif">Chapters</SheetTitle>
              <div className="mt-4">
                <ChapterList onSelect={() => { }} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Reader area */}
        <div className="min-w-0 flex-1">
          {currentChapter ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold">
                  Chapter {currentChapter.chapter_number}: {currentChapter.title}
                </h2>
                <HeartButton table="chapters" id={currentChapter.id} initialCount={currentChapter.like_count} />
              </div>

              {currentChapter.format === "pdf" && currentChapter.pdf_url ? (
                <div className="relative overflow-hidden rounded-lg bg-card md:border md:shadow-inner md:px-8 md:py-8">
                  <RollingReader url={currentChapter.pdf_url} />
                </div>
              ) : currentChapter.content ? (
                <div className="prose prose-lg max-w-none font-serif dark:prose-invert">
                  {currentChapter.content.split("\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-5 w-5" />
                  <span>No content available for this chapter.</span>
                </div>
              )}

              <CommentBox chapterId={currentChapter.id} />
            </div>
          ) : (
            <p className="text-muted-foreground">Select a chapter to start reading.</p>
          )}
        </div>
      </div>
    </main>
  );
}
