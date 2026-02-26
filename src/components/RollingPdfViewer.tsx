import { useState, useCallback, useRef, useMemo, memo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X, BookOpen } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface RollingPdfViewerProps {
  url: string;
  title?: string;
}

/** Memoized PDF pages so scroll-driven state changes don't re-render them */
const MemoizedPages = memo(function MemoizedPages({
  numPages,
  width,
}: {
  numPages: number;
  width: number;
}) {
  return (
    <>
      {Array.from({ length: numPages }).map((_, i) => (
        <Page
          key={i}
          pageNumber={i + 1}
          width={width}
          className="mx-auto mb-1"
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      ))}
    </>
  );
});

export function RollingPdfViewer({ url, title }: RollingPdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollProgressRef = useRef(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      observer.observe(node);
      setContainerWidth(node.clientWidth);
    }
  }, []);

  // Use ref + direct DOM update to avoid re-renders on scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !progressBarRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const max = scrollHeight - clientHeight;
    const pct = max > 0 ? (scrollTop / max) * 100 : 0;
    scrollProgressRef.current = pct;
    progressBarRef.current.style.width = `${pct}%`;
  }, []);

  const openFullscreen = () => {
    setIsFullscreen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false);
    // Restore body scroll reliably
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.documentElement.style.overflow = "";
    // Force reflow
    window.scrollTo(0, window.scrollY);
  }, []);

  // Memoize the loading/error elements
  const loadingEl = useMemo(
    () => (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[60vh] w-full" />
        ))}
      </div>
    ),
    []
  );

  const errorEl = useMemo(
    () => (
      <div className="p-8 text-center text-muted-foreground">
        Failed to load PDF. Please try again.
      </div>
    ),
    []
  );

  return (
    <>
      {/* Preview: cropped with fade */}
      <div
        className="no-select relative overflow-hidden rounded-lg border bg-muted/30"
        style={{ maxHeight: "280px" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div ref={containerRef}>
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={loadingEl}
            error={errorEl}
          >
            <MemoizedPages numPages={numPages} width={containerWidth} />
          </Document>
        </div>

        {/* Fade overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />

        {/* Read button */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-4">
          <Button onClick={openFullscreen} size="lg" className="gap-2 shadow-lg">
            <BookOpen className="h-4 w-4" />
            Read Full PDF
          </Button>
        </div>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background"
          style={{ height: "100dvh" }}
        >
          {/* Reading progress bar - no state, direct DOM */}
          <div className="relative z-[70] h-1 w-full bg-muted">
            <div
              ref={progressBarRef}
              className="h-full bg-primary transition-none"
              style={{ width: "0%" }}
            />
          </div>

          {/* Header */}
          <div className="relative z-[60] flex shrink-0 items-center justify-between border-b bg-background px-4 py-2">
            <span className="truncate font-serif text-sm font-medium text-foreground">
              {title || "PDF Reader"}
            </span>
            <Button variant="ghost" size="icon" onClick={closeFullscreen}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Scrollable PDF area */}
          <div
            ref={scrollRef}
            className="no-select relative flex-1 overflow-y-auto overscroll-contain"
            onScroll={handleScroll}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y pinch-zoom",
            }}
          >
            <div ref={containerRef} className="mx-auto w-full md:max-w-4xl">
              <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={loadingEl}
                error={errorEl}
              >
                <MemoizedPages numPages={numPages} width={containerWidth} />
              </Document>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
