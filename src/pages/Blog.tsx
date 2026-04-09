import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformAdmin } from "@/hooks/usePlatformAdmin";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { AddBlogPostDialog } from "@/components/AddBlogPostDialog";
import { Helmet } from "react-helmet-async";
import { Logo } from "@/components/Logo";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
}

const Blog = () => {
  const { isAdmin } = usePlatformAdmin();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, published_at, created_at")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  return (
    <>
      <Helmet>
        <title>Tennis Coaching Blog | Pro Pointers Plus</title>
        <meta name="description" content="Expert tennis coaching tips, drills, and strategies to improve your game. Learn from professional coaches and take your tennis to the next level." />
        <meta name="keywords" content="tennis coaching, tennis tips, tennis drills, tennis training, improve tennis game" />
        <link rel="canonical" href="https://propointersplus.com/blog" />
      </Helmet>
      
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-white/[0.06] bg-black/60 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/landing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-150">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <Link to="/landing" className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-xl font-bold font-heading text-foreground">Pro Pointers Plus</span>
            </Link>
            <div className="w-16" />
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-4xl md:text-5xl font-black font-heading text-foreground mb-2 tracking-[-0.02em]">Blog</h1>
                <p className="text-muted-foreground">Tips, strategies, and insights for tennis coaches</p>
              </div>
              {isAdmin && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="glass rounded-2xl p-6">
                    <Skeleton className="h-6 w-3/4 bg-white/[0.06]" />
                    <Skeleton className="h-4 w-1/4 mt-3 bg-white/[0.06]" />
                    <Skeleton className="h-4 w-full mt-4 bg-white/[0.06]" />
                    <Skeleton className="h-4 w-2/3 mt-2 bg-white/[0.06]" />
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <div className="glass rounded-2xl p-6 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(16,185,129,0.06)] hover:border-primary/20 transition-all duration-150 h-full">
                      <h2 className="text-lg font-bold font-heading text-foreground mb-2">{post.title}</h2>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(post.published_at || post.created_at), "MMMM d, yyyy")}
                      </div>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="glass rounded-2xl p-12 text-center">
                <p className="text-muted-foreground">No articles published yet. Check back soon!</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      <AddBlogPostDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          refetch();
          setShowAddDialog(false);
        }}
      />
    </>
  );
};

export default Blog;
