-- Create storage bucket for client videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-videos',
  'client-videos',
  false,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
);

-- Create storage policies for client videos
CREATE POLICY "Coaches can upload videos for their clients"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'client-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Coaches can view their client videos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'client-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Coaches can delete their client videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'client-videos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table for video metadata
CREATE TABLE public.client_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  client_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  file_size BIGINT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for client_videos
CREATE POLICY "Coaches can view their client videos"
ON public.client_videos
FOR SELECT
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can create videos for their clients"
ON public.client_videos
FOR INSERT
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their client videos"
ON public.client_videos
FOR UPDATE
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their client videos"
ON public.client_videos
FOR DELETE
USING (auth.uid() = coach_id);

-- Add trigger for updated_at
CREATE TRIGGER update_client_videos_updated_at
BEFORE UPDATE ON public.client_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();