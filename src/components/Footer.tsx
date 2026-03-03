import { Instagram, Mail, Heart } from "lucide-react";

const socialLinks = [
  { label: "Instagram", icon: Instagram, href: "https://instagram.com/" },
  { label: "Email", icon: Mail, href: "mailto:contact@modernpaper.com" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Modern Paper. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="text-muted-foreground transition-colors hover:text-accent"
            >
              <link.icon className="h-5 w-5" />
            </a>
          ))}
        </div>

        <p className="flex items-center gap-1 text-xs text-muted-foreground/60">
          Made with <Heart className="h-3 w-3 fill-accent text-accent" /> by Aakash
        </p>
      </div>
    </footer>
  );
}
