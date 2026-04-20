import { useTranslation } from "react-i18next";

const EVENT_TYPES = [
  { value: "", key: "allEventTypes" },
  { value: "wedding", key: "wedding" },
  { value: "corporate", key: "corporate" },
  { value: "mini_event", key: "mini" },
  { value: "seasonal_venue", key: "seasonal" },
];

export default function SearchFilter({ value, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <label className="block text-sm font-semibold text-gray-700" htmlFor="eventType">
        {t("searchFilters.eventType")}
      </label>
      <select
        id="eventType"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
      >
        {EVENT_TYPES.map((item) => (
          <option key={item.key} value={item.value}>
            {t(`eventTypes.${item.key}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

