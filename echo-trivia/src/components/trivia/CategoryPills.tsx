"use client";

import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/types";
import type { Category } from "@/lib/types";

interface CategoryPillsProps {
  selected?: string;
  onSelect?: (category: Category) => void;
}

export function CategoryPills({ selected, onSelect }: CategoryPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => (
        <Badge
          key={category}
          variant={selected === category ? "default" : "outline"}
          className={`cursor-pointer transition-all ${
            selected === category
              ? "bg-primary text-primary-foreground"
              : "hover:bg-primary/10"
          }`}
          onClick={() => onSelect?.(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
}

