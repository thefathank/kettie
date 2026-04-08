-- Create role enum for academy roles
CREATE TYPE public.academy_role AS ENUM ('admin', 'coach');

-- Create academies table
CREATE TABLE public.academies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'inactive'
);

-- Create user_roles table (per security best practices)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  role academy_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, academy_id)
);

-- Create academy invitations table
CREATE TABLE public.academy_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id UUID NOT NULL REFERENCES public.academies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE (academy_id, email)
);

-- Add academy_id to existing tables (nullable to preserve existing data)
ALTER TABLE public.clients ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE SET NULL;
ALTER TABLE public.sessions ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE SET NULL;
ALTER TABLE public.lesson_templates ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE SET NULL;
ALTER TABLE public.client_lessons ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE SET NULL;
ALTER TABLE public.instruction_videos ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE SET NULL;
ALTER TABLE public.progress_notes ADD COLUMN academy_id UUID REFERENCES public.academies(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_invitations ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user is academy member
CREATE OR REPLACE FUNCTION public.is_academy_member(_user_id UUID, _academy_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND academy_id = _academy_id
  )
$$;

-- Security definer function to check if user is academy admin
CREATE OR REPLACE FUNCTION public.is_academy_admin(_user_id UUID, _academy_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND academy_id = _academy_id AND role = 'admin'
  )
$$;

-- Security definer function to get user's academy_id
CREATE OR REPLACE FUNCTION public.get_user_academy_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT academy_id FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for academies table
CREATE POLICY "Academy members can view their academy"
ON public.academies FOR SELECT
USING (public.is_academy_member(auth.uid(), id));

CREATE POLICY "Admins can update their academy"
ON public.academies FOR UPDATE
USING (public.is_academy_admin(auth.uid(), id));

CREATE POLICY "Users can create academies"
ON public.academies FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for user_roles table
CREATE POLICY "Academy members can view roles in their academy"
ON public.user_roles FOR SELECT
USING (public.is_academy_member(auth.uid(), academy_id));

CREATE POLICY "Admins can manage roles in their academy"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_academy_admin(auth.uid(), academy_id));

CREATE POLICY "Admins can delete roles in their academy"
ON public.user_roles FOR DELETE
USING (public.is_academy_admin(auth.uid(), academy_id) AND user_id != auth.uid());

-- RLS Policies for academy_invitations table
CREATE POLICY "Admins can view invitations for their academy"
ON public.academy_invitations FOR SELECT
USING (public.is_academy_admin(auth.uid(), academy_id));

CREATE POLICY "Admins can create invitations"
ON public.academy_invitations FOR INSERT
WITH CHECK (public.is_academy_admin(auth.uid(), academy_id));

CREATE POLICY "Admins can delete invitations"
ON public.academy_invitations FOR DELETE
USING (public.is_academy_admin(auth.uid(), academy_id));

CREATE POLICY "Invited users can view their invitations"
ON public.academy_invitations FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Update existing table policies to support academy-scoped access
-- Clients: coach sees own clients + academy members see academy clients
DROP POLICY IF EXISTS "Coaches can view their own clients" ON public.clients;
CREATE POLICY "Users can view own or academy clients"
ON public.clients FOR SELECT
USING (
  auth.uid() = coach_id 
  OR (academy_id IS NOT NULL AND public.is_academy_member(auth.uid(), academy_id))
);

DROP POLICY IF EXISTS "Coaches can update their own clients" ON public.clients;
CREATE POLICY "Users can update own clients"
ON public.clients FOR UPDATE
USING (auth.uid() = coach_id);

-- Sessions: coach sees own + academy members see academy sessions
DROP POLICY IF EXISTS "Coaches can view their own sessions" ON public.sessions;
CREATE POLICY "Users can view own or academy sessions"
ON public.sessions FOR SELECT
USING (
  auth.uid() = coach_id 
  OR (academy_id IS NOT NULL AND public.is_academy_member(auth.uid(), academy_id))
);

DROP POLICY IF EXISTS "Coaches can update their own sessions" ON public.sessions;
CREATE POLICY "Users can update own sessions"
ON public.sessions FOR UPDATE
USING (auth.uid() = coach_id);

-- Payments: coach sees own + admin sees academy payments
DROP POLICY IF EXISTS "Coaches can view their own payments" ON public.payments;
CREATE POLICY "Users can view own or academy payments"
ON public.payments FOR SELECT
USING (
  auth.uid() = coach_id 
  OR (academy_id IS NOT NULL AND public.is_academy_admin(auth.uid(), academy_id))
);

DROP POLICY IF EXISTS "Coaches can update their own payments" ON public.payments;
CREATE POLICY "Users can update own payments"
ON public.payments FOR UPDATE
USING (auth.uid() = coach_id);

-- Lesson templates: coach sees own + academy members see academy templates
DROP POLICY IF EXISTS "Coaches can view their own lesson templates" ON public.lesson_templates;
CREATE POLICY "Users can view own or academy templates"
ON public.lesson_templates FOR SELECT
USING (
  auth.uid() = coach_id 
  OR (academy_id IS NOT NULL AND public.is_academy_member(auth.uid(), academy_id))
);

DROP POLICY IF EXISTS "Coaches can update their own lesson templates" ON public.lesson_templates;
CREATE POLICY "Users can update own templates"
ON public.lesson_templates FOR UPDATE
USING (auth.uid() = coach_id);

-- Client lessons: coach sees own + academy members see academy lessons
DROP POLICY IF EXISTS "Coaches can view their own client lessons" ON public.client_lessons;
CREATE POLICY "Users can view own or academy lessons"
ON public.client_lessons FOR SELECT
USING (
  auth.uid() = coach_id 
  OR (academy_id IS NOT NULL AND public.is_academy_member(auth.uid(), academy_id))
);

DROP POLICY IF EXISTS "Coaches can update their own client lessons" ON public.client_lessons;
CREATE POLICY "Users can update own lessons"
ON public.client_lessons FOR UPDATE
USING (auth.uid() = coach_id);

-- Instruction videos: coach sees own + academy members see academy videos
DROP POLICY IF EXISTS "Coaches can view their own instruction videos" ON public.instruction_videos;
CREATE POLICY "Users can view own or academy videos"
ON public.instruction_videos FOR SELECT
USING (
  auth.uid() = coach_id 
  OR (academy_id IS NOT NULL AND public.is_academy_member(auth.uid(), academy_id))
);

DROP POLICY IF EXISTS "Coaches can update their own instruction videos" ON public.instruction_videos;
CREATE POLICY "Users can update own videos"
ON public.instruction_videos FOR UPDATE
USING (auth.uid() = coach_id);

-- Progress notes: coach sees own + academy members see academy notes
DROP POLICY IF EXISTS "Coaches can view their own progress notes" ON public.progress_notes;
CREATE POLICY "Users can view own or academy notes"
ON public.progress_notes FOR SELECT
USING (
  auth.uid() = coach_id 
  OR (academy_id IS NOT NULL AND public.is_academy_member(auth.uid(), academy_id))
);

DROP POLICY IF EXISTS "Coaches can update their own progress notes" ON public.progress_notes;
CREATE POLICY "Users can update own notes"
ON public.progress_notes FOR UPDATE
USING (auth.uid() = coach_id);

-- Add triggers for updated_at
CREATE TRIGGER update_academies_updated_at
BEFORE UPDATE ON public.academies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();