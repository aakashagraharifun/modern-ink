import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Skeleton } from "@/components/ui/skeleton";
import { Maximize, Minimize } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure worker using a local fallback if CDN isn't preferred, but using the distributed file is fine too.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export function RollingReader({ url }: { url: string }) {
    const [numPages, setNumPages] = useState<number>(0);
    const [fullscreen, setFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            // Small padding subtraction to ensure it fits mobile screens without horizontal scroll
            setWidth(entries[0].contentRect.width - 16);
        });
        observer.observe(containerRef.current);

        // Initial width
        setWidth(containerRef.current.clientWidth - 16);

        return () => observer.disconnect();
    }, [fullscreen]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div
            className={`transition-all duration-300 ${fullscreen
                ? "fixed inset-0 z-[100] bg-background overflow-y-auto px-2 py-4"
                : "relative w-full"
                }`}
        >
            {/* Mobile-only toggle for full screen reader */}
            <button
                onClick={() => setFullscreen(!fullscreen)}
                className="fixed bottom-6 right-6 z-[110] rounded-full bg-primary p-4 text-primary-foreground shadow-xl md:hidden"
                title={fullscreen ? "Exit Reader" : "Enter Reader"}
            >
                {fullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
            </button>

            <div
                ref={containerRef}
                className={`relative mx-auto ${fullscreen ? "max-w-2xl" : "w-full"}`}
            >
                {/* Anti-copy/save transparent overlay shield, allowing scrolling but catching long presses */}
                <div
                    className="absolute inset-0 z-10 w-full"
                    style={{ height: `${numPages * 105}%` }} // Approximate height shield to cover the entire PDF scroll
                    onContextMenu={(e) => e.preventDefault()}
                />

                <div className="flex flex-col items-center">
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="w-full space-y-4">
                                <Skeleton className="h-[60vh] w-full max-w-2xl shrink-0" />
                                <Skeleton className="h-[60vh] w-full max-w-2xl shrink-0" />
                            </div>
                        }
                        error={
                            <div className="p-8 text-center text-red-500 bg-red-100 rounded-md">
                                Failed to load PDF Reader. Please try again.
                            </div>
                        }
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <div key={`page_${index + 1}`} className="mb-4 bg-white shadow-md relative z-0">
                                <Page
                                    pageNumber={index + 1}
                                    width={width}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    loading={<Skeleton className="h-[60vh] w-[90vw] md:w-[60vw]" />}
                                />
                            </div>
                        ))}
                    </Document>
                </div>
            </div>
        </div>
    );
}
