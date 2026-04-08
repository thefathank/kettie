import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { UpgradeDialog } from "@/components/UpgradeDialog";

interface Exercise {
  name: string;
  description: string;
  duration: number;
  video_ids: string[];
  note_ids: string[];
}

interface ClientLessonFormData {
  client_id: string;
  title: string;
  description: string;
  objectives: string;
  duration_minutes: number;
  status: string;
  scheduled_date: string;
  template_id?: string;
}

export function AddClientLessonDialog({
  open,
  onOpenChange,
  lesson,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: any;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", description: "", duration: 10, video_ids: [], note_ids: [] },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { canAddLessonPlan, lessonPlanCount, refreshCounts } = useSubscription();
  const { register, handleSubmit, reset, setValue, watch } = useForm<ClientLessonFormData>();

  const clientId = watch("client_id");

  const { data: clients } = useQuery({
    queryKey: ["clients", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, full_name")
        .eq("coach_id", user?.id)
        .order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && open,
  });

  const { data: templates } = useQuery({
    queryKey: ["lesson-templates", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_templates")
        .select("*")
        .eq("coach_id", user?.id)
        .order("title");
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && open,
  });

  const { data: videos } = useQuery({
    queryKey: ["client-videos", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_videos")
        .select("id, title")
        .eq("client_id", clientId)
        .order("title");
      if (error) throw error;
      return data;
    },
    enabled: !!clientId && open,
  });

  const { data: notes } = useQuery({
    queryKey: ["progress-notes", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("progress_notes")
        .select("id, title")
        .eq("client_id", clientId)
        .order("note_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!clientId && open,
  });

  useEffect(() => {
    if (lesson) {
      setValue("client_id", lesson.client_id);
      setValue("title", lesson.title);
      setValue("description", lesson.description || "");
      setValue("objectives", lesson.objectives || "");
      setValue("duration_minutes", lesson.duration_minutes || 60);
      setValue("status", lesson.status);
      setValue("scheduled_date", lesson.scheduled_date?.split("T")[0] || "");
      setExercises((lesson.exercises as any) || [{ name: "", description: "", duration: 10, video_ids: [], note_ids: [] }]);
    } else {
      reset();
      setExercises([{ name: "", description: "", duration: 10, video_ids: [], note_ids: [] }]);
      setSelectedTemplate("");
    }
  }, [lesson, setValue, reset]);

  // Check limits when opening for new lesson plan
  useEffect(() => {
    if (open && !lesson && !canAddLessonPlan) {
      onOpenChange(false);
      setUpgradeOpen(true);
    }
  }, [open, lesson, canAddLessonPlan, onOpenChange]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates?.find((t) => t.id === templateId);
    if (template) {
      setValue("title", template.title);
      setValue("description", template.description);
      setValue("objectives", template.objectives);
      setValue("duration_minutes", template.duration_minutes);
      setValue("template_id", templateId);
      setExercises((template.exercises as any) || [{ name: "", description: "", duration: 10, video_ids: [], note_ids: [] }]);
    }
  };

  const onSubmit = async (data: ClientLessonFormData) => {
    try {
      const validExercises = exercises.filter((e) => e.name.trim());

      const payload = {
        coach_id: user?.id,
        client_id: data.client_id,
        title: data.title,
        description: data.description,
        objectives: data.objectives,
        exercises: validExercises as any,
        duration_minutes: data.duration_minutes,
        status: data.scheduled_date ? "scheduled" : data.status,
        scheduled_date: data.scheduled_date || null,
        template_id: data.template_id || null,
      };

      if (lesson) {
        const { error } = await supabase
          .from("client_lessons")
          .update(payload)
          .eq("id", lesson.id);
        if (error) throw error;
        toast.success("Lesson updated successfully");
      } else {
        const { error } = await supabase.from("client_lessons").insert(payload);
        if (error) throw error;
        toast.success("Lesson created successfully");
        refreshCounts();
      }

      onSuccess();
      onOpenChange(false);
      reset();
      setExercises([{ name: "", description: "", duration: 10, video_ids: [], note_ids: [] }]);
      setSelectedTemplate("");
    } catch (error: any) {
      toast.error(lesson ? "Failed to update lesson" : "Failed to create lesson");
    }
  };

  const addExercise = () => {
    setExercises([...exercises, { name: "", description: "", duration: 10, video_ids: [], note_ids: [] }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const toggleVideo = (exerciseIndex: number, videoId: string) => {
    const updated = [...exercises];
    const videoIds = updated[exerciseIndex].video_ids || [];
    if (videoIds.includes(videoId)) {
      updated[exerciseIndex].video_ids = videoIds.filter((id) => id !== videoId);
    } else {
      updated[exerciseIndex].video_ids = [...videoIds, videoId];
    }
    setExercises(updated);
  };

  const toggleNote = (exerciseIndex: number, noteId: string) => {
    const updated = [...exercises];
    const noteIds = updated[exerciseIndex].note_ids || [];
    if (noteIds.includes(noteId)) {
      updated[exerciseIndex].note_ids = noteIds.filter((id) => id !== noteId);
    } else {
      updated[exerciseIndex].note_ids = [...noteIds, noteId];
    }
    setExercises(updated);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{lesson ? "Edit" : "Create"} Lesson Plan</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!lesson && templates && templates.length > 0 && (
                <div className="space-y-2">
                  <Label>Use Template (Optional)</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="client_id">Client *</Label>
                <Select
                  value={watch("client_id")}
                  onValueChange={(value) => setValue("client_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register("title", { required: true })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={watch("status") || "draft"}
                    onValueChange={(value) => setValue("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Scheduled Date</Label>
                  <Input id="scheduled_date" type="date" {...register("scheduled_date")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Learning Objectives</Label>
                <Textarea
                  id="objectives"
                  {...register("objectives")}
                  placeholder="What will the player work on?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  {...register("duration_minutes", { required: true })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Exercises/Drills</Label>
                  <Button type="button" size="sm" onClick={addExercise}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Exercise
                  </Button>
                </div>

                {exercises.map((exercise, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Exercise {index + 1}</Label>
                      {exercises.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeExercise(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Exercise name"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, "name", e.target.value)}
                    />
                    <Textarea
                      placeholder="Description"
                      value={exercise.description}
                      onChange={(e) => updateExercise(index, "description", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={exercise.duration}
                      onChange={(e) =>
                        updateExercise(index, "duration", parseInt(e.target.value) || 0)
                      }
                    />
                    
                    {videos && videos.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">Attach Videos</Label>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {videos.map((video) => (
                            <div key={video.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`video-${index}-${video.id}`}
                                checked={exercise.video_ids?.includes(video.id)}
                                onCheckedChange={() => toggleVideo(index, video.id)}
                              />
                              <label
                                htmlFor={`video-${index}-${video.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {video.title}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {notes && notes.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">Attach Notes</Label>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {notes.map((note) => (
                            <div key={note.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`note-${index}-${note.id}`}
                                checked={exercise.note_ids?.includes(note.id)}
                                onCheckedChange={() => toggleNote(index, note.id)}
                              />
                              <label
                                htmlFor={`note-${index}-${note.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {note.title}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {lesson ? "Update" : "Create"} Lesson Plan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UpgradeDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        feature="lesson plan"
        currentCount={lessonPlanCount}
        limit={1}
      />
    </>
  );
}
