import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const Home = lazy(() => import("./pages/Home"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Pet = lazy(() => import("./pages/Pet"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Graveyard = lazy(() => import("./pages/Graveyard"));
const About = lazy(() => import("./pages/About"));
const Watchlist = lazy(() => import("./pages/Watchlist"));

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-6xl">🥚</p>
      <h1 className="pixel-font mb-3 text-2xl text-green-400">404</h1>
      <p className="mb-6 text-sm text-gray-500">This page doesn't exist. Maybe a pet wandered off with it.</p>
      <a href="/" className="rounded border border-gray-700 bg-gray-800/40 px-5 py-2 text-sm text-gray-300 hover:bg-gray-800/70">
        Go Home
      </a>
    </div>
  );
}

function PageLoader() {
  return <div className="flex min-h-[50vh] items-center justify-center text-gray-500">Loading...</div>;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Gallery />} />
              <Route path="/pet/:slug" element={<Pet />} />
              <Route path="/hall-of-fame" element={<Leaderboard />} />
              <Route path="/graveyard" element={<Graveyard />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
