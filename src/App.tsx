import { lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import ThemeProvider from "@/components/providers/ThemeProvider";
import GameProvider from "@/components/game/GameProvider";
import SiteLayout from "@/components/layout/SiteLayout";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";

// Secondary pages are code-split; a skeleton shows while they load.
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <GameProvider>
            <Routes>
              <Route element={<SiteLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </GameProvider>
        </BrowserRouter>
        <Toaster />
      </MotionConfig>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
