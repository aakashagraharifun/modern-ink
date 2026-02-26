import { useState, useEffect } from "react";
import { useAuthorProfile } from "@/hooks/useWorks";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminProfilePage() {
  const { data: author, isLoading } = useAuthorProfile();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (author) {
      setName(author.name);
      setBio(author.bio || "");
      setInstagram(author.instagram_handle || "");
      const links = (author.social_links as Record<string, string>) ?? {};
      setEmail(links.email || links.Email || "");
    }
  }, [author]);

  const handleSave = async () => {
    if (!author) return;
    setSaving(true);
    try {
      let photoUrl = author.photo_url;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `author-photo.${ext}`;
        await supabase.storage.from("author").upload(path, photoFile, { upsert: true });
        const { data } = supabase.storage.from("author").getPublicUrl(path);
        photoUrl = data.publicUrl;
      }

      const existingLinks = (author.social_links as Record<string, string>) ?? {};
      const updatedLinks = { ...existingLinks, email: email || undefined };
      if (!email) delete updatedLinks.email;

      const { error } = await supabase
        .from("author_profile")
        .update({
          name,
          bio,
          instagram_handle: instagram,
          photo_url: photoUrl,
          social_links: updatedLinks as any,
        })
        .eq("id", author.id);

      if (error) throw error;
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["author_profile"] });
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="container mx-auto px-4 py-10">Loading...</div>;

  return (
    <main className="container mx-auto max-w-xl px-4 py-8">
      <Link to="/admin/dashboard" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <h1 className="mb-6 font-serif text-2xl font-bold">Author Profile</h1>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
        </div>
        <div className="space-y-2">
          <Label>Instagram Handle</Label>
          <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@username" />
        </div>
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="author@example.com" />
          <p className="text-xs text-muted-foreground">Displayed on the About page for readers to contact you.</p>
        </div>
        <div className="space-y-2">
          <Label>Author Photo</Label>
          <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </main>
  );
}
