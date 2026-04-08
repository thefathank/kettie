-- Add foreign key relationships to client_lessons table
ALTER TABLE public.client_lessons
ADD CONSTRAINT client_lessons_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES public.clients(id) 
ON DELETE CASCADE;

ALTER TABLE public.client_lessons
ADD CONSTRAINT client_lessons_coach_id_fkey 
FOREIGN KEY (coach_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.client_lessons
ADD CONSTRAINT client_lessons_template_id_fkey 
FOREIGN KEY (template_id) 
REFERENCES public.lesson_templates(id) 
ON DELETE SET NULL;

ALTER TABLE public.client_lessons
ADD CONSTRAINT client_lessons_session_id_fkey 
FOREIGN KEY (session_id) 
REFERENCES public.sessions(id) 
ON DELETE SET NULL;