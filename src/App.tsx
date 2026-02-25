import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import { lazy, Suspense } from "react";

// Lazy-loaded routes for code splitting
const Index = lazy(() => import("./pages/Index"));
const NovelsPage = lazy(() => import("./pages/NovelsPage"));
const StoriesPage = lazy(() => import("./pages/StoriesPage"));
const PoemsPage = lazy(() => import("./pages/PoemsPage"));
const NovelReaderPage = lazy(() => import("./pages/NovelReaderPage"));
const WorkReaderPage = lazy(() => import("./pages/WorkReaderPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUploadPage = lazy(() => import("./pages/admin/AdminUploadPage"));
const AdminCommentsPage = lazy(() => import("./pages/admin/AdminCommentsPage"));
const AdminProfilePage = lazy(() => import("./pages/admin/AdminProfilePage"));
const AdminChaptersPage = lazy(() => import("./pages/admin/AdminChaptersPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading…</div>}>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/novels" element={<NovelsPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/poems" element={<PoemsPage />} />
            <Route path="/novels/:id" element={<NovelReaderPage />} />
            <Route path="/stories/:id" element={<WorkReaderPage />} />
            <Route path="/poems/:id" element={<WorkReaderPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/upload" element={<ProtectedRoute><AdminUploadPage /></ProtectedRoute>} />
            <Route path="/admin/comments" element={<ProtectedRoute><AdminCommentsPage /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute><AdminProfilePage /></ProtectedRoute>} />
            <Route path="/admin/chapters/:workId" element={<ProtectedRoute><AdminChaptersPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </AnimatePresence>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
