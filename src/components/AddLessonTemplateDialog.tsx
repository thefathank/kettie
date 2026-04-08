import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { UpgradeDialog } from "@/components/UpgradeDialog";

interface Exercise {
  name: string;
  description: string;
  duration: number;
}

interface LessonTemplateFormData {
  title: string;
  description: string;
  objectives: string;
  duration_minutes: number;
  tags: string;
}

export function AddLessonTemplateDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: any;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", description: "", duration: 10 },
  ]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { canAddTemplate, templateCount, refreshCounts } = useSubscription();
  const { register, handleSubmit, reset, setValue } = useForm<LessonTemplateFormData>();

  useEffect(() => {
    if (template) {
      setValue("title", template.title);
      setValue("description", template.description || "");
      setValue("objectives", template.objectives || "");
      setValue("duration_minutes", template.duration_minutes || 60);
      setValue("tags", template.tags?.join(", ") || "");
      setExercises((template.exercises as any) || [{ name: "", description: "", duration: 10 }]);
    } else {
      reset();
      setExercises([{ name: "", description: "", duration: 10 }]);
    }
  }, [template, setValue, reset]);

  // Check limits when opening for new template
  useEffect(() => {
    if (open && !template && !canAddTemplate) {
      onOpenChange(false);
      setUpgradeOpen(true);
    }
  }, [open, template, canAddTemplate, onOpenChange]);

  const onSubmit = async (data: LessonTemplateFormData) => {
    try {
      const tags = data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const validExercises = exercises.filter((e) => e.name.trim());

      const payload = {
        coach_id: user?.id,
        title: data.title,
        description: data.description,
        objectives: data.objectives,
        exercises: validExercises as any,
        duration_minutes: data.duration_minutes,
        tags,
      };

      if (template) {
        const { error } = await supabase
          .from("lesson_templates")
          .update(payload)
          .eq("id", template.id);
        if (error) throw error;
        toast.success("Template updated successfully");
      } else {
        const { error } = await supabase.from("lesson_templates").insert(payload);
        if (error) throw error;
        toast.success("Template created successfully");
        refreshCounts();
      }

      onSuccess();
      onOpenChange(false);
      reset();
      setExercises([{ name: "", description: "", duration: 10 }]);
    } catch (error: any) {
      toast.error(template ? "Failed to update template" : "Failed to create template");
    }
  };

  const addExercise = () => {
    setExercises([...exercises, { name: "", description: "", duration: 10 }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{template ? "Edit" : "Create"} Lesson Template</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" {...register("title", { required: true })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Learning Objectives</Label>
                <Textarea
                  id="objectives"
                  {...register("objectives")}
                  placeholder="What will the player learn or improve?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Total Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  {...register("duration_minutes", { required: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  {...register("tags")}
                  placeholder="serve, backhand, footwork"
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
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {template ? "Update" : "Create"} Template
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
        feature="template"
        currentCount={templateCount}
        limit={1}
      />
    </>
  );
}
