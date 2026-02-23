import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Heart, MessageSquare, Plus, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: works, isLoading } = useQuery({
    queryKey: ["admin_works"],
    queryFn: async () => {
      const { data, error } = await supabase.from("works").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["admin_comments_count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("comments").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const totalViews = works?.reduce((s, w) => s + w.view_count, 0) ?? 0;
  const totalLikes = works?.reduce((s, w) => s + w.like_count, 0) ?? 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to="/admin/upload"><Plus className="mr-1 h-4 w-4" /> Upload</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/comments">Comments</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/profile">Author Profile</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(comments ?? 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Works table */}
      <h2 className="mb-4 font-serif text-xl font-semibold">All Works</h2>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Pinned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works?.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.title}</TableCell>
                  <TableCell className="capitalize">{w.type}</TableCell>
                  <TableCell className="text-right">{w.view_count}</TableCell>
                  <TableCell className="text-right">{w.like_count}</TableCell>
                  <TableCell className="text-right">{w.is_pinned ? "⭐" : "—"}</TableCell>
                </TableRow>
              ))}
              {works?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No works yet. Upload your first piece!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
