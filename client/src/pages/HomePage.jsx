import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">{t("pages.homeTitle")}</h1>
      <p className="text-gray-600">{t("pages.placeholder")}</p>
    </section>
  );
}
