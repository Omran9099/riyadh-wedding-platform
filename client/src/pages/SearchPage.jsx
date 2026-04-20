import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import SearchFilter from "../components/SearchFilter";
import VendorCard from "../components/VendorCard";

export default function SearchPage() {
  const { t } = useTranslation();

  const [eventType, setEventType] = useState("");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    async function loadVendors() {
      setLoading(true);
      setError("");

      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
        const params = new URLSearchParams();
        if (eventType) params.set("eventType", eventType);
        const qs = params.toString();

        const response = await fetch(`${apiBase}/api/vendors${qs ? `?${qs}` : ""}`, {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || t("errors.failedToLoadVendors"));
        }

        if (isActive) {
          setVendors(Array.isArray(payload.data) ? payload.data : []);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if (isActive) setError(err.message || t("errors.failedToLoadVendors"));
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadVendors();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [eventType, t]);

  return (
    <section className="space-y-4">
      <header className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{t("pages.searchTitle")}</h1>
        <p className="mt-1 text-sm text-gray-600">{t("searchFilters.searchHint")}</p>
      </header>

      <SearchFilter value={eventType} onChange={setEventType} />

      {loading ? (
        <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-600 shadow-sm ring-1 ring-gray-200">
          {t("common.loading")}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
      ) : null}

      {!loading && !error && vendors.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-600 shadow-sm ring-1 ring-gray-200">
          {t("searchFilters.noResults")}
        </div>
      ) : null}

      {!loading && !error && vendors.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <VendorCard key={vendor._id} vendor={vendor} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
