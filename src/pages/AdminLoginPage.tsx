import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // If already admin, redirect
  if (user && isAdmin) {
    navigate("/admin/dashboard", { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Login failed: " + error.message);
    } else {
      // Check admin role after login
      const { data: { user: loggedUser } } = await supabase.auth.getUser();
      if (loggedUser) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", loggedUser.id)
          .eq("role", "admin")
          .maybeSingle();
        if (data) {
          navigate("/admin/dashboard", { replace: true });
        } else {
          toast.error("You are not an admin.");
          await supabase.auth.signOut();
        }
      }
    }
  };

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold">Admin Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            If you think you're the admin, login here.
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </main>
  );
}
