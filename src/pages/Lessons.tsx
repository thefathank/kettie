import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Copy, Mail, CheckCircle2, Clock, FileText, BookOpen } from "lucide-react";
import { AddLessonTemplateDialog } from "@/components/AddLessonTemplateDialog";
import { AddClientLessonDialog } from "@/components/AddClientLessonDialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function Lessons() {
  const { user } = useAuth();
  const [isAddTemplateDialogOpen, setIsAddTemplateDialogOpen] = useState(false);
  const [isAddLessonDialogOpen, setIsAddLessonDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const { data: templates, isLoading: templatesLoading, refetch: refetchTemplates } = useQuery({
    queryKey: ["lesson-templates", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("lesson_templates").select("*").eq("coach_id", user?.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: lessons, isLoading: lessonsLoading, refetch: refetchLessons } = useQuery({
    queryKey: ["client-lessons", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("client_lessons").select(`*, clients (full_name, email)`).eq("coach_id", user?.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase.from("lesson_templates").delete().eq("id", id);
      if (error) throw error;
      toast.success("Template deleted successfully");
      refetchTemplates();
    } catch (error: any) {
      toast.error("Failed to delete template");
    }
  };

  const handleDuplicateTemplate = async (template: any) => {
    try {
      const { title, description, objectives, exercises, duration_minutes, tags } = template;
      const { error } = await supabase.from("lesson_templates").insert({ coach_id: user?.id, title: `${title} (Copy)`, description, objectives, exercises, duration_minutes, tags });
      if (error) throw error;
      toast.success("Template duplicated successfully");
      refetchTemplates();
    } catch (error: any) {
      toast.error("Failed to duplicate template");
    }
  };

  const handleSendEmail = async (lesson: any) => {
    try {
      const clientEmail = lesson.clients?.email;
      const clientName = lesson.clients?.full_name;
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
      refetchLessons();
    } catch (error: any) {
      toast.error("Failed to update lesson");
    }
  };

  const renderTemplateCard = (template: any) => (
    <Card key={template.id} className="transition-all duration-150 hover:bg-white/[0.06]">
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="line-clamp-1">{template.title}</span>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {template.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium font-mono">{template.duration_minutes} min</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Exercises:</span>
            <span className="font-medium font-mono">{Array.isArray(template.exercises) ? template.exercises.length : 0}</span>
          </div>
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingTemplate(template); setIsAddTemplateDialogOpen(true); }}>
              <Edit className="h-3 w-3 mr-1" />Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleDuplicateTemplate(template)}><Copy className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.id)}><Trash2 className="h-3 w-3" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderLessonCard = (lesson: any) => (
    <Card key={lesson.id} className="transition-all duration-150 hover:bg-white/[0.06]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{lesson.title}</CardTitle>
            <CardDescription className="mt-1">{lesson.clients?.full_name}</CardDescription>
          </div>
          <Badge
            variant={lesson.status === "completed" ? "default" : lesson.status === "scheduled" ? "secondary" : "outline"}
          >
            {lesson.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lesson.scheduled_date && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-primary/60" />
              <span>{format(new Date(lesson.scheduled_date), "PPP")}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium font-mono">{lesson.duration_minutes} min</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Exercises:</span>
            <span className="font-medium font-mono">{Array.isArray(lesson.exercises) ? lesson.exercises.length : 0}</span>
          </div>
          <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
            <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingLesson(lesson); setIsAddLessonDialogOpen(true); }}>
              <FileText className="h-3 w-3 mr-1" />Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleSendEmail(lesson)}><Mail className="h-3 w-3" /></Button>
            {lesson.status !== "completed" && (
              <Button size="sm" variant="outline" onClick={() => handleMarkComplete(lesson.id)}><CheckCircle2 className="h-3 w-3" /></Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const draftLessons = lessons?.filter((l) => l.status === "draft") || [];
  const scheduledLessons = lessons?.filter((l) => l.status === "scheduled") || [];
  const completedLessons = lessons?.filter((l) => l.status === "completed") || [];

  const renderEmptyState = (msg: string) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <BookOpen className="h-12 w-12 mb-4 text-white/[0.15]" />
        <p className="text-muted-foreground">{msg}</p>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Lessons</h1>
          <p className="text-muted-foreground mt-1">Create reusable templates and manage lesson plans for your clients</p>
        </div>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="plans">Lesson Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Create reusable lesson templates</p>
              <Button onClick={() => setIsAddTemplateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />New Template
              </Button>
            </div>
            {templatesLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (<Card key={i}><CardHeader><div className="h-6 bg-white/[0.06] rounded w-3/4 animate-pulse" /><div className="h-4 bg-white/[0.06] rounded w-full mt-2 animate-pulse" /></CardHeader></Card>))}
              </div>
            ) : templates && templates.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{templates.map(renderTemplateCard)}</div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="h-12 w-12 mb-4 text-white/[0.15]" />
                  <p className="text-muted-foreground mb-4">No lesson templates yet</p>
                  <Button onClick={() => setIsAddTemplateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />Create Your First Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="plans" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Manage lesson plans for your clients</p>
              <Button onClick={() => setIsAddLessonDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />New Lesson Plan
              </Button>
            </div>
            <Tabs defaultValue="scheduled" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scheduled">Scheduled ({scheduledLessons.length})</TabsTrigger>
                <TabsTrigger value="draft">Draft ({draftLessons.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedLessons.length})</TabsTrigger>
              </TabsList>
              {["scheduled", "draft", "completed"].map((status) => {
                const list = status === "scheduled" ? scheduledLessons : status === "draft" ? draftLessons : completedLessons;
                return (
                  <TabsContent key={status} value={status} className="mt-6">
                    {lessonsLoading ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (<Card key={i}><CardHeader><div className="h-6 bg-white/[0.06] rounded w-3/4 animate-pulse" /></CardHeader></Card>))}
                      </div>
                    ) : list.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{list.map(renderLessonCard)}</div>
                    ) : renderEmptyState(`No ${status} lessons`)}
                  </TabsContent>
                );
              })}
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      <AddLessonTemplateDialog open={isAddTemplateDialogOpen} onOpenChange={(open) => { setIsAddTemplateDialogOpen(open); if (!open) setEditingTemplate(null); }} template={editingTemplate} onSuccess={() => { refetchTemplates(); setEditingTemplate(null); }} />
      <AddClientLessonDialog open={isAddLessonDialogOpen} onOpenChange={(open) => { setIsAddLessonDialogOpen(open); if (!open) setEditingLesson(null); }} lesson={editingLesson} onSuccess={() => { refetchLessons(); setEditingLesson(null); }} />
    </Layout>
  );
}
