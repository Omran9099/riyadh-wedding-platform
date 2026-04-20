import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function localizedText(field, language, fallback = "-") {
  if (!field || typeof field !== "object") return fallback;
  return field[language] || field.en || field.ar || fallback;
}

export default function VendorCard({ vendor }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language === "ar" ? "ar" : "en";

  const vendorName = localizedText(vendor.businessName, language, t("vendors.untitled"));
  const description = localizedText(vendor.description, language, t("vendors.noDescription"));
  const eventTypes = Array.isArray(vendor.eventTypes) ? vendor.eventTypes : [];

  return (
    <article className="flex h-full flex-col rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-gray-900">{vendorName}</h3>
        {vendor.isVerified && (
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
            {t("vendors.verified")}
          </span>
        )}
      </div>

      <p className="line-clamp-3 text-sm text-gray-600">{description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {eventTypes.length > 0 ? (
          eventTypes.map((type) => (
            <span
              key={`${vendor._id}-${type.key}`}
              className="rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700"
            >
              {t(`eventTypes.${type.key}`)}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-500">{t("vendors.noEventTypes")}</span>
        )}
      </div>

      <div className="mt-5 flex items-center">
        <Link
          to={`/vendor-profile/${vendor._id}`}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          {t("vendors.bookNow")}
          <span className="ltr:ml-4 rtl:mr-4">+</span>
        </Link>
      </div>
    </article>
  );
}

