export const speciesList = ["dogs", "cats", "birds", "rodents", "fish"] as const;
export type SpeciesPlural = typeof speciesList[number];
export type SpeciesSingular = "dog" | "cat" | "bird" | "rodent" | "fish";

// Robust normalization supporting English (singular/plural) and Spanish (singular/plural)
const map: Record<string, SpeciesSingular> = {
  // English
  dogs: "dog",
  dog: "dog",
  cats: "cat",
  cat: "cat",
  birds: "bird",
  bird: "bird",
  rodents: "rodent",
  rodent: "rodent",
  fish: "fish",
  // Spanish
  perros: "dog",
  perro: "dog",
  gatos: "cat",
  gato: "cat",
  aves: "bird",
  ave: "bird",
  pajaros: "bird",
  pajaro: "bird",
  roedores: "rodent",
  roedor: "rodent",
  pez: "fish",
  peces: "fish",
};

export const normalizeSpecies = (value?: string | null): SpeciesSingular | null => {
  if (!value) return null;
  const key = value.toString().trim().toLowerCase();
  return map[key] ?? null;
};
