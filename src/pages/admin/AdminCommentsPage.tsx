import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, Archive } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminCommentsPage() {
  const queryClient = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);

  const { data: comments, isLoading } = useQuery({
    queryKey: ["admin_comments", showArchived],
    queryFn: async () => {
      const query = supabase
        .from("comments")
        .select("*, works(title), chapters(title, chapter_number)")
        .eq("is_archived", showArchived)
        .order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleArchive = async (id: string) => {
    const { error } = await supabase.from("comments").update({ is_archived: true }).eq("id", id);
    if (error) {
      toast.error("Failed to archive");
    } else {
      toast.success("Comment archived");
      queryClient.invalidateQueries({ queryKey: ["admin_comments"] });
      queryClient.invalidateQueries({ queryKey: ["admin_comments_count"] });
    }
  };

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <Link to="/admin/dashboard" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">Reader Comments</h1>
        <Button variant="outline" size="sm" onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? "Show Unread" : "Show Archived"}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((c: any) => (
            <div key={c.id} className={cn("rounded-lg border p-4", c.is_archived && "opacity-60")}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm font-medium">{c.author_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm">{c.content}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  On: {c.works?.title || `Chapter ${c.chapters?.chapter_number}: ${c.chapters?.title}`}
                </p>
                {!c.is_archived && (
                  <Button variant="ghost" size="sm" onClick={() => handleArchive(c.id)} className="text-xs">
                    <Archive className="mr-1 h-3 w-3" /> Archive
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">{showArchived ? "No archived comments." : "No unread comments."}</p>
      )}
    </main>
  );
}
