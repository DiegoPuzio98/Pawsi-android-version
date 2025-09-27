import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LocationSelectorProps {
  country: string;
  province: string;
  onCountryChange: (country: string) => void;
  onProvinceChange: (province: string) => void;
  disabled?: boolean;
}

const countries = [
  "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica", "Ecuador", 
  "El Salvador", "Guatemala", "Honduras", "México", "Nicaragua", "Panamá", 
  "Paraguay", "Perú", "República Dominicana", "Uruguay", "Venezuela"
];

const provinces: Record<string, string[]> = {
  "Argentina": ["Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"],
  "Brasil": ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahía", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Río de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"],
  "México": ["Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"],
  "Colombia": ["Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"],
  "Chile": ["Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"],
  "Perú": ["Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque", "Lima", "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"],
  "Bolivia": ["Chuquisaca", "La Paz", "Cochabamba", "Oruro", "Potosí", "Tarija", "Santa Cruz", "Beni", "Pando"],
  "Costa Rica": ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"],
  "Ecuador": ["Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro", "Esmeraldas", "Galápagos", "Guayas", "Imbabura", "Loja", "Los Ríos", "Manabí", "Morona Santiago", "Napo", "Orellana", "Pastaza", "Pichincha", "Santa Elena", "Santo Domingo de los Tsáchilas", "Sucumbíos", "Tungurahua", "Zamora Chinchipe"],
  "El Salvador": ["Ahuachapán", "Santa Ana", "Sonsonate", "Chalatenango", "La Libertad", "San Salvador", "Cuscatlán", "La Paz", "Cabañas", "San Vicente", "Usulután", "San Miguel", "Morazán", "La Unión"],
  "Guatemala": ["Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula", "El Progreso", "Escuintla", "Guatemala", "Huehuetenango", "Izabal", "Jalapa", "Jutiapa", "Petén", "Quetzaltenango", "Quiché", "Retalhuleu", "Sacatepéquez", "San Marcos", "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa"],
  "Honduras": ["Atlántida", "Choluteca", "Colón", "Comayagua", "Copán", "Cortés", "El Paraíso", "Francisco Morazán", "Gracias a Dios", "Intibucá", "Islas de la Bahía", "La Paz", "Lempira", "Ocotepeque", "Olancho", "Santa Bárbara", "Valle", "Yoro"],
  "Nicaragua": ["Boaco", "Carazo", "Chinandega", "Chontales", "Costa Caribe Norte", "Costa Caribe Sur", "Estelí", "Granada", "Jinotega", "León", "Madriz", "Managua", "Masaya", "Matagalpa", "Nueva Segovia", "Rivas", "Río San Juan"],
  "Panamá": ["Bocas del Toro", "Coclé", "Colón", "Chiriquí", "Darién", "Herrera", "Los Santos", "Panamá", "Panamá Oeste", "Veraguas", "Emberá", "Guna Yala", "Ngäbe-Buglé"],
  "Paraguay": ["Alto Paraguay", "Alto Paraná", "Amambay", "Asunción", "Boquerón", "Caaguazú", "Caazapá", "Canindeyú", "Central", "Concepción", "Cordillera", "Guairá", "Itapúa", "Misiones", "Ñeembucú", "Paraguarí", "Presidente Hayes", "San Pedro"],
  "República Dominicana": ["Azua", "Bahoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte", "Elías Piña", "El Seibo", "Espaillat", "Hato Mayor", "Hermanas Mirabal", "Independencia", "La Altagracia", "La Romana", "La Vega", "María Trinidad Sánchez", "Monseñor Nouel", "Monte Cristi", "Monte Plata", "Pedernales", "Peravia", "Puerto Plata", "Samaná", "San Cristóbal", "San José de Ocoa", "San Juan", "San Pedro de Macorís", "Sánchez Ramírez", "Santiago", "Santiago Rodríguez", "Santo Domingo", "Valverde"],
  "Uruguay": ["Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno", "Flores", "Florida", "Lavalleja", "Maldonado", "Montevideo", "Paysandú", "Río Negro", "Rivera", "Rocha", "Salto", "San José", "Soriano", "Tacuarembó", "Treinta y Tres"],
  "Venezuela": ["Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo", "Cojedes", "Delta Amacuro", "Distrito Capital", "Falcón", "Guárico", "Lara", "La Guaira", "Mérida", "Miranda", "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira", "Trujillo", "Yaracuy", "Zulia"]
};

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  country,
  province,
  onCountryChange,
  onProvinceChange,
  disabled = false
}) => {
  const handleCountryChange = (newCountry: string) => {
    onCountryChange(newCountry);
    onProvinceChange(""); // Reset province when country changes
  };

  // 🔹 Filtramos solo Argentina
  const availableCountries = countries.filter(c => c === "Argentina");

  // 🔹 Filtramos solo Salta dentro de Argentina
  const availableProvinces = country === "Argentina"
    ? provinces["Argentina"].filter(p => p === "Salta")
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          País
        </label>
        <Select value={country} onValueChange={handleCountryChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu país" />
          </SelectTrigger>
          <SelectContent className="max-h-64 overflow-y-auto">
            {availableCountries.map((countryOption) => (
              <SelectItem key={countryOption} value={countryOption}>
                {countryOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Provincia/Estado
        </label>
        <Select 
          value={province} 
          onValueChange={onProvinceChange} 
          disabled={disabled || !country || availableProvinces.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona tu provincia/estado" />
          </SelectTrigger>
          <SelectContent className="max-h-64 overflow-y-auto">
            {availableProvinces.map((provinceOption) => (
              <SelectItem key={provinceOption} value={provinceOption}>
                {provinceOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
