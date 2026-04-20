import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import VendorProfilePage from "./pages/VendorProfilePage";
import CalculatorsPage from "./pages/CalculatorsPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";

function AppShell() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isArabic = i18n.language === "ar";
    document.documentElement.lang = isArabic ? "ar" : "en";
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/vendor-profile" element={<VendorProfilePage />} />
          <Route path="/vendor-profile/:vendorId" element={<VendorProfilePage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/dashboards" element={<VendorDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
