import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { breedsBySpecies, type BreedType } from "@/utils/breeds";
import { normalizeSpecies, type SpeciesSingular } from "@/utils/species";

interface BreedSelectorProps {
  species: string;
  breed: string;
  onBreedChange: (breed: string) => void;
}

export function BreedSelector({ species, breed, onBreedChange }: BreedSelectorProps) {
  const normalizedSpecies = normalizeSpecies(species) as SpeciesSingular;
  const breeds = normalizedSpecies ? breedsBySpecies[normalizedSpecies] || [] : [];

  return (
    <Select value={breed} onValueChange={onBreedChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecciona la raza" />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {breeds.map((breedOption) => (
          <SelectItem key={breedOption} value={breedOption}>
            {breedOption}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}