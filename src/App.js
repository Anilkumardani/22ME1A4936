import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UrlShortenerPage from "./pages/UrlShortenerPage";
import StatsPage from "./pages/StatsPage";
import RedirectHandler from "./pages/RedirectHandler";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UrlShortenerPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/:shortcode" element={<RedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
