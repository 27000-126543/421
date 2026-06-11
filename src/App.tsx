import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import TopNavigation from "@/components/TopNavigation";
import SidebarNavigation from "@/components/SidebarNavigation";
import Toast from "@/components/Toast";
import { useUIStore } from "@/store/useUIStore";
import { usePlayerStore } from "@/store/usePlayerStore";

import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Workshop from "@/pages/Workshop";
import Explore from "@/pages/Explore";
import Arena from "@/pages/Arena";
import Battle from "@/pages/Battle";
import Market from "@/pages/Market";
import Guild from "@/pages/Guild";
import Reports from "@/pages/Reports";
import Rankings from "@/pages/Rankings";
import Profile from "@/pages/Profile";

const pageVariants = {
  initial: { opacity: 0, x: 20, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: -20, scale: 0.98, transition: { duration: 0.3 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  const { toasts, removeToast } = useUIStore();
  const { currentPlayer } = usePlayerStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isLoginPage = location.pathname === '/login';
  const isBattlePage = location.pathname === '/battle';

  const isAuthenticated = !!currentPlayer;

  if (!isAuthenticated && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && isLoginPage) {
    return <Navigate to="/home" replace />;
  }

  if (isLoginPage) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-dream-dark">
      {!isBattlePage && <TopNavigation onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}

      <div className="flex">
        {!isBattlePage && (
          <SidebarNavigation
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <main className={`flex-1 ${!isBattlePage ? 'p-6 lg:pl-8' : ''}`}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/home"
                element={
                  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <Home />
                  </motion.div>
                }
              />
              <Route
                path="/workshop"
                element={
                  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <Workshop />
                  </motion.div>
                }
              />
              <Route
                path="/explore"
                element={
                  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <Explore />
                  </motion.div>
                }
              />
              <Route
                path="/arena"
                element={
                  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <Arena />
                  </motion.div>
                }
              />
              <Route
                path="/battle"
                element={
                  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <Battle />
                  </motion.div>
                }
              />
              <Route
                path="/market"
                element={
                  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <Market />
                  </motion.div>
                }
              />
              <Route
                path="/guild"
                element={
                  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <Guild />
                  </motion.div>
                }
              />
              <Route
                path="/reports"
                element={
                  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <Reports />
                  </motion.div>
                }
              />
              <Route
                path="/rankings"
                element={
                  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <Rankings />
                  </motion.div>
                }
              />
              <Route
                path="/profile"
                element={
                  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                    <Profile />
                  </motion.div>
                }
              />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>

      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  const { init } = useUIStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}
