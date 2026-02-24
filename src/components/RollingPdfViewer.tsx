import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Skeleton } from "@/components/ui/skeleton";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface RollingPdfViewerProps {
  url: string;
  title?: string;
}

export function RollingPdfViewer({ url, title }: RollingPdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(800);

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

  return (
    <div
      ref={containerRef}
      className="no-select relative overflow-y-auto rounded-lg border bg-muted/30 md:max-h-[85vh]"
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: "none" }}
    >
      {/* Transparent overlay shield to block long-press / right-click saving */}
      <div className="pointer-events-auto absolute inset-0 z-10" style={{ touchAction: "pan-y pinch-zoom" }} />

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
            width={containerWidth}
            className="mx-auto mb-1"
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  );
}
