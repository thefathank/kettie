-- Create trigger to decrement session balance when a session is completed
CREATE TRIGGER trigger_decrement_session_balance
  AFTER UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_session_balance();