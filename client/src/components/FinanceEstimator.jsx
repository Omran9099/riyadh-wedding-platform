import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

function formatSar(amount, language) {
  return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function FinanceEstimator() {
  const { t, i18n } = useTranslation();
  const language = i18n.language === "ar" ? "ar" : "en";
  const [totalCost, setTotalCost] = useState(60000);

  const plan = useMemo(() => {
    const months = 12;
    const safeTotal = Math.max(0, Number(totalCost || 0));
    const monthly = safeTotal / months;
    return {
      months,
      total: Math.round(safeTotal),
      monthly: Math.round(monthly),
    };
  }, [totalCost]);

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-xl font-bold text-gray-900">{t("calculators.finance.title")}</h2>
      <p className="mt-1 text-sm text-gray-600">{t("calculators.finance.description")}</p>

      <label className="mt-5 block">
        <span className="text-sm font-semibold text-gray-700">{t("calculators.finance.totalCost")}</span>
        <input
          type="number"
          min={0}
          step={500}
          value={totalCost}
          onChange={(e) => setTotalCost(Math.max(0, Number(e.target.value || 0)))}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
        />
      </label>

      <div className="mt-5 rounded-lg bg-emerald-50 p-4 ring-1 ring-emerald-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-emerald-900">{t("calculators.finance.monthlyInstallment")}</p>
          <p className="text-sm text-emerald-700">
            {t("calculators.finance.interestFree")}
            <span className="font-semibold ltr:ml-4 rtl:mr-4">{plan.months}</span>
            {t("calculators.finance.months")}
          </p>
        </div>
        <p className="mt-2 text-2xl font-bold text-emerald-700">{formatSar(plan.monthly, language)}</p>
        <p className="mt-2 text-xs text-emerald-800">
          {t("calculators.finance.totalPayable")}: {formatSar(plan.total, language)}
        </p>
      </div>
    </section>
  );
}

