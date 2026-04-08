-- Create lesson_templates table for reusable lesson templates
CREATE TABLE public.lesson_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  objectives TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER DEFAULT 60,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_lessons table for assigned lessons
CREATE TABLE public.client_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  client_id UUID NOT NULL,
  session_id UUID,
  template_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  objectives TEXT,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_lessons ENABLE ROW LEVEL SECURITY;

-- RLS policies for lesson_templates
CREATE POLICY "Coaches can view their own lesson templates"
  ON public.lesson_templates FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can create lesson templates"
  ON public.lesson_templates FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own lesson templates"
  ON public.lesson_templates FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own lesson templates"
  ON public.lesson_templates FOR DELETE
  USING (auth.uid() = coach_id);

-- RLS policies for client_lessons
CREATE POLICY "Coaches can view their own client lessons"
  ON public.client_lessons FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can create client lessons"
  ON public.client_lessons FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own client lessons"
  ON public.client_lessons FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own client lessons"
  ON public.client_lessons FOR DELETE
  USING (auth.uid() = coach_id);

-- Add triggers for updated_at
CREATE TRIGGER update_lesson_templates_updated_at
  BEFORE UPDATE ON public.lesson_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_lessons_updated_at
  BEFORE UPDATE ON public.client_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();