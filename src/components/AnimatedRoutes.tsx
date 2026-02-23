import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import NovelsPage from "@/pages/NovelsPage";
import StoriesPage from "@/pages/StoriesPage";
import PoemsPage from "@/pages/PoemsPage";
import NovelReaderPage from "@/pages/NovelReaderPage";
import WorkReaderPage from "@/pages/WorkReaderPage";
import AboutPage from "@/pages/AboutPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUploadPage from "@/pages/admin/AdminUploadPage";
import AdminEditWorkPage from "@/pages/admin/AdminEditWorkPage";
import AdminCommentsPage from "@/pages/admin/AdminCommentsPage";
import AdminProfilePage from "@/pages/admin/AdminProfilePage";
import AdminChaptersPage from "@/pages/admin/AdminChaptersPage";
import NotFound from "@/pages/NotFound";

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
    >
        {children}
    </motion.div>
);

export function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
                <Route path="/novels" element={<PageWrapper><NovelsPage /></PageWrapper>} />
                <Route path="/stories" element={<PageWrapper><StoriesPage /></PageWrapper>} />
                <Route path="/poems" element={<PageWrapper><PoemsPage /></PageWrapper>} />
                <Route path="/novels/:id" element={<PageWrapper><NovelReaderPage /></PageWrapper>} />
                <Route path="/stories/:id" element={<PageWrapper><WorkReaderPage /></PageWrapper>} />
                <Route path="/poems/:id" element={<PageWrapper><WorkReaderPage /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
                <Route path="/admin" element={<PageWrapper><AdminLoginPage /></PageWrapper>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute><PageWrapper><AdminDashboard /></PageWrapper></ProtectedRoute>} />
                <Route path="/admin/upload" element={<ProtectedRoute><PageWrapper><AdminUploadPage /></PageWrapper></ProtectedRoute>} />
                <Route path="/admin/edit/:id" element={<ProtectedRoute><PageWrapper><AdminEditWorkPage /></PageWrapper></ProtectedRoute>} />
                <Route path="/admin/comments" element={<ProtectedRoute><PageWrapper><AdminCommentsPage /></PageWrapper></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute><PageWrapper><AdminProfilePage /></PageWrapper></ProtectedRoute>} />
                <Route path="/admin/chapters/:workId" element={<ProtectedRoute><PageWrapper><AdminChaptersPage /></PageWrapper></ProtectedRoute>} />
                <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
            </Routes>
        </AnimatePresence>
    );
}
