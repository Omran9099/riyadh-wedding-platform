import { useTranslation } from "react-i18next";

const MOCK_STATS = [
  { key: "monthlyRevenue", value: "SAR 142,000", tone: "violet" },
  { key: "pendingPayouts", value: "SAR 28,500", tone: "amber" },
  { key: "confirmedBookings", value: "34", tone: "emerald" },
];

function toneClasses(tone) {
  if (tone === "amber") return "bg-amber-50 ring-amber-100 text-amber-700";
  if (tone === "emerald") return "bg-emerald-50 ring-emerald-100 text-emerald-700";
  return "bg-violet-50 ring-violet-100 text-violet-700";
}

export default function FinancialAnalytics() {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h3 className="text-lg font-bold text-gray-900">{t("dashboard.finance.title")}</h3>
      <p className="mt-1 text-sm text-gray-600">{t("dashboard.finance.subtitle")}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MOCK_STATS.map((stat) => (
          <article key={stat.key} className={`rounded-lg p-4 ring-1 ${toneClasses(stat.tone)}`}>
            <p className="text-xs font-semibold uppercase tracking-wide">{t(`dashboard.finance.stats.${stat.key}`)}</p>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-800">{t("dashboard.finance.mockChart")}</p>
        <div className="mt-3 flex h-28 items-end gap-2">
          {[25, 45, 38, 60, 50, 75, 68].map((h, idx) => (
            <div
              key={idx}
              className="w-full rounded-t bg-violet-400/80"
              style={{ height: `${h}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

