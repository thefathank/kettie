-- Add Cal.com integration fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN cal_username TEXT,
ADD COLUMN cal_webhook_enabled BOOLEAN DEFAULT false;