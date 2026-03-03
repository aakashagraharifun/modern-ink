import { Instagram, Mail, Heart } from "lucide-react";
import { motion } from "framer-motion";

const socialLinks = [
  { label: "Instagram", icon: Instagram, href: "https://instagram.com/aakash_zip" },
  { label: "Email", icon: Mail, href: "mailto:aakashag887@gmail.com" },
];

export function Footer() {
  return (
    <motion.footer
      className="mt-auto border-t bg-card/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-3 sm:flex-row sm:justify-between sm:gap-4 sm:py-4">
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
              <link.icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        <p className="flex items-center gap-1 text-xs text-muted-foreground/60">
          Made with <Heart className="h-3 w-3 fill-accent text-accent" /> by Aakash
        </p>
      </div>
    </motion.footer>
  );
}
