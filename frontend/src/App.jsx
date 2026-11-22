import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PlanProvider } from "./context/PlanContext";
import AppLayout from "./components/AppLayout";
import { PublicOnly } from "./components/Guards";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import SearchPage from "./pages/SearchPage";
import ResultPage from "./pages/ResultPage";
import HistoryPage from "./pages/HistoryPage";
import ExplorePage from "./pages/ExplorePage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlanProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />

            <Route element={<AppLayout />}>
              <Route path="/search" element={<SearchPage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PlanProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}