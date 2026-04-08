import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Video, Pencil, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { EditVideoDialog } from "./EditVideoDialog";

interface VideosListProps {
  clientId: string;
}

export function VideosList({ clientId }: VideosListProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ["client-videos", clientId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("client_videos")
        .select("*")
        .eq("client_id", clientId)
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleDelete = async (videoId: string, videoUrl: string) => {
    try {
      // Extract the file path from the full URL
      const urlParts = videoUrl.split("/");
      const bucketPath = urlParts.slice(urlParts.indexOf("client-videos") + 1).join("/");

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("client-videos")
        .remove([bucketPath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("client_videos")
        .delete()
        .eq("id", videoId);

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ["client-videos", clientId, user?.id] });
      toast.success("Video deleted successfully");
    } catch (error: any) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    }
  };

  const handleSendEmail = async (video: any, clientEmail: string, clientName: string) => {
    try {
      const { error } = await supabase.functions.invoke("send-client-email", {
        body: {
          clientEmail,
          clientName,
          type: "video",
          title: video.title,
          content: video.description,
          videoUrl: video.video_url,
        },
      });

      if (error) throw error;

      toast.success("Video sent to client successfully");
    } catch (error: any) {
      console.error("Error sending video:", error);
      toast.error("Failed to send video");
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="aspect-video w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No training videos yet. Upload your first video to track progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(video.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      const { data: client } = await supabase
                        .from("clients")
                        .select("email, full_name")
                        .eq("id", clientId)
                        .single();
                      
                      if (client?.email) {
                        handleSendEmail(video, client.email, client.full_name);
                      } else {
                        toast.error("Client email not found");
                      }
                    }}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingVideo(video)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingVideoId(video.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <video 
                src={video.video_url} 
                controls 
                preload="metadata"
                playsInline
                className="w-full aspect-video rounded-lg bg-muted"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.parentElement?.insertAdjacentHTML(
                    'beforeend',
                    '<p class="text-sm text-destructive mt-2">Unable to play this video format. Please try downloading it.</p>'
                  );
                }}
              >
                <source src={video.video_url} type="video/quicktime" />
                <source src={video.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {video.description && (
                <p className="text-sm text-muted-foreground">{video.description}</p>
              )}
              {video.file_size && (
                <p className="text-xs text-muted-foreground">
                  File size: {(video.file_size / (1024 * 1024)).toFixed(2)} MB
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {editingVideo && (
        <EditVideoDialog
          video={editingVideo}
          clientId={clientId}
          open={!!editingVideo}
          onOpenChange={(open) => !open && setEditingVideo(null)}
        />
      )}

      <AlertDialog open={!!deletingVideoId} onOpenChange={(open) => !open && setDeletingVideoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone and will permanently remove the video file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const video = videos?.find(v => v.id === deletingVideoId);
                if (video) handleDelete(video.id, video.video_url);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
