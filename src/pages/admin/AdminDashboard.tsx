import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, Heart, MessageSquare, Plus, LogOut, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { AdminEditWorkDialog } from "@/components/AdminEditWorkDialog";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editWork, setEditWork] = useState<any>(null);
  const [deleteWorkId, setDeleteWorkId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      const { count, error } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("is_archived", false);
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

  const handleDelete = async () => {
    if (!deleteWorkId) return;
    setDeleting(true);
    const { error } = await supabase.from("works").delete().eq("id", deleteWorkId);
    if (error) {
      toast.error("Failed to delete work");
    } else {
      toast.success("Work deleted");
      queryClient.invalidateQueries({ queryKey: ["admin_works"] });
    }
    setDeleting(false);
    setDeleteWorkId(null);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
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
            <CardTitle className="text-sm font-medium">Unread Comments</CardTitle>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works?.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">
                    {w.type === "novel" ? (
                      <Link to={`/admin/chapters/${w.id}`} className="text-accent hover:underline">{w.title}</Link>
                    ) : (
                      w.title
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{w.type}</TableCell>
                  <TableCell className="text-right">{w.view_count}</TableCell>
                  <TableCell className="text-right">{w.like_count}</TableCell>
                  <TableCell className="text-right">{w.is_pinned ? "⭐" : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditWork(w)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteWorkId(w.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {works?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No works yet. Upload your first piece!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit dialog */}
      <AdminEditWorkDialog
        work={editWork}
        open={!!editWork}
        onOpenChange={(open) => !open && setEditWork(null)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["admin_works"] })}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteWorkId} onOpenChange={(open) => !open && setDeleteWorkId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this work and all its chapters and comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
