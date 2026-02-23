import { useWorks } from "@/hooks/useWorks";
import { WorkCard } from "@/components/WorkCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function StoriesPage() {
  const { data: works, isLoading } = useWorks("story");

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="mb-8 font-serif text-3xl font-bold">Stories</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : works && works.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {works.map((w) => (
            <WorkCard key={w.id} id={w.id} title={w.title} type={w.type} coverImageUrl={w.cover_image_url} wordCount={w.word_count} likeCount={w.like_count} isPinned={w.is_pinned} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No stories yet.</p>
      )}
    </main>
  );
}
