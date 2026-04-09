import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Video } from "lucide-react";
import { AddInstructionVideoDialog } from "@/components/AddInstructionVideoDialog";
import { InstructionVideoCard } from "@/components/InstructionVideoCard";
import { Badge } from "@/components/ui/badge";

const AVAILABLE_TAGS = ["serve", "backhand", "forehand", "overhead", "volley", "footwork", "strategy"];

export default function InstructionVideos() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: videos, isLoading } = useQuery({
    queryKey: ["instruction-videos", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from("instruction_videos").select("*").eq("coach_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const toggleTag = (tag: string) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const filteredVideos = videos?.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || video.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => video.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight">Instruction Videos</h1>
            <p className="text-muted-foreground">Your library of instructional content</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />Add Video
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search videos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map(tag => (
            <Badge key={tag} variant={selectedTags.includes(tag) ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => toggleTag(tag)}>{tag}</Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])} className="h-6 px-2 text-xs">Clear filters</Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                <div className="aspect-video bg-white/[0.06] rounded-xl mb-4" />
                <div className="h-4 bg-white/[0.06] rounded mb-2" />
                <div className="h-3 bg-white/[0.06] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredVideos && filteredVideos.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map(video => (<InstructionVideoCard key={video.id} video={video} />))}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-2xl">
            <Video className="h-12 w-12 mx-auto mb-4 text-white/[0.15]" />
            <h3 className="text-lg font-semibold font-heading mb-2">
              {searchQuery || selectedTags.length > 0 ? "No videos found" : "No instruction videos yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedTags.length > 0 ? "Try adjusting your search or filters" : "Start building your library of instructional content"}
            </p>
            {!searchQuery && selectedTags.length === 0 && (
              <Button onClick={() => setIsAddDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Your First Video</Button>
            )}
          </div>
        )}
      </div>
      <AddInstructionVideoDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </Layout>
  );
}
