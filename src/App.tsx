import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NovelsPage from "./pages/NovelsPage";
import StoriesPage from "./pages/StoriesPage";
import PoemsPage from "./pages/PoemsPage";
import NovelReaderPage from "./pages/NovelReaderPage";
import WorkReaderPage from "./pages/WorkReaderPage";
import AboutPage from "./pages/AboutPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUploadPage from "./pages/admin/AdminUploadPage";
import AdminCommentsPage from "./pages/admin/AdminCommentsPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import AdminChaptersPage from "./pages/admin/AdminChaptersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
