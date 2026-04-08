-- Add session tracking columns to payments table
ALTER TABLE public.payments 
ADD COLUMN sessions_covered integer DEFAULT 0,
ADD COLUMN sessions_remaining integer DEFAULT 0;

-- Add check constraint to ensure sessions_remaining is not negative
ALTER TABLE public.payments 
ADD CONSTRAINT sessions_remaining_non_negative 
CHECK (sessions_remaining >= 0);

-- Add check constraint to ensure sessions_covered is positive
ALTER TABLE public.payments 
ADD CONSTRAINT sessions_covered_positive 
CHECK (sessions_covered > 0);

-- Create function to decrement session balance when session is completed
CREATE OR REPLACE FUNCTION public.decrement_session_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payment_record RECORD;
BEGIN
  -- Only process if status changed to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Find the oldest payment with remaining sessions for this client
    SELECT id, sessions_remaining INTO payment_record
    FROM public.payments
    WHERE client_id = NEW.client_id
      AND coach_id = NEW.coach_id
      AND sessions_remaining > 0
      AND payment_status = 'completed'
    ORDER BY payment_date ASC
    LIMIT 1;

    -- If a payment with remaining sessions exists, decrement it
    IF FOUND THEN
      UPDATE public.payments
      SET sessions_remaining = sessions_remaining - 1
      WHERE id = payment_record.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to automatically decrement sessions when session is completed
DROP TRIGGER IF EXISTS on_session_completed ON public.sessions;
CREATE TRIGGER on_session_completed
  AFTER INSERT OR UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_session_balance();