import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string | null;
  type?: string;
}

export function SEOHead({ title, description, image, type = "article" }: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = `${title} — Modern Paper`;
    document.title = fullTitle;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setNameMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const desc = description || `Read "${title}" on Modern Paper`;

    setNameMeta("description", desc);
    setMeta("og:title", fullTitle);
    setMeta("og:description", desc);
    setMeta("og:type", type);
    setMeta("og:url", window.location.href);
    if (image) setMeta("og:image", image);

    // Twitter card
    setNameMeta("twitter:card", "summary_large_image");
    setNameMeta("twitter:title", fullTitle);
    setNameMeta("twitter:description", desc);
    if (image) setNameMeta("twitter:image", image);

    return () => {
      document.title = "Modern Paper";
    };
  }, [title, description, image, type]);

  return null;
}
