import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const VENUE_MULTIPLIERS = {
  basic: 1,
  premium: 1.35,
  luxury: 1.8,
};

const SERVICE_PRICE_PER_GUEST = {
  catering: 120,
  photography: 55,
  decor: 70,
  entertainment: 45,
};

function formatSar(amount, language) {
  return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function WeddingCostEstimator() {
  const { t, i18n } = useTranslation();
  const language = i18n.language === "ar" ? "ar" : "en";

  const [guestCount, setGuestCount] = useState(150);
  const [venueType, setVenueType] = useState("basic");
  const [services, setServices] = useState({
    catering: true,
    photography: true,
    decor: true,
    entertainment: false,
  });

  const estimate = useMemo(() => {
    const basePerGuest = 180;
    const selectedServiceTotal = Object.entries(services).reduce((sum, [key, enabled]) => {
      if (!enabled) return sum;
      return sum + (SERVICE_PRICE_PER_GUEST[key] || 0);
    }, 0);

    const subtotalPerGuest = basePerGuest + selectedServiceTotal;
    const total = guestCount * subtotalPerGuest * (VENUE_MULTIPLIERS[venueType] || 1);
    return Math.round(total);
  }, [guestCount, services, venueType]);

  const toggleService = (key) => {
    setServices((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-xl font-bold text-gray-900">{t("calculators.wedding.title")}</h2>
      <p className="mt-1 text-sm text-gray-600">{t("calculators.wedding.description")}</p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">{t("calculators.wedding.guestCount")}</span>
          <input
            type="number"
            min={10}
            step={10}
            value={guestCount}
            onChange={(e) => setGuestCount(Math.max(10, Number(e.target.value || 0)))}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-gray-700">{t("calculators.wedding.venueType")}</span>
          <select
            value={venueType}
            onChange={(e) => setVenueType(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
          >
            <option value="basic">{t("calculators.wedding.venues.basic")}</option>
            <option value="premium">{t("calculators.wedding.venues.premium")}</option>
            <option value="luxury">{t("calculators.wedding.venues.luxury")}</option>
          </select>
        </label>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-700">{t("calculators.wedding.services")}</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.keys(services).map((key) => (
            <label key={key} className="flex items-center rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={services[key]}
                onChange={() => toggleService(key)}
                className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="ltr:ml-4 rtl:mr-4">{t(`calculators.wedding.serviceItems.${key}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-violet-50 p-4 ring-1 ring-violet-100">
        <p className="text-sm font-semibold text-violet-900">{t("calculators.wedding.estimatedBudget")}</p>
        <p className="mt-1 text-2xl font-bold text-violet-700">{formatSar(estimate, language)}</p>
      </div>
    </section>
  );
}

