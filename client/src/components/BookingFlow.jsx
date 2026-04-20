import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const PACKAGES = [
  { id: "venue_catering", key: "venueCatering", amount: 18000 },
  { id: "venue_photo", key: "venuePhotography", amount: 14500 },
  { id: "full_bundle", key: "fullBundle", amount: 26000 },
];

function formatSar(amount, language) {
  return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BookingFlow({ vendorProfileId, blockedDates, onBookedDate }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language === "ar" ? "ar" : "en";
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState(PACKAGES[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", error: false });

  const selectedPackage = useMemo(
    () => PACKAGES.find((pkg) => pkg.id === selectedPackageId) || PACKAGES[0],
    [selectedPackageId]
  );

  const today = new Date().toISOString().split("T")[0];
  const isBlocked = selectedDate && blockedDates.has(selectedDate);

  const submitBooking = async (event) => {
    event.preventDefault();
    setMessage({ text: "", error: false });

    if (!selectedDate) {
      setMessage({ text: t("bookingFlow.errors.selectDate"), error: true });
      return;
    }
    if (blockedDates.has(selectedDate)) {
      setMessage({ text: t("bookingFlow.errors.dateUnavailable"), error: true });
      return;
    }

    const start = new Date(`${selectedDate}T18:00:00.000Z`);
    const end = new Date(`${selectedDate}T23:00:00.000Z`);
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setMessage({ text: t("bookingFlow.errors.authRequired"), error: true });
      return;
    }

    try {
      setSubmitting(true);
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
      const response = await fetch(`${apiBase}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          vendorProfileId,
          eventType: "wedding",
          eventStartAt: start.toISOString(),
          eventEndAt: end.toISOString(),
          items: [
            {
              kind: "package",
              sku: selectedPackage.id,
              title: {
                en: t(`bookingFlow.packages.${selectedPackage.key}`, { lng: "en" }),
                ar: t(`bookingFlow.packages.${selectedPackage.key}`, { lng: "ar" }),
              },
              quantity: 1,
              unitPrice: { currency: "SAR", amount: selectedPackage.amount },
            },
          ],
          subtotal: { currency: "SAR", amount: selectedPackage.amount },
          total: { currency: "SAR", amount: selectedPackage.amount },
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || t("bookingFlow.errors.failed"));
      }

      onBookedDate(selectedDate);
      setMessage({ text: t("bookingFlow.success"), error: false });
    } catch (err) {
      setMessage({ text: err.message || t("bookingFlow.errors.failed"), error: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h3 className="text-lg font-bold text-gray-900">{t("bookingFlow.title")}</h3>
      <p className="mt-1 text-sm text-gray-600">{t("bookingFlow.subtitle")}</p>

      <form className="mt-4 space-y-4" onSubmit={submitBooking}>
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">{t("bookingFlow.dateLabel")}</span>
          <input
            type="date"
            min={today}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${
              isBlocked
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-gray-300 text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            }`}
          />
        </label>

        {isBlocked ? <p className="text-sm font-medium text-red-600">{t("bookingFlow.dateBlocked")}</p> : null}

        <div>
          <p className="text-sm font-semibold text-gray-700">{t("bookingFlow.packageLabel")}</p>
          <div className="mt-2 space-y-2">
            {PACKAGES.map((pkg) => (
              <label key={pkg.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <span className="text-sm text-gray-800">
                  <input
                    type="radio"
                    name="package"
                    value={pkg.id}
                    checked={selectedPackageId === pkg.id}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="ltr:ml-4 rtl:mr-4">{t(`bookingFlow.packages.${pkg.key}`)}</span>
                </span>
                <span className="text-sm font-semibold text-violet-700">{formatSar(pkg.amount, language)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-violet-50 p-3 text-sm text-violet-800">
          <span className="font-semibold">{t("bookingFlow.estimatedTotal")}:</span>
          <span className="font-bold ltr:ml-4 rtl:mr-4">{formatSar(selectedPackage.amount, language)}</span>
        </div>

        <button
          type="submit"
          disabled={submitting || !selectedDate || isBlocked}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
        >
          {submitting ? t("bookingFlow.submitting") : t("bookingFlow.bookNow")}
        </button>
      </form>

      {message.text ? (
        <p className={`mt-3 text-sm font-medium ${message.error ? "text-red-600" : "text-emerald-600"}`}>
          {message.text}
        </p>
      ) : null}
    </section>
  );
}

