import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X } from "lucide-react";
import { allColors } from "@/utils/breeds";
import { speciesList } from "@/utils/species";
import { useLanguage } from "@/contexts/LanguageContext";
import { BreedSelector } from "@/components/BreedSelector";

interface AdvancedSearchProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  speciesFilter: string;
  onSpeciesFilterChange: (species: string) => void;
  colorFilters: string[];
  onColorFiltersChange: (colors: string[]) => void;
  locationFilter: string;
  onLocationFilterChange: (location: string) => void;
  // Optional breed filter support
  breedFilter?: string;
  onBreedFilterChange?: (breed: string) => void;
  // Optional sex filter support
  sexFilter?: string;
  onSexFilterChange?: (sex: string) => void;
  onReset: () => void;
}

export function AdvancedSearch({
  searchTerm,
  onSearchTermChange,
  speciesFilter,
  onSpeciesFilterChange,
  colorFilters,
  onColorFiltersChange,
  locationFilter,
  onLocationFilterChange,
  // optional breed filter
  breedFilter,
  onBreedFilterChange,
  // optional sex filter
  sexFilter,
  onSexFilterChange,
  onReset
}: AdvancedSearchProps) {
  const { t } = useLanguage();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleColor = (color: string) => {
    if (colorFilters.includes(color)) {
      onColorFiltersChange(colorFilters.filter(c => c !== color));
    } else {
      onColorFiltersChange([...colorFilters, color]);
    }
  };

  const removeColor = (color: string) => {
    onColorFiltersChange(colorFilters.filter(c => c !== color));
  };

  const hasActiveFilters = speciesFilter !== "all" || !!breedFilter || !!sexFilter || colorFilters.length > 0 || !!locationFilter;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {/* Search input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('action.search')}
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Advanced filters */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filtros avanzados</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={onReset}>
                    Limpiar
                  </Button>
                )}
              </div>

              {/* Species filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Especie</label>
                <Select value={speciesFilter} onValueChange={onSpeciesFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las especies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las especies</SelectItem>
                    {speciesList.map((species) => (
                      <SelectItem key={species} value={species}>
                        {t(`species.${species}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Optional Breed filter */}
              {onBreedFilterChange && (
                <div>
                  <label className="block text-sm font-medium mb-2">{t('form.breed')}</label>
                  <BreedSelector
                    species={speciesFilter}
                    breed={breedFilter || ''}
                    onBreedChange={(b) => onBreedFilterChange(b)}
                  />
                </div>
              )}

              {/* Optional Sex filter */}
              {onSexFilterChange && (
                <div>
                  <label className="block text-sm font-medium mb-2">Sexo</label>
                  <Select value={sexFilter || "all"} onValueChange={(value) => onSexFilterChange(value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los sexos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los sexos</SelectItem>
                      <SelectItem value="macho">Macho</SelectItem>
                      <SelectItem value="hembra">Hembra</SelectItem>
                      <SelectItem value="no sé">No sé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Location filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Ubicación</label>
                <Input
                  placeholder="Ej: Villa Crespo, Palermo..."
                  value={locationFilter}
                  onChange={(e) => onLocationFilterChange(e.target.value)}
                />
              </div>

              {/* Color filters */}
              <div>
                <label className="block text-sm font-medium mb-2">Colores</label>
                <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                  {allColors.map((color) => (
                    <Button
                      key={color}
                      variant={colorFilters.includes(color) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleColor(color)}
                      className="text-xs h-7"
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {speciesFilter !== "all" && (
            <Badge variant="secondary" className="text-xs">
              {t(`species.${speciesFilter}`)}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onSpeciesFilterChange("all")}
              />
            </Badge>
          )}
          {breedFilter && onBreedFilterChange && (
            <Badge variant="secondary" className="text-xs">
              🐾 {breedFilter}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onBreedFilterChange("")}
              />
            </Badge>
          )}
          {sexFilter && onSexFilterChange && (
            <Badge variant="secondary" className="text-xs">
              ⚥ {sexFilter}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onSexFilterChange("")}
              />
            </Badge>
          )}
          {locationFilter && (
            <Badge variant="secondary" className="text-xs">
              📍 {locationFilter}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onLocationFilterChange("")}
              />
            </Badge>
          )}
          {colorFilters.map((color) => (
            <Badge key={color} variant="secondary" className="text-xs">
              🎨 {color}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => removeColor(color)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}