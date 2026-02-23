import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useWorks(type?: "novel" | "story" | "poem") {
  return useQuery({
    queryKey: ["works", type],
    queryFn: async () => {
      let query = supabase
        .from("works")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (type) query = query.eq("type", type);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useWork(id: string) {
  return useQuery({
    queryKey: ["work", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("works")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useChapters(workId: string) {
  return useQuery({
    queryKey: ["chapters", workId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("work_id", workId)
        .order("chapter_number", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!workId,
  });
}

export function useAuthorProfile() {
  return useQuery({
    queryKey: ["author_profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("author_profile")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
