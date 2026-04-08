-- Create platform_admins table for site-wide admin privileges
CREATE TABLE public.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view this table
CREATE POLICY "Platform admins can view admins list"
ON public.platform_admins
FOR SELECT
USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- Create security definer function to check platform admin status
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = _user_id
  )
$$;

-- Drop existing blog_posts policies that need updating
DROP POLICY IF EXISTS "Authenticated users can create blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON public.blog_posts;

-- Create new policies that check for platform admin status
CREATE POLICY "Platform admins can create blog posts"
ON public.blog_posts
FOR INSERT
WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update blog posts"
ON public.blog_posts
FOR UPDATE
USING (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can delete blog posts"
ON public.blog_posts
FOR DELETE
USING (is_platform_admin(auth.uid()));