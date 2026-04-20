import { useTranslation } from "react-i18next";
import WeddingCostEstimator from "../components/WeddingCostEstimator";
import FinanceEstimator from "../components/FinanceEstimator";

export default function CalculatorsPage() {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <header className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{t("pages.calculatorsTitle")}</h1>
        <p className="mt-1 text-sm text-gray-600">{t("calculators.pageIntro")}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <WeddingCostEstimator />
        <FinanceEstimator />
      </div>
    </section>
  );
}

