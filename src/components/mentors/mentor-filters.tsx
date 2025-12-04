
"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { useDebounce } from "use-debounce";

interface MentorFiltersProps {
  allSkills: string[];
}

export function MentorFilters({ allSkills }: MentorFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    searchParams.getAll("skill")
  );

  const [debouncedQuery] = useDebounce(query, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }

    params.delete("skill");
    selectedSkills.forEach((skill) => params.append("skill", skill));

    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedQuery, selectedSkills, pathname, router, searchParams]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedSkills([]);
  };

  const hasActiveFilters = query || selectedSkills.length > 0;

  return (
    <div data-testid="mentorFilters" className="sticky top-20 space-y-6">
      {/* Search */}
      <div>
        <label data-testid="search_label" className="text-sm font-medium mb-2 block">Buscar</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-testid="search_input"
            placeholder="Buscar por nombre, skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
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
