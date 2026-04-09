import { Link } from "react-router-dom";
import { Mail, BookOpen } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-black/60 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Pro Pointers Plus. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link 
              to="/blog" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-150"
            >
              <BookOpen className="h-4 w-4" />
              Blog
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a 
                href="mailto:propointers.tennis@gmail.com"
                className="hover:text-primary transition-colors duration-150"
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
