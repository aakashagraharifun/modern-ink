import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CommentBoxProps {
  workId?: string;
  chapterId?: string;
}

export function CommentBox({ workId, chapterId }: CommentBoxProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("comments").insert({
      work_id: workId || null,
      chapter_id: chapterId || null,
      author_name: name.trim() || "Anonymous",
      content: content.trim(),
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to post comment");
    } else {
      toast.success("Comment posted! The author will read it.");
      setName("");
      setContent("");
    }
  };

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <h4 className="font-serif text-sm font-semibold">Leave a Comment</h4>
      <Input
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="text-sm"
      />
      <Textarea
        placeholder="Share your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="text-sm"
      />
      <Button size="sm" onClick={submit} disabled={loading || !content.trim()}>
        {loading ? "Posting..." : "Post Comment"}
      </Button>
    </div>
  );
}
