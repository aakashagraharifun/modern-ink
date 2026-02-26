import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function BackButton() {
    const navigate = useNavigate();
    const location = useLocation();

    // Show back button on any page except home
    const show = location.pathname !== "/";

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed bottom-6 left-6 pointer-events-none z-40 md:bottom-auto md:top-24 md:left-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} // smooth presentation
                        className="pointer-events-auto"
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="h-12 w-12 rounded-full shadow-lg border-2 bg-background/90 backdrop-blur-md hover:bg-foreground hover:text-background transition-all duration-300"
                            aria-label="Go Back"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
