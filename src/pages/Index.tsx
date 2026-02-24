import { useWorks, useSiteSettings } from "@/hooks/useWorks";
import { WorkCard } from "@/components/WorkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Index = () => {
  const { data: settings } = useSiteSettings();
  const { data: works, isLoading } = useWorks();

  const pinned = works?.filter((w) => w.is_pinned) ?? [];
  const novels = works?.filter((w) => w.type === "novel" && !w.is_pinned) ?? [];
  const stories = works?.filter((w) => w.type === "story" && !w.is_pinned) ?? [];
  const poems = works?.filter((w) => w.type === "poem" && !w.is_pinned) ?? [];

  return (
    <main className="min-h-screen overflow-y-auto">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center md:py-28">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif text-4xl font-bold tracking-tight md:text-6xl"
        >
          {settings?.site_title || "Modern Paper"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground"
        >
          {settings?.tagline || "A Literary Portfolio"}
        </motion.p>
      </section>

      {/* Featured */}
      {pinned.length > 0 && (
        <Section title="Featured">
          <WorkGrid works={pinned} />
        </Section>
      )}

      {/* Novels */}
      {(novels.length > 0 || isLoading) && (
        <Section title="Novels" link="/novels">
          {isLoading ? <LoadingSkeleton /> : <WorkGrid works={novels.slice(0, 6)} />}
        </Section>
      )}

      {/* Stories */}
      {(stories.length > 0 || isLoading) && (
        <Section title="Stories" link="/stories">
          {isLoading ? <LoadingSkeleton /> : <WorkGrid works={stories.slice(0, 6)} />}
        </Section>
      )}

      {/* Poems */}
      {(poems.length > 0 || isLoading) && (
        <Section title="Poems" link="/poems">
          {isLoading ? <LoadingSkeleton /> : <WorkGrid works={poems.slice(0, 6)} />}
        </Section>
      )}

      {!isLoading && (!works || works.length === 0) && (
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">No works published yet. Check back soon!</p>
        </div>
      )}
    </main>
  );
};

function Section({ title, link, children }: { title: string; link?: string; children: React.ReactNode }) {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl font-bold">{title}</h2>
        {link && (
          <Link to={link} className="text-sm text-accent hover:underline">
            View all →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function WorkGrid({ works }: { works: any[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {works.map((w) => (
        <WorkCard
          key={w.id}
          id={w.id}
          title={w.title}
          type={w.type}
          coverImageUrl={w.cover_image_url}
          wordCount={w.word_count}
          likeCount={w.like_count}
          isPinned={w.is_pinned}
        />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default Index;
