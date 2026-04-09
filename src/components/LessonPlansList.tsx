import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Mail, Clock, CheckCircle2, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface LessonPlansListProps { clientId: string; }

export function LessonPlansList({ clientId }: LessonPlansListProps) {
  const { user } = useAuth();

  const { data: lessonPlans, isLoading, refetch } = useQuery({
    queryKey: ["client-lesson-plans", clientId],
    queryFn: async () => {
      const { data, error } = await supabase.from("client_lessons").select("*").eq("client_id", clientId).eq("coach_id", user?.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!clientId,
  });

  const handleSendEmail = async (lesson: any) => {
    try {
      const clientResult = await supabase.from("clients").select("email, full_name").eq("id", clientId).single();
      if (clientResult.error) throw clientResult.error;
      const { email: clientEmail, full_name: clientName } = clientResult.data;
      if (!clientEmail) { toast.error("Client email not found"); return; }
      const { data: videos } = await supabase.from("client_videos").select("video_url").in("id", lesson.exercises?.flatMap((e: any) => e.video_ids || []) || []);
      const exercisesWithVideos = lesson.exercises?.map((exercise: any) => ({ ...exercise, videoUrls: exercise.video_ids?.map((id: string) => videos?.find((v: any) => v.id === id)?.video_url).filter(Boolean) || [] }));
      const { error } = await supabase.functions.invoke("send-client-email", { body: { clientEmail, clientName, type: "lesson", title: lesson.title, lesson: { objectives: lesson.objectives, exercises: exercisesWithVideos, duration_minutes: lesson.duration_minutes } } });
      if (error) throw error;
      toast.success("Lesson plan sent successfully");
    } catch (error: any) {
      console.error("Error sending lesson:", error);
      toast.error("Failed to send lesson plan");
    }
  };

  const handleMarkComplete = async (id: string) => {
    try {
      const { error } = await supabase.from("client_lessons").update({ status: "completed", completed_date: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
      toast.success("Lesson marked as completed");
      refetch();
    } catch (error: any) { toast.error("Failed to update lesson"); }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (<Card key={i}><CardHeader><Skeleton className="h-6 w-3/4 bg-white/[0.06]" /><Skeleton className="h-4 w-full bg-white/[0.06]" /></CardHeader></Card>))}
      </div>
    );
  }

  if (!lessonPlans || lessonPlans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BookOpen className="h-12 w-12 mb-4 text-white/[0.15]" />
          <p className="text-muted-foreground">No lesson plans for this client yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {lessonPlans.map((lesson) => (
        <Card key={lesson.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>{lesson.title}</CardTitle>
                <CardDescription>{lesson.description || "No description"}</CardDescription>
              </div>
              <Badge variant={lesson.status === "completed" ? "default" : lesson.status === "scheduled" ? "secondary" : "outline"}>{lesson.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lesson.scheduled_date && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-primary/60" />
                  <span>Scheduled: {format(new Date(lesson.scheduled_date), "PPP")}</span>
                </div>
              )}
              {lesson.completed_date && (
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-primary/60" />
                  <span>Completed: {format(new Date(lesson.completed_date), "PPP")}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium font-mono">{lesson.duration_minutes} min</span>
              </div>
              {lesson.objectives && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <p className="text-sm font-medium mb-1">Objectives:</p>
                  <p className="text-sm text-muted-foreground">{lesson.objectives}</p>
                </div>
              )}
              {Array.isArray(lesson.exercises) && lesson.exercises.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <p className="text-sm font-medium mb-2">Exercises ({lesson.exercises.length}):</p>
                  <div className="space-y-3">
                    {lesson.exercises.map((exercise: any, index: number) => (
                      <div key={index} className="bg-white/[0.03] rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{exercise.name}</p>
                          <span className="text-xs text-muted-foreground font-mono">{exercise.duration} min</span>
                        </div>
                        {exercise.description && <p className="text-xs text-muted-foreground">{exercise.description}</p>}
                        {exercise.video_ids && exercise.video_ids.length > 0 && <p className="text-xs text-muted-foreground">📹 {exercise.video_ids.length} video{exercise.video_ids.length > 1 ? 's' : ''}</p>}
                        {exercise.note_ids && exercise.note_ids.length > 0 && <p className="text-xs text-muted-foreground">📝 {exercise.note_ids.length} note{exercise.note_ids.length > 1 ? 's' : ''}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
                <Button size="sm" variant="outline" onClick={() => handleSendEmail(lesson)}><Mail className="h-3 w-3 mr-1" />Send</Button>
                {lesson.status !== "completed" && (
                  <Button size="sm" variant="outline" onClick={() => handleMarkComplete(lesson.id)}><CheckCircle2 className="h-3 w-3 mr-1" />Mark Complete</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
