import { categories } from "@/lib/listings";

const categoryIcons: Record<string, string> = {
  "All stays": "⌂",
  Beachfront: "⌁",
  Cabins: "⌂",
  Design: "◇",
  Countryside: "♧",
  "Amazing views": "◉",
};

interface CategoryRailProps {
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryRail = ({ selected, onSelect }: CategoryRailProps) => {
  return (
    <nav className="category-rail" aria-label="Stay categories">
      {categories.map((category) => (
        <button
          aria-pressed={selected === category}
          className={`category-button${selected === category ? " is-active" : ""}`}
          key={category}
          onClick={() => onSelect(category)}
          type="button"
        >
          <span className="category-icon" aria-hidden="true">
            {categoryIcons[category]}
          </span>
          <span>{category}</span>
        </button>
      ))}
    </nav>
  );
};
