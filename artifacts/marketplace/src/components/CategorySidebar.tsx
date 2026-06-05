import { Link, useLocation } from "wouter";
import {
  Car, Home, Smartphone, Sofa, Shirt, Trophy, Briefcase, Wrench, PawPrint, Tag, LayoutGrid
} from "lucide-react";
import type { Category } from "@workspace/api-client-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Car, Home, Smartphone, Sofa, Shirt, Trophy, Briefcase, Wrench, PawPrint, Tag,
};

interface CategorySidebarProps {
  categories: Category[];
  activeSlug?: string;
  onSelect?: (slug: string | undefined) => void;
}

export default function CategorySidebar({ categories, activeSlug, onSelect }: CategorySidebarProps) {
  const [, navigate] = useLocation();

  function handleSelect(slug: string | undefined) {
    if (onSelect) {
      onSelect(slug);
    } else {
      navigate(slug ? `/listings?category=${slug}` : "/listings");
    }
  }

  return (
    <div className="bg-card rounded-xl border border-card-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-sm text-foreground">Categorías</h2>
      </div>
      <div className="py-1">
        <button
          onClick={() => handleSelect(undefined)}
          className={`category-item cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 text-sm ${
            !activeSlug ? "active font-medium" : "text-foreground"
          }`}
        >
          <LayoutGrid className="w-4 h-4 shrink-0" />
          <span>Todos</span>
        </button>
        {categories?.map?.((cat) => {
          const Icon = ICON_MAP[cat.icon] ?? Tag;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.slug)}
              className={`category-item cursor-pointer w-full flex items-center justify-between px-4 py-2.5 text-sm ${
                activeSlug === cat.slug ? "active font-medium" : "text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{cat.name}</span>
              </div>
              {cat?.listingCount! > 0 && (
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {cat.listingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
