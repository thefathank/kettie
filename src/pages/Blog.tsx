import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformAdmin } from "@/hooks/usePlatformAdmin";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { AddBlogPostDialog } from "@/components/AddBlogPostDialog";
import { Helmet } from "react-helmet-async";

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
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/landing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <Link to="/landing" className="text-xl font-bold text-foreground">
              Pro Pointers Plus
            </Link>
            <div className="w-24" />
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Tennis Coaching Blog</h1>
                <p className="text-muted-foreground">Tips, strategies, and insights for tennis coaches and players</p>
              </div>
              {isAdmin && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/4 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3 mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(post.published_at || post.created_at), "MMMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      {post.excerpt && (
                        <CardContent>
                          <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No articles published yet. Check back soon!</p>
                </CardContent>
              </Card>
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
