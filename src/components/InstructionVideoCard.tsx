import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Play } from "lucide-react";
import { format } from "date-fns";

interface InstructionVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  tags: string[] | null;
  created_at: string;
}

interface InstructionVideoCardProps {
  video: InstructionVideo;
}

export function InstructionVideoCard({ video }: InstructionVideoCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const urlParts = video.video_url.split("/");
      const filePath = urlParts.slice(-2).join("/");
      const { error: storageError } = await supabase.storage.from("instruction-videos").remove([filePath]);
      if (storageError) throw storageError;
      const { error: dbError } = await supabase.from("instruction_videos").delete().eq("id", video.id);
      if (dbError) throw dbError;
      toast.success("Video deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["instruction-videos"] });
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    } finally { setIsDeleting(false); }
  };

  return (
    <>
      <Card className="transition-all duration-150 hover:bg-white/[0.06]">
        <CardContent className="p-4">
          <div className="aspect-video bg-white/[0.03] rounded-xl mb-4 overflow-hidden relative group">
            <video src={video.video_url} className="w-full h-full object-cover" controls />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center pointer-events-none">
              <Play className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h3 className="font-semibold font-heading text-lg mb-2 line-clamp-2 text-foreground">{video.title}</h3>
          {video.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
          )}
          <div className="flex flex-wrap gap-1 mb-3">
            {video.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs capitalize">{tag}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Added {format(new Date(video.created_at), "MMM d, yyyy")}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} className="w-full gap-2">
            <Trash2 className="h-4 w-4" />Delete
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{video.title}"? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
