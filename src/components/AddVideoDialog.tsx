import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { trackEvent } from "@/lib/posthog";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  video: z.instanceof(File)
    .refine((file) => file.size <= 100 * 1024 * 1024, {
      message: "Video must be less than 100MB",
    })
    .refine((file) => {
      const validTypes = ['video/mp4', 'video/webm'];
      return validTypes.includes(file.type);
    }, {
      message: "Only MP4 and WebM video formats are supported",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddVideoDialogProps {
  clientId: string;
  clientName: string;
}

export function AddVideoDialog({ clientId, clientName }: AddVideoDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload videos",
          variant: "destructive",
        });
        return;
      }

      // Upload video to storage
      const fileExt = data.video.name.split('.').pop();
      const fileName = `${user.id}/${clientId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('client-videos')
        .upload(fileName, data.video);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('client-videos')
        .getPublicUrl(fileName);

      // Save metadata to database
      const { error: dbError } = await supabase.from("client_videos").insert({
        coach_id: user.id,
        client_id: clientId,
        title: data.title,
        description: data.description || null,
        video_url: publicUrl,
        file_size: data.video.size,
      });

      if (dbError) throw dbError;

      trackEvent('client_video_uploaded', {
        client_id: clientId,
        file_size: data.video.size,
      });

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["client-videos", clientId] });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Error",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Video
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Training Video for {clientName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Shooting Form Analysis - Jan 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add notes about this video..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Video File (MP4 or WebM only)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onChange(file);
                      }}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Max file size: 100MB</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload Video"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
