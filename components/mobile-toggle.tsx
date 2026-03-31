"use client";

export function MobileToggle({
  view,
  onChangeView,
}: {
  view: "list" | "map";
  onChangeView: (view: "list" | "map") => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-cream-dark bg-white md:hidden">
      <div className="flex">
        <button
          onClick={() => onChangeView("list")}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            view === "list"
              ? "border-b-2 border-terracotta text-terracotta"
              : "text-warm-gray"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          LIST VIEW
        </button>
        <button
          onClick={() => onChangeView("map")}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            view === "map"
              ? "border-b-2 border-terracotta text-terracotta"
              : "text-warm-gray"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          MAP VIEW
        </button>
      </div>
    </div>
  );
}
