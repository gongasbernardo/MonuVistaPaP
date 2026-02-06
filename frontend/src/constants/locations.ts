export const COUNTRIES = [
  "Portugal",
  "Espanha",
  "França",
  "Itália",
  "Grécia",
  "Alemanha",
  "Reino Unido",
  "Holanda",
  "Bélgica",
  "Polónia",
];

export const REGIONS_BY_COUNTRY: { [key: string]: string[] } = {
  Portugal: [
    "Lisboa", "Porto", "Algarve", "Alentejo", "Ribatejo",
    "Beira Interior", "Covilhã", "Minho",
  ],
  Espanha: [
    "Andaluzia", "Catalunha", "Madrid", "Valência", "Castela e Leão", "Bascos",
  ],
  França: [
    "Paris", "Lyon", "Marselha", "Toulouse", "Normandia", "Provença",
  ],
  Itália: [
    "Roma", "Milão", "Veneza", "Florença", "Nápoles", "Sicília", "Sardegna",
  ],
  Grécia: ["Atenas", "Tessálónica", "Creta", "Rodes"],
  Alemanha: [
    "Berlim", "Munique", "Hamburgo", "Colónia", "Frankfurt", "Nuremberga",
  ],
  "Reino Unido": ["Londres", "Manchester", "Liverpool", "Escócia", "Gales"],
  Holanda: ["Amesterdão", "Roterdão", "Utrecht", "Haia"],
  Bélgica: ["Bruxelas", "Antuérpia", "Gand"],
  Polónia: ["Varsóvia", "Cracóvia", "Gdańsk"],
};
