import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.06] bg-black/40 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Logo size="sm" />
              <span className="font-heading font-bold text-foreground">Pro Pointers Plus</span>
            </div>
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              The operating system for elite tennis coaches.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Product</h4>
            <div className="space-y-2">
              <Link to="/pricing" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-150">Pricing</Link>
              <Link to="/demo/dashboard" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-150">Demo</Link>
              <Link to="/blog" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-150">Blog</Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Legal</h4>
            <div className="space-y-2">
              <Link to="/terms" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-150">Terms</Link>
              <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-150">Privacy</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact</h4>
            <a
              href="mailto:propointers.tennis@gmail.com"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-150"
            >
              <Mail className="h-4 w-4" />
              propointers.tennis@gmail.com
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground/50">
          <span>© {currentYear} Pro Pointers Plus. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};
