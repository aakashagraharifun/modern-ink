import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Work {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  is_pinned: boolean;
  format: string;
  cover_image_url: string | null;
}

interface Props {
  work: Work | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function AdminEditWorkDialog({ work, open, onOpenChange, onSaved }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (work) {
      setTitle(work.title);
      setDescription(work.description || "");
      setContent(work.content || "");
      setIsPinned(work.is_pinned);
      setCoverFile(null);
    }
  }, [work]);

  const handleSave = async () => {
    if (!work || !title.trim()) return;
    setSaving(true);

    try {
      let coverUrl = work.cover_image_url;

      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("covers").upload(path, coverFile);
        if (error) throw error;
        const { data } = supabase.storage.from("covers").getPublicUrl(path);
        coverUrl = data.publicUrl;
      }

      const wordCount = work.format === "text" ? content.split(/\s+/).filter(Boolean).length : undefined;

      const { error } = await supabase
        .from("works")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          content: work.format === "text" ? content : undefined,
          cover_image_url: coverUrl,
          is_pinned: isPinned,
          ...(wordCount !== undefined && { word_count: wordCount }),
        })
        .eq("id", work.id);

      if (error) throw error;

      toast.success("Work updated!");
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Edit Work</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          {work?.format === "text" && (
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="font-serif" />
            </div>
          )}
          <div className="space-y-2">
            <Label>Replace Cover Image</Label>
            <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isPinned} onCheckedChange={setIsPinned} />
            <Label>Pin as Featured</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
