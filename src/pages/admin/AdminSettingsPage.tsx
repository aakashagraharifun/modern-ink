import { useState, useEffect } from "react";
import { useSiteSettings, useAuthorProfile } from "@/hooks/useWorks";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminSettingsPage() {
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const { data: author, isLoading: authorLoading } = useAuthorProfile();
  const queryClient = useQueryClient();

  const [siteTitle, setSiteTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [instagram, setInstagram] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.site_title);
      setTagline(settings.tagline || "");
    }
  }, [settings]);

  useEffect(() => {
    if (author) {
      setInstagram(author.instagram_handle || "");
    }
  }, [author]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update site settings
      if (settings) {
        const { error: settingsError } = await supabase
          .from("site_settings")
          .update({ site_title: siteTitle, tagline: tagline || null })
          .eq("id", settings.id);
        if (settingsError) throw settingsError;
      }

      // Update instagram handle on author profile
      if (author) {
        const { error: authorError } = await supabase
          .from("author_profile")
          .update({ instagram_handle: instagram || null })
          .eq("id", author.id);
        if (authorError) throw authorError;
      }

      toast.success("Settings saved!");
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      queryClient.invalidateQueries({ queryKey: ["author_profile"] });
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (settingsLoading || authorLoading) {
    return <div className="container mx-auto px-4 py-10 text-muted-foreground">Loading...</div>;
  }

  return (
    <main className="container mx-auto max-w-xl px-4 py-8">
      <Link to="/admin/dashboard" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <h1 className="mb-6 font-serif text-2xl font-bold">Site Settings</h1>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Site Title</Label>
          <Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
          <p className="text-xs text-muted-foreground">Displayed in the navbar and browser tab.</p>
        </div>

        <div className="space-y-2">
          <Label>Tagline</Label>
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="A Literary Portfolio" />
          <p className="text-xs text-muted-foreground">Shown on the homepage hero section.</p>
        </div>

        <div className="space-y-2">
          <Label>Instagram Handle</Label>
          <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@username" />
          <p className="text-xs text-muted-foreground">Updates the Instagram link across the entire site.</p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </main>
  );
}
