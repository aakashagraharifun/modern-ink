import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function AdminEditWorkPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [title, setTitle] = useState("");
    const [type, setType] = useState<"novel" | "story" | "poem">("poem");
    const [format, setFormat] = useState<"text" | "pdf">("text");
    const [content, setContent] = useState("");
    const [description, setDescription] = useState("");
    const [isPinned, setIsPinned] = useState(false);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    useEffect(() => {
        async function fetchWork() {
            if (!id) return;
            try {
                const { data, error } = await supabase.from("works").select("*").eq("id", id).single();
                if (error) throw error;
                setTitle(data.title);
                setType(data.type as "novel" | "story" | "poem");
                setFormat(data.format as "text" | "pdf");
                setContent(data.content || "");
                setDescription(data.description || "");
                setIsPinned(data.is_pinned || false);
            } catch (err: any) {
                toast.error("Failed to load work: " + err.message);
                navigate("/admin/dashboard");
            } finally {
                setFetching(false);
            }
        }
        fetchWork();
    }, [id, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (format === "text" && !content.trim()) {
            toast.error("Content is required");
            return;
        }
        setLoading(true);

        try {
            let coverUrl: string | undefined = undefined;
            let pdfUrl: string | undefined = undefined;

            // Upload cover
            if (coverFile) {
                const ext = coverFile.name.split(".").pop();
                const path = `${crypto.randomUUID()}.${ext}`;
                const { error } = await supabase.storage.from("covers").upload(path, coverFile);
                if (error) throw error;
                const { data: urlData } = supabase.storage.from("covers").getPublicUrl(path);
                coverUrl = urlData.publicUrl;
            }

            // Upload PDF
            if (format === "pdf" && pdfFile) {
                const ext = pdfFile.name.split(".").pop();
                const path = `${crypto.randomUUID()}.${ext}`;
                const { error } = await supabase.storage.from("pdfs").upload(path, pdfFile);
                if (error) throw error;
                const { data: urlData } = supabase.storage.from("pdfs").getPublicUrl(path);
                pdfUrl = urlData.publicUrl;
            }

            const wordCount = format === "text" ? content.split(/\s+/).filter(Boolean).length : 0;

            const updates: any = {
                title: title.trim(),
                type,
                format,
                content: format === "text" ? content : null,
                description: description.trim() || null,
                is_pinned: isPinned,
                word_count: wordCount,
            };

            if (coverUrl) updates.cover_image_url = coverUrl;
            if (pdfUrl) updates.pdf_url = pdfUrl;

            const { error } = await supabase.from("works").update(updates).eq("id", id);
            if (error) throw error;

            toast.success("Work updated successfully!");
            navigate("/admin/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center">Loading...</div>;

    return (
        <main className="container mx-auto max-w-xl px-4 py-8">
            <Link to="/admin/dashboard" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="mb-6 font-serif text-2xl font-bold">Edit Work</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as any)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="novel">Novel</SelectItem>
                                <SelectItem value="story">Story</SelectItem>
                                <SelectItem value="poem">Poem</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Format</Label>
                        <Select value={format} onValueChange={(v) => setFormat(v as any)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Description (optional)</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
                </div>

                {format === "text" && (
                    <div className="space-y-2">
                        <Label>Content</Label>
                        <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="font-serif" />
                    </div>
                )}

                {format === "pdf" && (
                    <div className="space-y-2">
                        <Label>Update PDF File (optional - leave blank to keep current)</Label>
                        <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} />
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Update Cover Image (optional - leave blank to keep current)</Label>
                    <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
                </div>

                <div className="flex items-center gap-2">
                    <Switch checked={isPinned} onCheckedChange={setIsPinned} />
                    <Label>Pin as Featured</Label>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Updating..." : "Update Work"}
                </Button>
            </form>
        </main>
    );
}
