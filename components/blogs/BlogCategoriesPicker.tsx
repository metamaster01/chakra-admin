"use client";

export default function BlogCategoriesPicker({
  categories,
  selectedIds,
  onChange,
}: {
  categories: any[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  if (categories.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">
        No categories available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Categories
      </label>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isSelected = selectedIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              className={`
                px-3 py-1.5 rounded-xl text-sm font-medium transition
                ${
                  isSelected
                    ? "bg-[#4B2DB3] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {cat.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}