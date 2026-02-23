import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWork } from "@/hooks/useWorks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function AdminChaptersPage() {
  const { workId } = useParams<{ workId: string }>();
  const { data: work } = useWork(workId!);
  const queryClient = useQueryClient();

  const { data: chapters, isLoading } = useQuery({
    queryKey: ["admin_chapters", workId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("work_id", workId!)
        .order("chapter_number", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!workId,
  });

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [format, setFormat] = useState<"pdf" | "text">("pdf");
  const [content, setContent] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const nextNumber = (chapters?.length ?? 0) + 1;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    try {
      let pdfUrl: string | null = null;

      if (format === "pdf" && pdfFile) {
        const path = `${workId}/${crypto.randomUUID()}.pdf`;
        const { error } = await supabase.storage.from("pdfs").upload(path, pdfFile);
        if (error) throw error;
        const { data } = supabase.storage.from("pdfs").getPublicUrl(path);
        pdfUrl = data.publicUrl;
      }

      const wordCount = format === "text" ? content.split(/\s+/).filter(Boolean).length : 0;

      const { error } = await supabase.from("chapters").insert({
        work_id: workId!,
        title: title.trim(),
        chapter_number: parseInt(chapterNumber) || nextNumber,
        format,
        content: format === "text" ? content : null,
        pdf_url: pdfUrl,
        word_count: wordCount,
      });

      if (error) throw error;

      toast.success("Chapter added!");
      setTitle("");
      setChapterNumber("");
      setContent("");
      setPdfFile(null);
      setAdding(false);
      queryClient.invalidateQueries({ queryKey: ["admin_chapters", workId] });
    } catch (err: any) {
      toast.error(err.message || "Failed to add chapter");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chapterId: string) => {
    if (!confirm("Delete this chapter?")) return;
    const { error } = await supabase.from("chapters").delete().eq("id", chapterId);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Chapter deleted");
      queryClient.invalidateQueries({ queryKey: ["admin_chapters", workId] });
    }
  };

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <Link to="/admin/dashboard" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Manage Chapters</h1>
          {work && <p className="text-sm text-muted-foreground">{work.title}</p>}
        </div>
        <Button size="sm" onClick={() => setAdding(!adding)}>
          <Plus className="mr-1 h-4 w-4" /> Add Chapter
        </Button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="mb-8 space-y-4 rounded-lg border bg-card p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chapter Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Chapter Number</Label>
              <Input
                type="number"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(e.target.value)}
                placeholder={String(nextNumber)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {format === "pdf" ? (
            <div className="space-y-2">
              <Label>PDF File</Label>
              <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="font-serif" />
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Chapter"}</Button>
            <Button type="button" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : chapters && chapters.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Format</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {chapters.map((ch) => (
                <TableRow key={ch.id}>
                  <TableCell>{ch.chapter_number}</TableCell>
                  <TableCell className="font-medium">{ch.title}</TableCell>
                  <TableCell className="uppercase text-xs">{ch.format}</TableCell>
                  <TableCell className="text-right">{ch.view_count}</TableCell>
                  <TableCell className="text-right">{ch.like_count}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(ch.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-muted-foreground">No chapters yet. Add the first one!</p>
      )}
    </main>
  );
}
