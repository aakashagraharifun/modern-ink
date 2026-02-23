import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function AdminCommentsPage() {
  const { data: comments, isLoading } = useQuery({
    queryKey: ["admin_comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*, works(title), chapters(title, chapter_number)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <Link to="/admin/dashboard" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <h1 className="mb-6 font-serif text-2xl font-bold">Reader Comments</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((c: any) => (
            <div key={c.id} className="rounded-lg border p-4">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm font-medium">{c.author_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">{c.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                On: {c.works?.title || `Chapter ${c.chapters?.chapter_number}: ${c.chapters?.title}`}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No comments yet.</p>
      )}
    </main>
  );
}
