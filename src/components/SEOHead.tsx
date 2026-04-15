import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string | null;
  type?: string;
  schema?: any;
}

export function SEOHead({ title, description, image, type = "article", schema }: SEOHeadProps) {
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

    // JSON-LD
    let script = document.querySelector('script[id="json-ld"]') as HTMLScriptElement | null;
    if (schema) {
      if (!script) {
        script = document.createElement("script");
        script.id = "json-ld";
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    } else if (script) {
      script.remove();
    }

    return () => {
      document.title = "Modern Paper";
      const s = document.querySelector('script[id="json-ld"]');
      if (s) s.remove();
    };
  }, [title, description, image, type, schema]);

  return null;
}
