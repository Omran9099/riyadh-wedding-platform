import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";
import BookingFlow from "../components/BookingFlow";

function localizedText(field, language, fallback = "-") {
  if (!field || typeof field !== "object") return fallback;
  return field[language] || field.en || field.ar || fallback;
}

export default function VendorProfilePage() {
  const { t, i18n } = useTranslation();
  const { vendorId } = useParams();
  const language = i18n.language === "ar" ? "ar" : "en";

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(Boolean(vendorId));
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("gallery");
  const [blockedDates, setBlockedDates] = useState(new Set());

  useEffect(() => {
    if (!vendorId) {
      setVendor(null);
      setLoading(false);
      setError("");
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    async function loadVendor() {
      setLoading(true);
      setError("");

      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
        const response = await fetch(`${apiBase}/api/vendors/${vendorId}`, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || t("errors.failedToLoadVendor"));
        }
        if (isActive) setVendor(payload.data || null);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (isActive) setError(err.message || t("errors.failedToLoadVendor"));
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadVendor();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [vendorId, t]);

  useEffect(() => {
    if (!vendor?._id) return undefined;
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
    const socket = io(apiBase, { transports: ["websocket", "polling"] });

    socket.on("availability-blocked", (payload) => {
      if (!payload || payload.vendorId !== String(vendor._id) || !payload.date) return;
      const day = new Date(payload.date).toISOString().split("T")[0];
      setBlockedDates((prev) => new Set(prev).add(day));
    });

    return () => {
      socket.disconnect();
    };
  }, [vendor?._id]);

  const tabs = useMemo(
    () => [
      { id: "gallery", label: t("vendorProfile.tabs.gallery") },
      { id: "map3d", label: t("vendorProfile.tabs.map3d") },
      { id: "reviews", label: t("vendorProfile.tabs.reviews") },
    ],
    [t]
  );

  const vendorName = localizedText(vendor?.businessName, language, t("vendors.untitled"));
  const vendorDescription = localizedText(vendor?.description, language, t("vendors.noDescription"));
  const gallery = Array.isArray(vendor?.gallery) ? vendor.gallery : [];
  const maps = Array.isArray(vendor?.threeDMaps) ? vendor.threeDMaps : [];
  const reviews = Array.isArray(vendor?.reviews) ? vendor.reviews : [];

  return (
    <section className="space-y-4">
      {!vendorId ? (
        <div className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-sm ring-1 ring-gray-200">
          {t("vendorProfile.selectVendorHint")}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-600 shadow-sm ring-1 ring-gray-200">
          {t("common.loading")}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
      ) : null}

      {!loading && !error && vendor ? (
        <>
          <header className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{vendorName}</h1>
            <p className="mt-2 text-sm leading-6 text-gray-600">{vendorDescription}</p>
            <button
              type="button"
              className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 ltr:mr-0 rtl:ml-0"
            >
              {t("vendors.bookNow")}
            </button>
          </header>

          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-violet-100 text-violet-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {activeTab === "gallery" ? (
                gallery.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {gallery.map((item, index) => (
                      <figure key={`${item.url}-${index}`} className="overflow-hidden rounded-lg ring-1 ring-gray-200">
                        <img
                          src={item.url}
                          alt={localizedText(item.alt, language, t("vendorProfile.galleryItem"))}
                          className="h-56 w-full object-cover"
                          loading="lazy"
                        />
                      </figure>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{t("vendorProfile.emptyGallery")}</p>
                )
              ) : null}

              {activeTab === "map3d" ? (
                maps.length > 0 ? (
                  <div className="space-y-4">
                    {maps.map((map, index) => (
                      <div key={`${map.url}-${index}`} className="overflow-hidden rounded-lg ring-1 ring-gray-200">
                        <div className="border-b border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">
                          {localizedText(map.title, language, `${t("vendorProfile.map")} ${index + 1}`)}
                        </div>
                        <div className="aspect-video w-full">
                          <iframe
                            src={map.url}
                            title={localizedText(map.title, language, `${t("vendorProfile.map")} ${index + 1}`)}
                            className="h-full w-full border-0"
                            loading="lazy"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{t("vendorProfile.emptyMaps")}</p>
                )
              ) : null}

              {activeTab === "reviews" ? (
                reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.map((review, index) => (
                      <article key={review._id || index} className="rounded-lg bg-gray-50 p-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {localizedText(review.title, language, t("vendorProfile.reviewTitleFallback"))}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">
                          {localizedText(review.body, language, t("vendorProfile.reviewBodyFallback"))}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{t("vendorProfile.emptyReviews")}</p>
                )
              ) : null}
            </div>
          </div>

          <BookingFlow
            vendorProfileId={vendor._id}
            blockedDates={blockedDates}
            onBookedDate={(date) => setBlockedDates((prev) => new Set(prev).add(date))}
          />
        </>
      ) : null}
    </section>
  );
}
