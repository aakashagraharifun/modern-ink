import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Auto-redirect on token errors
        if (event === "TOKEN_REFRESHED" && !session) {
          await supabase.auth.signOut();
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentUser.id)
            .eq("role", "admin")
            .maybeSingle();
          setIsAdmin(!!data);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // If session retrieval fails (expired/invalid token), sign out cleanly
      if (error || (!session && localStorage.getItem("sb-uojoigfbykdkrmxagmuz-auth-token"))) {
        supabase.auth.signOut().then(() => {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        });
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .eq("role", "admin")
          .maybeSingle()
          .then(({ data }) => {
            setIsAdmin(!!data);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, isAdmin };
}
