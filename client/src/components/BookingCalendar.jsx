import { useTranslation } from "react-i18next";

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const MOCK_SLOTS = [
  { day: 3, labelKey: "dashboard.calendar.events.wedding", status: "booked" },
  { day: 8, labelKey: "dashboard.calendar.events.corporate", status: "hold" },
  { day: 14, labelKey: "dashboard.calendar.events.mini", status: "booked" },
  { day: 19, labelKey: "dashboard.calendar.events.seasonal", status: "available" },
  { day: 26, labelKey: "dashboard.calendar.events.wedding", status: "hold" },
];

function getStatusClasses(status) {
  if (status === "booked") return "bg-red-100 text-red-700 ring-1 ring-red-200";
  if (status === "hold") return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
  return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
}

export default function BookingCalendar() {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h3 className="text-lg font-bold text-gray-900">{t("dashboard.calendar.title")}</h3>
      <p className="mt-1 text-sm text-gray-600">{t("dashboard.calendar.subtitle")}</p>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center">
        {DAYS.map((dayKey) => (
          <div key={dayKey} className="rounded-md bg-gray-100 py-2 text-xs font-semibold text-gray-700">
            {t(`dashboard.calendar.days.${dayKey}`)}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
          const slot = MOCK_SLOTS.find((item) => item.day === day);
          return (
            <div key={day} className="min-h-20 rounded-lg border border-gray-200 p-2 text-xs">
              <div className="font-semibold text-gray-700">{day}</div>
              {slot ? (
                <div className={`mt-1 rounded px-2 py-1 ${getStatusClasses(slot.status)}`}>
                  {t(slot.labelKey)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

