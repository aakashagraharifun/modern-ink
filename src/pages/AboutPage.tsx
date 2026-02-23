import { useAuthorProfile } from "@/hooks/useWorks";
import { Skeleton } from "@/components/ui/skeleton";
import { Instagram } from "lucide-react";

export default function AboutPage() {
  const { data: author, isLoading } = useAuthorProfile();

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="mx-auto mb-6 h-40 w-40 rounded-full" />
        <Skeleton className="mx-auto mb-4 h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </main>
    );
  }

  if (!author) {
    return <div className="container mx-auto px-4 py-10 text-muted-foreground">Author profile not set up yet.</div>;
  }

  const journey = (author.writing_journey as Array<{ year: string; milestone: string }>) ?? [];
  const socialLinks = (author.social_links as Record<string, string>) ?? {};

  return (
    <main className="container mx-auto max-w-2xl px-4 py-10">
      {/* Photo */}
      {author.photo_url && (
        <div className="mb-8 flex justify-center">
          <img
            src={author.photo_url}
            alt={author.name}
            className="h-40 w-40 rounded-full object-cover shadow-md"
          />
        </div>
      )}

      <h1 className="mb-4 text-center font-serif text-3xl font-bold">{author.name}</h1>

      {/* Bio */}
      {author.bio && (
        <div className="prose mx-auto mb-10 max-w-none text-center dark:prose-invert">
          {author.bio.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}

      {/* Social Links */}
      <div className="mb-10 flex justify-center gap-4">
        {author.instagram_handle && (
          <a
            href={`https://instagram.com/${author.instagram_handle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors hover:bg-secondary"
          >
            <Instagram className="h-4 w-4" />
            @{author.instagram_handle.replace("@", "")}
          </a>
        )}
        {Object.entries(socialLinks).map(([name, url]) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-secondary"
          >
            {name}
          </a>
        ))}
      </div>

      {/* Writing Journey */}
      {journey.length > 0 && (
        <section>
          <h2 className="mb-6 font-serif text-2xl font-bold">Writing Journey</h2>
          <div className="relative border-l-2 border-border pl-6">
            {journey.map((item, i) => (
              <div key={i} className="relative mb-6 last:mb-0">
                <div className="absolute -left-[calc(0.375rem+1.5rem)] top-1 h-3 w-3 rounded-full bg-accent" />
                <span className="text-sm font-semibold text-accent">{item.year}</span>
                <p className="text-sm text-muted-foreground">{item.milestone}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
