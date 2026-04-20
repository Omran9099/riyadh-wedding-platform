import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import BookingCalendar from "../components/BookingCalendar";
import FinancialAnalytics from "../components/FinancialAnalytics";
import InventoryManager from "../components/InventoryManager";

const SIDEBAR_KEYS = ["overview", "bookings", "finance", "inventory", "settings"];

export default function VendorDashboardPage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("overview");
  const [pickupStatus, setPickupStatus] = useState({ loading: false, message: "", error: false });

  const sidebarItems = useMemo(
    () =>
      SIDEBAR_KEYS.map((key) => ({
        key,
        label: t(`dashboard.sidebar.${key}`),
      })),
    [t]
  );

  const handleCharityPickup = async () => {
    setPickupStatus({ loading: true, message: "", error: false });
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
      const response = await fetch(`${apiBase}/api/vendors/charity-pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || t("dashboard.charity.error"));
      }
      setPickupStatus({ loading: false, message: t("dashboard.charity.success"), error: false });
    } catch (_err) {
      setPickupStatus({ loading: false, message: t("dashboard.charity.error"), error: true });
    }
  };

  return (
    <section className="space-y-4">
      <header className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.title")}</h1>
        <p className="mt-1 text-sm text-gray-600">{t("dashboard.subtitle")}</p>
      </header>

      <div className="flex flex-col gap-4 ltr:lg:flex-row rtl:lg:flex-row-reverse">
        <aside className="w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 lg:w-72">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t("dashboard.sidebar.title")}
          </p>
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`w-full rounded-md px-3 py-2 text-sm font-medium transition ${
                  activeSection === item.key
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">{t("dashboard.charity.title")}</p>
                <p className="text-xs text-gray-500">{t("dashboard.charity.subtitle")}</p>
              </div>
              <button
                type="button"
                onClick={handleCharityPickup}
                disabled={pickupStatus.loading}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {pickupStatus.loading ? t("dashboard.charity.loading") : t("dashboard.charity.button")}
              </button>
            </div>
            {pickupStatus.message ? (
              <p
                className={`mt-3 text-sm font-medium ${pickupStatus.error ? "text-red-600" : "text-emerald-600"}`}
              >
                {pickupStatus.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <BookingCalendar />
            <FinancialAnalytics />
          </div>

          <InventoryManager />
        </div>
      </div>
    </section>
  );
}

