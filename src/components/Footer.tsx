import { Link } from "react-router-dom";
import { Mail, BookOpen } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Pro Pointers Plus. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link 
              to="/blog" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Blog
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a 
                href="mailto:propointers.tennis@gmail.com"
                className="hover:text-foreground transition-colors"
              >
                propointers.tennis@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
