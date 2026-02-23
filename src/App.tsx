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
import { AnimatedRoutes } from "./components/AnimatedRoutes";

const queryClient = new QueryClient();

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
