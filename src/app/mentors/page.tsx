"use client";

import { useState, useMemo } from "react";
import { mentors, getAllSkills, searchMentors } from "@/lib/data";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MentorCard } from "@/components/mentors/mentor-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const allSkills = useMemo(() => getAllSkills(), []);

  const filteredMentors = useMemo(() => {
    let results = mentors;

    // Filter by search query
    if (searchQuery.trim()) {
      results = searchMentors(searchQuery);
    }

    // Filter by selected skills
    if (selectedSkills.length > 0) {
      results = results.filter((mentor) =>
        selectedSkills.some((selectedSkill) =>
          mentor.profile.specialties.some(
            (skill) => skill.toLowerCase() === selectedSkill.toLowerCase()
          )
        )
      );
    }

    return results;
  }, [searchQuery, selectedSkills]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSkills([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-violet-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Explorar Mentores</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Encuentra al mentor perfecto para acelerar tu carrera tech. Todos
              nuestros mentores son verificados y expertos en sus áreas.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, skill..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Skills Filter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      Filtrar por Skills
                    </label>
                    {(searchQuery || selectedSkills.length > 0) && (
                      <button
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
                        variant={
                          selectedSkills.includes(skill) ? "default" : "outline"
                        }
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Filtros Activos
                    </label>
                    <div className="space-y-2">
                      {selectedSkills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center justify-between p-2 rounded-md bg-muted"
                        >
                          <span className="text-sm">{skill}</span>
                          <button
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
            </div>

            {/* Mentors Grid */}
            <div className="lg:col-span-3">
              {/* Results count */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  {filteredMentors.length} mentor
                  {filteredMentors.length !== 1 ? "es" : ""} encontrado
                  {filteredMentors.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Mentors grid */}
              {filteredMentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredMentors.map((mentor) => (
                    <MentorCard key={mentor.id} mentor={mentor} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No se encontraron mentores con los filtros seleccionados.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-primary hover:underline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
