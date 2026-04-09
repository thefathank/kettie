import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { FileText, Pencil, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { EditNoteDialog } from "./EditNoteDialog";

interface NotesListProps { clientId: string; }

export function NotesList({ clientId }: NotesListProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingNote, setEditingNote] = useState<any>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const { data: notes, isLoading } = useQuery({
    queryKey: ["progress-notes", clientId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from("progress_notes").select("*").eq("client_id", clientId).eq("coach_id", user.id).order("note_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleDelete = async (noteId: string) => {
    try {
      const { error } = await supabase.from("progress_notes").delete().eq("id", noteId).eq("coach_id", user?.id);
      if (error) throw error;
      toast.success("Note deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["progress-notes", clientId] });
      setDeletingNoteId(null);
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note. Please try again.");
    }
  };

  const handleSendEmail = async (note: any, clientEmail: string, clientName: string) => {
    try {
      const { error } = await supabase.functions.invoke("send-client-email", { body: { clientEmail, clientName, type: "note", title: note.title, content: note.content, date: format(new Date(note.note_date), "MMM d, yyyy") } });
      if (error) throw error;
      toast.success("Note sent to client successfully");
    } catch (error: any) {
      console.error("Error sending note:", error);
      toast.error("Failed to send note");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (<Card key={i}><CardContent className="pt-6"><Skeleton className="h-32 w-full bg-white/[0.06]" /></CardContent></Card>))}
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-16">
          <FileText className="h-12 w-12 mx-auto mb-4 text-white/[0.15]" />
          <p className="text-muted-foreground">No progress notes yet. Add your first note to start tracking progress!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <span className="text-sm text-muted-foreground">{format(new Date(note.note_date), "MMM d, yyyy")}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={async () => {
                    const { data: client } = await supabase.from("clients").select("email, full_name").eq("id", clientId).single();
                    if (client?.email) handleSendEmail(note, client.email, client.full_name);
                    else toast.error("Client email not found");
                  }}><Mail className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditingNote(note)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingNoteId(note.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap text-foreground/85">{note.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingNote && <EditNoteDialog note={editingNote} clientId={clientId} open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)} />}

      <AlertDialog open={!!deletingNoteId} onOpenChange={(open) => !open && setDeletingNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this note? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingNoteId && handleDelete(deletingNoteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
