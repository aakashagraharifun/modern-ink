import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface RollingPdfViewerProps {
  url: string;
  title?: string;
}

export function RollingPdfViewer({ url, title }: RollingPdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const openFullscreen = () => {
    setIsFullscreen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = "";
  };

  const PdfDocument = ({ width }: { width: number }) => (
    <Document
      file={url}
      onLoadSuccess={onDocumentLoadSuccess}
      loading={
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[60vh] w-full" />
          ))}
        </div>
      }
      error={
        <div className="p-8 text-center text-muted-foreground">
          Failed to load PDF. Please try again.
        </div>
      }
    >
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
    </Document>
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
          <PdfDocument width={containerWidth} />
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
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b bg-background px-4 py-2">
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
            className="no-select flex-1 overflow-y-auto overscroll-contain"
            onContextMenu={(e) => e.preventDefault()}
            style={{
              WebkitTouchCallout: "none",
              touchAction: "pan-y pinch-zoom",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div ref={containerRef} className="relative mx-auto w-full md:max-w-4xl">
              <PdfDocument width={containerWidth} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
