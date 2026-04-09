import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { Logo } from "@/components/Logo";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  published_at: string | null;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });

  const headerBar = (
    <header className="border-b border-white/[0.06] bg-black/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-150">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blog</span>
        </Link>
        <Link to="/landing" className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-xl font-bold font-heading text-foreground">Pro Pointers Plus</span>
        </Link>
        <div className="w-24" />
      </div>
    </header>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {headerBar}
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto glass rounded-2xl p-8 md:p-12">
            <Skeleton className="h-10 w-3/4 mb-4 bg-white/[0.06]" />
            <Skeleton className="h-4 w-1/4 mb-8 bg-white/[0.06]" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full bg-white/[0.06]" />
              <Skeleton className="h-4 w-full bg-white/[0.06]" />
              <Skeleton className="h-4 w-2/3 bg-white/[0.06]" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {headerBar}
        <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold font-heading text-foreground mb-2">Article Not Found</h1>
            <p className="text-muted-foreground mb-4">The article you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog" className="text-primary hover:underline">
              Browse all articles
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | Pro Pointers Plus Blog</title>
        <meta name="description" content={post.excerpt || post.content.slice(0, 160)} />
        <link rel="canonical" href={`https://propointersplus.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.content.slice(0, 160)} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.published_at || post.created_at} />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {headerBar}

        <main className="flex-1 container mx-auto px-4 py-16">
          <article className="max-w-3xl mx-auto glass rounded-2xl p-8 md:p-12">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4 tracking-[-0.02em]">{post.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.published_at || post.created_at}>
                  {format(new Date(post.published_at || post.created_at), "MMMM d, yyyy")}
                </time>
              </div>
            </header>

            <div className="prose prose-lg prose-invert max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                paragraph.trim() && <p key={index} className="mb-4 text-foreground/85 leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost;
