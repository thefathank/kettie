import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload } from "lucide-react";
import { trackEvent } from "@/lib/posthog";

const AVAILABLE_TAGS = [
  "serve",
  "backhand", 
  "forehand",
  "overhead",
  "volley",
  "footwork",
  "strategy"
];

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(255, "Title must be less than 255 characters"),
  description: z.string().max(1000, "Description must be less than 1,000 characters").optional(),
  tags: z.array(z.string()).min(1, "Select at least one tag"),
  video: z.instanceof(File, { message: "Please select a video file" }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddInstructionVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddInstructionVideoDialog({ open, onOpenChange }: AddInstructionVideoDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      video: undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user?.id) {
      toast.error("You must be logged in");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Upload video to storage
      const fileExt = values.video.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      setUploadProgress(50);
      
      const { error: uploadError } = await supabase.storage
        .from("instruction-videos")
        .upload(fileName, values.video);

      if (uploadError) throw uploadError;
      
      setUploadProgress(75);

      // Get the video URL
      const { data: { publicUrl } } = supabase.storage
        .from("instruction-videos")
        .getPublicUrl(fileName);

      // Insert video record
      const { error: dbError } = await supabase
        .from("instruction_videos")
        .insert({
          coach_id: user.id,
          title: values.title,
          description: values.description || null,
          video_url: publicUrl,
          tags: values.tags,
          file_size: values.video.size,
        });

      if (dbError) throw dbError;

      trackEvent('instruction_video_uploaded', {
        tags: values.tags,
        file_size: values.video.size,
      });

      toast.success("Instruction video added successfully");
      queryClient.invalidateQueries({ queryKey: ["instruction-videos"] });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding instruction video:", error);
      toast.error("Failed to add video. Please try again.");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Instruction Video</DialogTitle>
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
                    <Input placeholder="e.g., Perfect Forehand Technique" {...field} />
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
                      placeholder="Brief description of what this video teaches..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_TAGS.map((tag) => (
                      <FormField
                        key={tag}
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(tag)}
                                onCheckedChange={(checked) => {
                                  const currentTags = field.value || [];
                                  const newTags = checked
                                    ? [...currentTags, tag]
                                    : currentTags.filter((t) => t !== tag);
                                  field.onChange(newTags);
                                }}
                              />
                            </FormControl>
                            <label className="text-sm font-normal capitalize cursor-pointer">
                              {tag}
                            </label>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Video File</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onChange(file);
                        }}
                        {...field}
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  {value && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {value.name} ({(value.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Uploading..." : "Add Video"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
