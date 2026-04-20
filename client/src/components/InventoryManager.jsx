import { useState } from "react";
import { useTranslation } from "react-i18next";

const DEFAULT_ITEMS = [
  { id: "chairs", nameKey: "chairs", qty: 280 },
  { id: "tables", nameKey: "tables", qty: 65 },
  { id: "lighting", nameKey: "lighting", qty: 24 },
];

export default function InventoryManager() {
  const { t } = useTranslation();
  const [items, setItems] = useState(DEFAULT_ITEMS);

  const updateQty = (id, nextQty) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: Math.max(0, Number(nextQty || 0)) } : item))
    );
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h3 className="text-lg font-bold text-gray-900">{t("dashboard.inventory.title")}</h3>
      <p className="mt-1 text-sm text-gray-600">{t("dashboard.inventory.subtitle")}</p>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">{t(`dashboard.inventory.items.${item.nameKey}`)}</p>
              <p className="text-xs text-gray-500">{t("dashboard.inventory.quantity")}</p>
            </div>
            <input
              type="number"
              min={0}
              value={item.qty}
              onChange={(e) => updateQty(item.id, e.target.value)}
              className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

