// Complete breed lists by species
export const breedsBySpecies = {
  dog: [
    'Desconocido', 'Sin raza definida',
    'Mestizo', 'Labrador', 'Golden Retriever', 'Pastor Alemán', 'Bulldog Francés', 'Bulldog Inglés',
    'Chihuahua', 'Yorkshire Terrier', 'Poodle', 'Caniche', 'Rottweiler', 'Boxer',
    'Dálmata', 'Beagle', 'Husky Siberiano', 'Border Collie', 'Cocker Spaniel',
    'Dachshund', 'Salchicha', 'Shih Tzu', 'Maltés', 'Pug', 'Carlino',
    'Schnauzer', 'Doberman', 'Gran Danés', 'San Bernardo', 'Akita', 'Chow Chow',
    'Shar Pei', 'Pitbull', 'Staffordshire Terrier', 'Bull Terrier',
    'Jack Russell Terrier', 'Fox Terrier', 'Basset Hound', 'Bloodhound',
    'Weimaraner', 'Pointer', 'Setter', 'Spaniel', 'Mastín', 'Ovejero',
    'Pastor Belga', 'Pastor Australiano', 'Bichón', 'Papillón', 'Pomerania'
  ],
  cat: [
    'Desconocido', 'Sin raza definida',
    'Mestizo', 'Común Europeo',
    'Persa', 'Siamés', 'Maine Coon', 'British Shorthair', 'Ragdoll',
    'Bengalí', 'Sphynx', 'Scottish Fold', 'Abisinio', 'Russian Blue',
    'Oriental', 'Birmano', 'Noruego del Bosque', 'Angora', 'Himalayo',
    'Burmés', 'Exotic Shorthair', 'Devon Rex', 'Cornish Rex',
    'Manx', 'Bombay', 'Tonkinés', 'Balinés', 'Javanés',
    'Ocicat', 'Savannah', 'Munchkin', 'Curl Americano', 'Bobtail'
  ],
  bird: [
    'Desconocido', 'Sin raza definida',
    'Canario', 'Periquito', 'Cacatúa', 'Loro',
    'Agapornis', 'Ninfa', 'Jilguero', 'Diamante', 'Mandarín',
    'Pinzón', 'Cardenal', 'Ruiseñor', 'Gorrión', 'Paloma',
    'Tórtola', 'Cotorra', 'Papagayo', 'Guacamayo', 'Amazona',
    'Yacaré', 'Benteveo', 'Hornero', 'Calandria', 'Zorzal'
  ],
  rodent: [
    'Desconocido', 'Sin raza definida',
    'Hamster', 'Cobayo', 'Chinchilla', 'Rata',
    'Ratón', 'Jerbo', 'Degú', 'Conejo', 'Hurón',
    'Ardilla', 'Erizo', 'Capibara'
  ],
  fish: [
    'Desconocido', 'Sin raza definida',
    'Goldfish', 'Betta', 'Guppy', 'Molly',
    'Platy', 'Espada', 'Tetra', 'Ángel', 'Disco',
    'Cebra', 'Barbo', 'Corydora', 'Pleco', 'Oscar',
    'Ciclido', 'Koi', 'Carpa'
  ]
} as const;

export const allColors = [
  'Negro', 'Blanco', 'Marrón', 'Gris', 'Dorado', 'Rubio',
  'Rojizo', 'Naranja', 'Amarillo', 'Crema', 'Beige', 'Canela',
  'Chocolate', 'Café', 'Plateado',
  'Manchado', 'Rayado', 'Atigrado', 'Tricolor', 'Bicolor'
] as const;

export type BreedType = typeof breedsBySpecies[keyof typeof breedsBySpecies][number];
export type ColorType = typeof allColors[number];