import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-violet-100 text-violet-700"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const toggleLanguage = async () => {
    const nextLang = isArabic ? "en" : "ar";
    await i18n.changeLanguage(nextLang);
    localStorage.setItem("lang", nextLang);
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="text-lg font-bold text-violet-700">{t("brand")}</div>

        <div className="flex flex-wrap items-center gap-2">
          <NavLink to="/" end className={linkClass}>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/search" className={linkClass}>
            {t("nav.search")}
          </NavLink>
          <NavLink to="/vendor-profile" className={linkClass}>
            {t("nav.vendorProfile")}
          </NavLink>
          <NavLink to="/calculators" className={linkClass}>
            {t("nav.calculators")}
          </NavLink>
          <NavLink to="/dashboards" className={linkClass}>
            {t("nav.dashboards")}
          </NavLink>
        </div>

        <button
          type="button"
          onClick={toggleLanguage}
          className="self-start rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black md:self-auto"
        >
          {t("language.switch")}
        </button>
      </div>
    </nav>
  );
}
