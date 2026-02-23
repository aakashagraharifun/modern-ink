import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Novels", to: "/novels" },
  { label: "Stories", to: "/stories" },
  { label: "Poems", to: "/poems" },
  { label: "About", to: "/about" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="font-serif text-xl font-bold tracking-tight">
          Modern Paper
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-secondary",
                location.pathname === link.to
                  ? "text-foreground font-bold underline underline-offset-4 bg-secondary/30"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            to="/admin"
            className="ml-2 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
          >
            Admin
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background px-4 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-secondary",
                location.pathname === link.to
                  ? "text-foreground font-bold underline underline-offset-4 bg-secondary/30"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-xs text-muted-foreground/60"
          >
            Admin Login
          </Link>
        </div>
      )}
    </header>
  );
}
