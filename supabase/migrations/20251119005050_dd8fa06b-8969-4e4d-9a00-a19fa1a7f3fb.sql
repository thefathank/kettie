-- Create instruction_videos table for coach's video library
CREATE TABLE public.instruction_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  file_size BIGINT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.instruction_videos ENABLE ROW LEVEL SECURITY;

-- Create policies for instruction videos
CREATE POLICY "Coaches can view their own instruction videos"
  ON public.instruction_videos
  FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can create instruction videos"
  ON public.instruction_videos
  FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own instruction videos"
  ON public.instruction_videos
  FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own instruction videos"
  ON public.instruction_videos
  FOR DELETE
  USING (auth.uid() = coach_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_instruction_videos_updated_at
  BEFORE UPDATE ON public.instruction_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for instruction videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('instruction-videos', 'instruction-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for instruction videos
CREATE POLICY "Coaches can view their own instruction videos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'instruction-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Coaches can upload instruction videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'instruction-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Coaches can update their own instruction videos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'instruction-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Coaches can delete their own instruction videos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'instruction-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );