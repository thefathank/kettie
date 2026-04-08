import { DemoLayout } from "@/components/DemoLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Copy, Mail, CheckCircle2, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock templates
const mockTemplates = [
  {
    id: "1",
    title: "Beginner Forehand Fundamentals",
    description: "Introduction to proper forehand technique and grip",
    duration_minutes: 60,
    exercises: [
      { name: "Grip positioning", duration: 10 },
      { name: "Shadow swings", duration: 15 },
      { name: "Ball feeds", duration: 20 },
    ],
    tags: ["forehand", "beginner"],
  },
  {
    id: "2",
    title: "Serve Power Development",
    description: "Building a powerful and consistent serve",
    duration_minutes: 75,
    exercises: [
      { name: "Toss practice", duration: 10 },
      { name: "Service motion", duration: 20 },
      { name: "Target practice", duration: 25 },
    ],
    tags: ["serve", "intermediate"],
  },
  {
    id: "3",
    title: "Net Game Mastery",
    description: "Volleys, overheads, and net positioning",
    duration_minutes: 60,
    exercises: [
      { name: "Volley drills", duration: 20 },
      { name: "Overhead practice", duration: 15 },
      { name: "Point play", duration: 20 },
    ],
    tags: ["volley", "overhead", "advanced"],
  },
];

// Mock lesson plans
const mockScheduledLessons = [
  {
    id: "1",
    title: "Forehand Session",
    clientName: "Sarah Johnson",
    status: "scheduled",
    scheduled_date: "2024-12-05",
    duration_minutes: 60,
    exercises: [{ name: "Grip work" }, { name: "Rally practice" }],
  },
  {
    id: "2",
    title: "Serve Development",
    clientName: "Mike Chen",
    status: "scheduled",
    scheduled_date: "2024-12-06",
    duration_minutes: 75,
    exercises: [{ name: "Toss practice" }, { name: "Target serves" }],
  },
];

const mockDraftLessons = [
  {
    id: "3",
    title: "Backhand Improvement",
    clientName: "Emily Davis",
    status: "draft",
    duration_minutes: 60,
    exercises: [{ name: "Two-handed technique" }],
  },
];

const mockCompletedLessons = [
  {
    id: "4",
    title: "Match Strategy",
    clientName: "John Smith",
    status: "completed",
    scheduled_date: "2024-11-28",
    duration_minutes: 90,
    exercises: [{ name: "Point patterns" }, { name: "Match play" }],
  },
  {
    id: "5",
    title: "Footwork Drills",
    clientName: "Lisa Wang",
    status: "completed",
    scheduled_date: "2024-11-25",
    duration_minutes: 60,
    exercises: [{ name: "Ladder drills" }, { name: "Court coverage" }],
  },
];

const DemoLessons = () => {
  const renderTemplateCard = (template: typeof mockTemplates[0]) => (
    <Card key={template.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="line-clamp-1">{template.title}</span>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{template.duration_minutes} min</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Exercises:</span>
            <span className="font-medium">{template.exercises.length}</span>
          </div>
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="outline">
              <Copy className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderLessonCard = (lesson: { id: string; title: string; clientName: string; status: string; scheduled_date?: string; duration_minutes: number; exercises: { name: string }[] }) => (
    <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{lesson.title}</CardTitle>
            <CardDescription className="mt-1">{lesson.clientName}</CardDescription>
          </div>
          <Badge
            variant={
              lesson.status === "completed"
                ? "default"
                : lesson.status === "scheduled"
                ? "secondary"
                : "outline"
            }
          >
            {lesson.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lesson.scheduled_date && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{lesson.scheduled_date}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{lesson.duration_minutes} min</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Exercises:</span>
            <span className="font-medium">{lesson.exercises.length}</span>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              <FileText className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="outline">
              <Mail className="h-3 w-3" />
            </Button>
            {lesson.status !== "completed" && (
              <Button size="sm" variant="outline">
                <CheckCircle2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DemoLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Lessons</h1>
          <p className="text-muted-foreground mt-1">
            Create reusable templates and manage lesson plans for your clients
          </p>
        </div>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="plans">Lesson Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Create reusable lesson templates
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockTemplates.map(renderTemplateCard)}
            </div>
          </TabsContent>

          <TabsContent value="plans" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Manage lesson plans for your clients
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Lesson Plan
              </Button>
            </div>

            <Tabs defaultValue="scheduled" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="scheduled">
                  Scheduled ({mockScheduledLessons.length})
                </TabsTrigger>
                <TabsTrigger value="draft">Draft ({mockDraftLessons.length})</TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({mockCompletedLessons.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scheduled" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockScheduledLessons.map(renderLessonCard)}
                </div>
              </TabsContent>

              <TabsContent value="draft" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockDraftLessons.map(renderLessonCard)}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockCompletedLessons.map(renderLessonCard)}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </DemoLayout>
  );
};

export default DemoLessons;
