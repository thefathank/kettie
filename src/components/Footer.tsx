import { Link } from "react-router-dom";
import { Mail, BookOpen } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-black/40 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-heading font-bold text-foreground">Pro Pointers Plus</span>
          </div>

          {/* Links */}
          <div className="flex items-center justify-center gap-6">
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-150">
              Blog
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-150">
              Pricing
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-150">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-150">
              Privacy
            </Link>
          </div>

          {/* Contact */}
          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <a
              href="mailto:propointers.tennis@gmail.com"
              className="hover:text-primary transition-colors duration-150"
            >
              propointers.tennis@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.04] text-center text-xs text-muted-foreground/60">
          © {currentYear} Pro Pointers Plus. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
