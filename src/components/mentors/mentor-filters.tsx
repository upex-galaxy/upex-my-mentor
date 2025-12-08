
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { useDebounce } from "use-debounce";

interface MentorFiltersProps {
  allSkills: string[];
}

const MAX_KEYWORD_LENGTH = 100;
const DEBOUNCE_MS = 300;

export function MentorFilters({ allSkills }: MentorFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // MYM-15: Changed from 'q' to 'keyword' param
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    searchParams.getAll("skill")
  );

  // MYM-15: Changed debounce from 500ms to 300ms per story requirements
  const [debouncedKeyword] = useDebounce(keyword, DEBOUNCE_MS);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    // MYM-15: Update keyword param (renamed from 'q')
    if (debouncedKeyword.trim()) {
      params.set("keyword", debouncedKeyword.trim());
    } else {
      params.delete("keyword");
    }

    // Reset page when filters change
    params.delete("page");
    params.delete("cursor");

    params.delete("skill");
    selectedSkills.forEach((skill) => params.append("skill", skill));

    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedKeyword, selectedSkills, pathname, router, searchParams]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setKeyword("");
    setSelectedSkills([]);
  };

  // MYM-15: Clear only the keyword search
  const clearKeyword = () => {
    setKeyword("");
  };

  const hasActiveFilters = keyword.trim() || selectedSkills.length > 0;

  return (
    <div data-testid="mentorFilters" className="sticky top-20 space-y-6">
      {/* Search - MYM-15: Enhanced keyword search */}
      <div>
        <label data-testid="search_label" className="text-sm font-medium mb-2 block">Buscar</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="keyword_search_input"
            placeholder="Buscar por nombre, bio, specialty..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            maxLength={MAX_KEYWORD_LENGTH}
            className="pl-9 pr-9"
          />
          {/* MYM-15: Clear keyword button */}
          {keyword && (
            <button
              data-testid="clear_keyword_button"
              onClick={clearKeyword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Skills Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label data-testid="skills_label" className="text-sm font-medium">Filtrar por Skills</label>
          {hasActiveFilters && (
            <button
              data-testid="clear_filters_button"
              onClick={clearFilters}
              className="text-xs text-primary hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {allSkills.map((skill) => (
            <Badge
              key={skill}
              data-testid="skill_badge"
              variant={selectedSkills.includes(skill) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {selectedSkills.length > 0 && (
        <div data-testid="active_filters_section">
          <label className="text-sm font-medium mb-2 block">
            Filtros Activos
          </label>
          <div className="space-y-2">
            {selectedSkills.map((skill) => (
              <div
                key={skill}
                data-testid="active_filter_item"
                className="flex items-center justify-between p-2 rounded-md bg-muted"
              >
                <span className="text-sm">{skill}</span>
                <button
                  data-testid="remove_filter_button"
                  onClick={() => toggleSkill(skill)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
