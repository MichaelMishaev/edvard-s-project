import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WelcomePage from "./pages/WelcomePage";
import GamePage from "./pages/GamePage";
import ResultsPage from "./pages/ResultsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import BadgeCollectionPage from "./pages/BadgeCollectionPage";
import HallOfFamePage from "./pages/HallOfFamePage";

// One-time migration: move identity keys from sessionStorage → localStorage
const IDENTITY_KEYS = ["playerId", "playerName", "playerClassName"];
IDENTITY_KEYS.forEach((key) => {
  if (!localStorage.getItem(key)) {
    const val = sessionStorage.getItem(key);
    if (val) localStorage.setItem(key, val);
  }
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/badges" element={<BadgeCollectionPage />} />
          <Route path="/hall-of-fame" element={<HallOfFamePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
