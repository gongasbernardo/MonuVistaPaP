import { useState, useEffect, lazy, Suspense } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
} from "@ionic/react";
import {
  trophyOutline,
  locationOutline,
} from "ionicons/icons";
import "leaflet/dist/leaflet.css";
import authService from "../services/authService";
import challengeService from "../services/challengeService";
import axios from "axios";
import { API_URL } from "../config";
import Skeleton from "../components/Skeleton";
import "./Home.css";

// Lazy-loaded map component for performance
const MonumentMap = lazy(() => import("../components/MonumentMap"));

interface MapMonument {
  name: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  century: string;
  style: string;
}

const MAP_MONUMENTS: MapMonument[] = [
  // ========== PORTUGAL CONTINENTAL ==========
  // Lisboa e arredores
  { name: "Torre de Belém", location: "Lisboa", country: "Portugal", lat: 38.6916, lng: -9.2160, century: "XVI", style: "Manuelino" },
  { name: "Mosteiro dos Jerónimos", location: "Lisboa", country: "Portugal", lat: 38.6979, lng: -9.2057, century: "XVI", style: "Manuelino" },
  { name: "Castelo de São Jorge", location: "Lisboa", country: "Portugal", lat: 38.7139, lng: -9.1334, century: "XI", style: "Medieval" },
  { name: "Aqueduto das Águas Livres", location: "Lisboa", country: "Portugal", lat: 38.7330, lng: -9.1700, century: "XVIII", style: "Barroco" },
  { name: "Panteão Nacional", location: "Lisboa", country: "Portugal", lat: 38.7148, lng: -9.1246, century: "XVII", style: "Barroco" },
  { name: "Elevador de Santa Justa", location: "Lisboa", country: "Portugal", lat: 38.7121, lng: -9.1393, century: "XX", style: "Neo-Gótico" },
  { name: "Basílica da Estrela", location: "Lisboa", country: "Portugal", lat: 38.7138, lng: -9.1597, century: "XVIII", style: "Barroco/Neoclássico" },
  { name: "Convento do Carmo", location: "Lisboa", country: "Portugal", lat: 38.7126, lng: -9.1406, century: "XIV", style: "Gótico" },
  { name: "Palácio da Ajuda", location: "Lisboa", country: "Portugal", lat: 38.7053, lng: -9.1959, century: "XIX", style: "Neoclássico" },
  { name: "Palácio de Queluz", location: "Queluz", country: "Portugal", lat: 38.7508, lng: -9.2590, century: "XVIII", style: "Rococó" },
  { name: "Palácio de Mafra", location: "Mafra", country: "Portugal", lat: 38.9368, lng: -9.3265, century: "XVIII", style: "Barroco" },
  // Sintra
  { name: "Palácio da Pena", location: "Sintra", country: "Portugal", lat: 38.7876, lng: -9.3907, century: "XIX", style: "Romântico" },
  { name: "Castelo dos Mouros", location: "Sintra", country: "Portugal", lat: 38.7928, lng: -9.3892, century: "VIII", style: "Mourisco" },
  { name: "Palácio Nacional de Sintra", location: "Sintra", country: "Portugal", lat: 38.7975, lng: -9.3907, century: "XIV", style: "Medieval/Manuelino" },
  { name: "Quinta da Regaleira", location: "Sintra", country: "Portugal", lat: 38.7963, lng: -9.3958, century: "XX", style: "Neomanuelino" },
  { name: "Palácio de Monserrate", location: "Sintra", country: "Portugal", lat: 38.7914, lng: -9.4199, century: "XIX", style: "Romântico/Neogótico" },
  // Porto e Norte
  { name: "Torre dos Clérigos", location: "Porto", country: "Portugal", lat: 41.1458, lng: -8.6146, century: "XVIII", style: "Barroco" },
  { name: "Ponte Dom Luís I", location: "Porto", country: "Portugal", lat: 41.1403, lng: -8.6094, century: "XIX", style: "Ferro" },
  { name: "Sé do Porto", location: "Porto", country: "Portugal", lat: 41.1430, lng: -8.6113, century: "XII", style: "Românico" },
  { name: "Estação de São Bento", location: "Porto", country: "Portugal", lat: 41.1455, lng: -8.6103, century: "XX", style: "Beaux-Arts" },
  { name: "Igreja de São Francisco", location: "Porto", country: "Portugal", lat: 41.1410, lng: -8.6158, century: "XIV", style: "Gótico/Barroco" },
  { name: "Palácio da Bolsa", location: "Porto", country: "Portugal", lat: 41.1413, lng: -8.6155, century: "XIX", style: "Neoclássico" },
  { name: "Castelo de Guimarães", location: "Guimarães", country: "Portugal", lat: 41.4478, lng: -8.2904, century: "X", style: "Medieval" },
  { name: "Paço dos Duques de Bragança", location: "Guimarães", country: "Portugal", lat: 41.4475, lng: -8.2905, century: "XV", style: "Senhorial" },
  { name: "Sé de Braga", location: "Braga", country: "Portugal", lat: 41.5501, lng: -8.4270, century: "XI", style: "Românico" },
  { name: "Bom Jesus do Monte", location: "Braga", country: "Portugal", lat: 41.5547, lng: -8.3768, century: "XVIII", style: "Barroco" },
  { name: "Citânia de Briteiros", location: "Guimarães", country: "Portugal", lat: 41.5258, lng: -8.3153, century: "I a.C.", style: "Castreja" },
  { name: "Mosteiro de Tibães", location: "Braga", country: "Portugal", lat: 41.5755, lng: -8.4578, century: "XI", style: "Barroco" },
  { name: "Castelo de Bragança", location: "Bragança", country: "Portugal", lat: 41.8062, lng: -6.7513, century: "XII", style: "Medieval" },
  { name: "Domus Municipalis", location: "Bragança", country: "Portugal", lat: 41.8057, lng: -6.7506, century: "XII", style: "Românico" },
  { name: "Ponte de Lima — Ponte Romana", location: "Ponte de Lima", country: "Portugal", lat: 41.7680, lng: -8.5836, century: "I", style: "Romano" },
  { name: "Igreja de São Gonçalo", location: "Amarante", country: "Portugal", lat: 41.2718, lng: -8.0818, century: "XVI", style: "Renascença/Barroco" },
  { name: "Castelo de Chaves", location: "Chaves", country: "Portugal", lat: 41.7396, lng: -7.4712, century: "XIV", style: "Medieval" },
  { name: "Mosteiro de Leça do Balio", location: "Matosinhos", country: "Portugal", lat: 41.2055, lng: -8.6193, century: "XII", style: "Românico/Gótico" },
  { name: "Forte de São João Baptista", location: "Vila do Conde", country: "Portugal", lat: 41.3540, lng: -8.7479, century: "XVI", style: "Militar" },
  // Centro
  { name: "Universidade de Coimbra", location: "Coimbra", country: "Portugal", lat: 40.2074, lng: -8.4260, century: "XIII", style: "Barroco" },
  { name: "Sé Velha de Coimbra", location: "Coimbra", country: "Portugal", lat: 40.2088, lng: -8.4280, century: "XII", style: "Românico" },
  { name: "Mosteiro de Santa Clara-a-Velha", location: "Coimbra", country: "Portugal", lat: 40.2031, lng: -8.4348, century: "XIII", style: "Gótico" },
  { name: "Convento de Cristo", location: "Tomar", country: "Portugal", lat: 39.6036, lng: -8.4189, century: "XII", style: "Templário" },
  { name: "Castelo de Almourol", location: "Vila Nova da Barquinha", country: "Portugal", lat: 39.4614, lng: -8.3838, century: "XII", style: "Templário" },
  { name: "Castelo de Óbidos", location: "Óbidos", country: "Portugal", lat: 39.3622, lng: -9.1571, century: "XII", style: "Medieval" },
  { name: "Ruínas de Conímbriga", location: "Condeixa-a-Nova", country: "Portugal", lat: 40.0981, lng: -8.4911, century: "I a.C.", style: "Romano" },
  { name: "Mosteiro da Batalha", location: "Batalha", country: "Portugal", lat: 39.6601, lng: -8.8244, century: "XIV", style: "Gótico" },
  { name: "Mosteiro de Alcobaça", location: "Alcobaça", country: "Portugal", lat: 39.5485, lng: -8.9787, century: "XII", style: "Gótico Cisterciense" },
  { name: "Castelo de Leiria", location: "Leiria", country: "Portugal", lat: 39.7463, lng: -8.8071, century: "XII", style: "Medieval" },
  { name: "Sé da Guarda", location: "Guarda", country: "Portugal", lat: 40.5366, lng: -7.2672, century: "XIV", style: "Gótico" },
  { name: "Castelo de Monsanto", location: "Monsanto", country: "Portugal", lat: 40.0389, lng: -7.1128, century: "XII", style: "Medieval" },
  { name: "Castelo de Marvão", location: "Marvão", country: "Portugal", lat: 39.3936, lng: -7.3766, century: "XIII", style: "Medieval" },
  { name: "Vila Romana do Rabaçal", location: "Penela", country: "Portugal", lat: 40.0300, lng: -8.3833, century: "IV", style: "Romano" },
  { name: "Castelo de Sortelha", location: "Sortelha", country: "Portugal", lat: 40.3277, lng: -7.2105, century: "XIII", style: "Medieval" },
  { name: "Aldeia Histórica de Piódão", location: "Arganil", country: "Portugal", lat: 40.2286, lng: -7.8314, century: "XVII", style: "Tradicional" },
  { name: "Sé de Viseu", location: "Viseu", country: "Portugal", lat: 40.6612, lng: -7.9136, century: "XII", style: "Românico/Manuelino" },
  { name: "Castelo de Pombal", location: "Pombal", country: "Portugal", lat: 39.9142, lng: -8.6280, century: "XII", style: "Templário" },
  { name: "Castelo Rodrigo", location: "Figueira de Castelo Rodrigo", country: "Portugal", lat: 40.8777, lng: -6.9637, century: "XIII", style: "Medieval" },
  { name: "Castelo de Trancoso", location: "Trancoso", country: "Portugal", lat: 40.7788, lng: -7.3504, century: "X", style: "Medieval" },
  // Alentejo
  { name: "Sé de Évora", location: "Évora", country: "Portugal", lat: 38.5714, lng: -7.9068, century: "XIII", style: "Gótico" },
  { name: "Templo Romano de Évora", location: "Évora", country: "Portugal", lat: 38.5730, lng: -7.9073, century: "I", style: "Romano" },
  { name: "Capela dos Ossos", location: "Évora", country: "Portugal", lat: 38.5693, lng: -7.9087, century: "XVI", style: "Renascença" },
  { name: "Cromeleque dos Almendres", location: "Évora", country: "Portugal", lat: 38.5557, lng: -8.0593, century: "V milénio a.C.", style: "Megalítico" },
  { name: "Castelo de Estremoz", location: "Estremoz", country: "Portugal", lat: 38.8425, lng: -7.5886, century: "XIII", style: "Medieval" },
  { name: "Castelo de Arraiolos", location: "Arraiolos", country: "Portugal", lat: 38.7252, lng: -7.9864, century: "XIV", style: "Medieval" },
  { name: "Castelo de Monsaraz", location: "Monsaraz", country: "Portugal", lat: 38.4429, lng: -7.3804, century: "XIII", style: "Medieval" },
  { name: "Fortaleza de Elvas", location: "Elvas", country: "Portugal", lat: 38.8803, lng: -7.1628, century: "XVII", style: "Militar/Vauban" },
  { name: "Castelo de Beja", location: "Beja", country: "Portugal", lat: 38.0153, lng: -7.8615, century: "XIII", style: "Medieval" },
  { name: "Ponte Romana de Alter do Chão", location: "Alter do Chão", country: "Portugal", lat: 39.1989, lng: -7.6575, century: "II", style: "Romano" },
  { name: "Castelo de Viana do Alentejo", location: "Viana do Alentejo", country: "Portugal", lat: 38.3364, lng: -8.0001, century: "XIII", style: "Medieval" },
  // Algarve
  { name: "Castelo de Silves", location: "Silves", country: "Portugal", lat: 37.1891, lng: -8.4388, century: "VIII", style: "Mourisco" },
  { name: "Fortaleza de Sagres", location: "Sagres", country: "Portugal", lat: 36.9934, lng: -8.9509, century: "XV", style: "Militar" },
  { name: "Igreja de São Lourenço", location: "Almancil", country: "Portugal", lat: 37.0765, lng: -8.0190, century: "XVIII", style: "Barroco/Azulejos" },
  { name: "Forte de São João do Arade", location: "Ferragudo", country: "Portugal", lat: 37.1190, lng: -8.5260, century: "XVI", style: "Militar" },
  { name: "Castelo de Tavira", location: "Tavira", country: "Portugal", lat: 37.1268, lng: -7.6502, century: "XIII", style: "Medieval" },
  { name: "Castelo de Aljezur", location: "Aljezur", country: "Portugal", lat: 37.3182, lng: -8.8019, century: "X", style: "Mourisco" },
  { name: "Ruínas Romanas de Milreu", location: "Estoi", country: "Portugal", lat: 37.0510, lng: -7.8970, century: "I", style: "Romano" },
  // ========== AÇORES ==========
  { name: "Forte de São Brás", location: "Ponta Delgada, São Miguel", country: "Portugal", lat: 37.7399, lng: -25.6687, century: "XVI", style: "Militar" },
  { name: "Portas da Cidade", location: "Ponta Delgada, São Miguel", country: "Portugal", lat: 37.7393, lng: -25.6687, century: "XVIII", style: "Barroco" },
  { name: "Igreja de São Sebastião", location: "Ponta Delgada, São Miguel", country: "Portugal", lat: 37.7397, lng: -25.6708, century: "XVI", style: "Manuelino/Barroco" },
  { name: "Convento de Nossa Senhora da Esperança", location: "Ponta Delgada, São Miguel", country: "Portugal", lat: 37.7391, lng: -25.6694, century: "XVI", style: "Religioso" },
  { name: "Igreja de São Pedro", location: "Ponta Delgada, São Miguel", country: "Portugal", lat: 37.7415, lng: -25.6720, century: "XVI", style: "Manuelino" },
  { name: "Ermida de Nossa Senhora da Paz", location: "Vila Franca do Campo, São Miguel", country: "Portugal", lat: 37.7148, lng: -25.4330, century: "XVIII", style: "Barroco" },
  { name: "Torre Sineira de Ribeira Grande", location: "Ribeira Grande, São Miguel", country: "Portugal", lat: 37.8170, lng: -25.5218, century: "XVIII", style: "Barroco" },
  // Terceira — coordenadas exatas
  { name: "Centro Histórico de Angra do Heroísmo", location: "Angra do Heroísmo, Terceira", country: "Portugal", lat: 38.6569, lng: -27.2237, century: "XVI", style: "Património UNESCO" },
  { name: "Sé de Angra do Heroísmo", location: "Angra do Heroísmo, Terceira", country: "Portugal", lat: 38.6563, lng: -27.2219, century: "XVI", style: "Religioso" },
  { name: "Monte Brasil", location: "Angra do Heroísmo, Terceira", country: "Portugal", lat: 38.645348, lng: -27.225827, century: "-", style: "Natureza/Vulcânico" },
  { name: "Castelo de São João Baptista", location: "Angra do Heroísmo, Terceira", country: "Portugal", lat: 38.6528, lng: -27.2355, century: "XVI", style: "Militar" },
  { name: "Castelo de São Sebastião", location: "Angra do Heroísmo, Terceira", country: "Portugal", lat: 38.6588, lng: -27.2135, century: "XVI", style: "Militar" },
  { name: "Convento de São Francisco (Museu de Angra)", location: "Angra do Heroísmo, Terceira", country: "Portugal", lat: 38.6558, lng: -27.2231, century: "XVII", style: "Cultural" },
  { name: "Palácio dos Capitães-Generais", location: "Angra do Heroísmo, Terceira", country: "Portugal", lat: 38.6566, lng: -27.2228, century: "XVII", style: "Histórico" },
  { name: "Algar do Carvão", location: "Terceira", country: "Portugal", lat: 38.7336, lng: -27.2706, century: "-", style: "Geologia Vulcânica" },
  { name: "Gruta do Natal", location: "Terceira", country: "Portugal", lat: 38.7393, lng: -27.2765, century: "-", style: "Geologia Vulcânica" },
  { name: "Furnas do Enxofre", location: "Terceira", country: "Portugal", lat: 38.7245, lng: -27.2555, century: "-", style: "Geologia Vulcânica" },
  { name: "Caldeira de Guilherme Moniz", location: "Terceira", country: "Portugal", lat: 38.7300, lng: -27.2500, century: "-", style: "Geologia Vulcânica" },
  { name: "Serra de Santa Bárbara", location: "Terceira", country: "Portugal", lat: 38.7303, lng: -27.3215, century: "-", style: "Natureza/Montanha" },
  { name: "Miradouro da Serra do Cume", location: "Terceira", country: "Portugal", lat: 38.7202, lng: -27.1655, century: "-", style: "Miradouro" },
  { name: "Miradouro do Facho", location: "Praia da Vitória, Terceira", country: "Portugal", lat: 38.7335, lng: -27.0583, century: "-", style: "Miradouro" },
  { name: "Miradouro da Ponta do Queimado", location: "Terceira", country: "Portugal", lat: 38.7830, lng: -27.3500, century: "-", style: "Miradouro" },
  { name: "Miradouro da Alagoa", location: "Terceira", country: "Portugal", lat: 38.7160, lng: -27.1980, century: "-", style: "Miradouro" },
  { name: "Piscinas Naturais dos Biscoitos", location: "Biscoitos, Terceira", country: "Portugal", lat: 38.7902, lng: -27.2525, century: "-", style: "Zona Balnear" },
  { name: "Praia da Vitória", location: "Praia da Vitória, Terceira", country: "Portugal", lat: 38.7337, lng: -27.0667, century: "-", style: "Praia" },
  { name: "Quatro Ribeiras", location: "Terceira", country: "Portugal", lat: 38.7930, lng: -27.1900, century: "-", style: "Zona Balnear" },
  { name: "Calheta dos Lagadores", location: "Terceira", country: "Portugal", lat: 38.6760, lng: -27.3500, century: "-", style: "Costa Rochosa" },
  { name: "Impérios do Divino Espírito Santo", location: "Terceira", country: "Portugal", lat: 38.6500, lng: -27.2200, century: "XVIII", style: "Cultural" },
  { name: "Igreja da Conceição", location: "Angra do Heroísmo, Terceira", country: "Portugal", lat: 38.6600, lng: -27.2150, century: "XVII", style: "Religioso" },
  { name: "Santuário de Nossa Sra. dos Milagres", location: "Serreta, Terceira", country: "Portugal", lat: 38.7650, lng: -27.3500, century: "XVIII", style: "Religioso" },
  { name: "Lagoa das Patas", location: "Terceira", country: "Portugal", lat: 38.7520, lng: -27.2850, century: "-", style: "Natureza/Lagoa" },
  { name: "Mata da Serreta", location: "Serreta, Terceira", country: "Portugal", lat: 38.7700, lng: -27.3500, century: "-", style: "Natureza/Floresta" },
  { name: "Rocha do Chambre", location: "Terceira", country: "Portugal", lat: 38.7600, lng: -27.2600, century: "-", style: "Geologia Vulcânica" },
  { name: "Ponta das Contendas", location: "Terceira", country: "Portugal", lat: 38.6410, lng: -27.0900, century: "-", style: "Reserva Natural" },
  { name: "Igreja de São Salvador", location: "Santa Cruz da Graciosa, Graciosa", country: "Portugal", lat: 39.0348, lng: -28.0000, century: "XVI", style: "Manuelino" },
  { name: "Ermida de Nossa Sra. da Ajuda", location: "Santa Cruz da Graciosa, Graciosa", country: "Portugal", lat: 39.0350, lng: -28.0020, century: "XVI", style: "Religioso" },
  { name: "Igreja de Santa Bárbara", location: "Manadas, São Jorge", country: "Portugal", lat: 38.6748, lng: -28.0697, century: "XVIII", style: "Barroco" },
  { name: "Forte de Santa Cruz", location: "Horta, Faial", country: "Portugal", lat: 38.5333, lng: -28.7250, century: "XVI", style: "Militar" },
  { name: "Igreja Matriz do Santíssimo Salvador", location: "Horta, Faial", country: "Portugal", lat: 38.5350, lng: -28.7250, century: "XVII", style: "Barroco" },
  { name: "Igreja de São Roque", location: "São Roque do Pico, Pico", country: "Portugal", lat: 38.4575, lng: -28.3697, century: "XVII", style: "Barroco" },
  { name: "Paisagem da Vinha do Pico", location: "Criação Velha, Pico", country: "Portugal", lat: 38.4500, lng: -28.4290, century: "XV", style: "Paisagem Cultural UNESCO" },
  { name: "Museu dos Baleeiros", location: "Lajes do Pico, Pico", country: "Portugal", lat: 38.3897, lng: -28.2595, century: "XIX", style: "Industrial/Cultural" },
  { name: "Forte de São Brás (Flores)", location: "Santa Cruz das Flores, Flores", country: "Portugal", lat: 39.4533, lng: -31.1878, century: "XVI", style: "Militar" },
  { name: "Igreja de Nossa Sra. da Conceição", location: "Vila do Corvo, Corvo", country: "Portugal", lat: 39.6745, lng: -31.1107, century: "XVII", style: "Religioso" },
  // ========== MADEIRA ==========
  { name: "Sé do Funchal", location: "Funchal, Madeira", country: "Portugal", lat: 32.6488, lng: -16.9080, century: "XV", style: "Manuelino/Gótico" },
  { name: "Fortaleza de São Tiago", location: "Funchal, Madeira", country: "Portugal", lat: 32.6454, lng: -16.9127, century: "XVII", style: "Militar" },
  { name: "Fortaleza do Pico", location: "Funchal, Madeira", country: "Portugal", lat: 32.6486, lng: -16.9042, century: "XVI", style: "Militar" },
  { name: "Igreja do Colégio", location: "Funchal, Madeira", country: "Portugal", lat: 32.6498, lng: -16.9098, century: "XVII", style: "Jesuíta/Barroco" },
  { name: "Convento de Santa Clara", location: "Funchal, Madeira", country: "Portugal", lat: 32.6503, lng: -16.9073, century: "XV", style: "Gótico/Manuelino" },
  { name: "Palácio de São Lourenço", location: "Funchal, Madeira", country: "Portugal", lat: 32.6475, lng: -16.9065, century: "XVI", style: "Militar/Palaciano" },
  { name: "Capela de Nossa Sra. da Penha de França", location: "Funchal, Madeira", country: "Portugal", lat: 32.6510, lng: -16.9095, century: "XVII", style: "Barroco" },
  { name: "Torre do Capitão", location: "Funchal, Madeira", country: "Portugal", lat: 32.6530, lng: -16.9100, century: "XV", style: "Medieval" },
  { name: "Igreja Matriz de Machico", location: "Machico, Madeira", country: "Portugal", lat: 32.7180, lng: -16.7660, century: "XV", style: "Manuelino" },
  { name: "Forte de São João Baptista do Pico", location: "Machico, Madeira", country: "Portugal", lat: 32.7185, lng: -16.7615, century: "XVII", style: "Militar" },
  { name: "Capela dos Milagres", location: "Machico, Madeira", country: "Portugal", lat: 32.7195, lng: -16.7630, century: "XV", style: "Gótico" },
  { name: "Forte do Ilhéu", location: "Porto Moniz, Madeira", country: "Portugal", lat: 32.8290, lng: -17.1690, century: "XVII", style: "Militar" },
  { name: "Igreja de Nossa Sra. da Luz", location: "Ponta do Sol, Madeira", country: "Portugal", lat: 32.6728, lng: -17.0998, century: "XV", style: "Manuelino" },
  { name: "Forte de São José", location: "Vila Baleira, Porto Santo", country: "Portugal", lat: 33.0602, lng: -16.3357, century: "XVII", style: "Militar" },
  { name: "Casa Museu Cristóvão Colombo", location: "Vila Baleira, Porto Santo", country: "Portugal", lat: 33.0611, lng: -16.3348, century: "XV", style: "Colonial" },
  // Espanha
  { name: "Alhambra", location: "Granada", country: "Espanha", lat: 37.1760, lng: -3.5881, century: "XIII", style: "Nasrida" },
  { name: "Sagrada Família", location: "Barcelona", country: "Espanha", lat: 41.4036, lng: 2.1744, century: "XIX", style: "Modernismo" },
  { name: "Palácio Real de Madrid", location: "Madrid", country: "Espanha", lat: 40.4180, lng: -3.7143, century: "XVIII", style: "Barroco" },
  { name: "Catedral de Sevilha", location: "Sevilha", country: "Espanha", lat: 37.3861, lng: -5.9926, century: "XV", style: "Gótico" },
  // França
  { name: "Torre Eiffel", location: "Paris", country: "França", lat: 48.8584, lng: 2.2945, century: "XIX", style: "Ferro" },
  { name: "Catedral de Notre-Dame", location: "Paris", country: "França", lat: 48.8530, lng: 2.3499, century: "XII", style: "Gótico" },
  { name: "Mont Saint-Michel", location: "Normandia", country: "França", lat: 48.6361, lng: -1.5115, century: "X", style: "Medieval" },
  // Itália
  { name: "Coliseu", location: "Roma", country: "Itália", lat: 41.8902, lng: 12.4922, century: "I", style: "Romano" },
  { name: "Torre de Pisa", location: "Pisa", country: "Itália", lat: 43.7230, lng: 10.3966, century: "XII", style: "Românico" },
  { name: "Basílica de São Marcos", location: "Veneza", country: "Itália", lat: 45.4345, lng: 12.3391, century: "XI", style: "Bizantino" },
  // Grécia
  { name: "Parthenon", location: "Atenas", country: "Grécia", lat: 37.9715, lng: 23.7267, century: "V a.C.", style: "Grego Clássico" },
  // Alemanha
  { name: "Porta de Brandemburgo", location: "Berlim", country: "Alemanha", lat: 52.5163, lng: 13.3777, century: "XVIII", style: "Neoclássico" },
  { name: "Castelo de Neuschwanstein", location: "Baviera", country: "Alemanha", lat: 47.5576, lng: 10.7498, century: "XIX", style: "Romântico" },
  // Reino Unido
  { name: "Tower of London", location: "Londres", country: "Reino Unido", lat: 51.5081, lng: -0.0759, century: "XI", style: "Medieval" },
  { name: "Stonehenge", location: "Wiltshire", country: "Reino Unido", lat: 51.1789, lng: -1.8262, century: "III milénio a.C.", style: "Megalítico" },
  // Outros
  { name: "Atomium", location: "Bruxelas", country: "Bélgica", lat: 50.8950, lng: 4.3416, century: "XX", style: "Moderno" },
  { name: "Castelo de Wawel", location: "Cracóvia", country: "Polónia", lat: 50.0540, lng: 19.9354, century: "XIV", style: "Gótico/Renascença" },
];

interface UserStats {
  level: number;
  levelTitle: string;
  xp: number;
  nextLevelXp: number | null;
  discoveries: number;
  badgesCount: number;
  postsCount: number;
  groupsCount: number;
}

interface Challenge {
  _id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  type: string;
  joined: boolean;
  progress: number;
  completed: boolean;
  participantsCount: number;
}

const Home = () => {
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedMonument, setSelectedMonument] = useState<MapMonument | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
    loadUserStats();
    loadChallenges();
  }, []);

  const loadUserStats = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      const response = await axios.get(`${API_URL}/api/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUserStats(response.data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadChallenges = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;
      // Sync progress based on actual activity
      await challengeService.syncProgress().catch(() => {});
      // Load challenges with updated progress
      const data = await challengeService.getChallenges();
      setChallenges(data);
    } catch (error) {
      console.error("Erro ao carregar desafios:", error);
    } finally {
      setLoadingChallenges(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await challengeService.joinChallenge(challengeId);
      // Sync progress immediately after joining
      await challengeService.syncProgress().catch(() => {});
      loadChallenges();
      loadUserStats();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao participar");
    }
  };

  return (
    <IonPage>
      <IonContent className="home-content">
        {/* 1. USER SUMMARY — real data */}
        <div className="user-summary-card">
          <div className="user-info">
            {loadingStats ? (
              <>
                <Skeleton className="avatar" width="70px" height="70px" borderRadius="50%" />
                <div className="user-details">
                  <Skeleton width="150px" height="24px" />
                  <Skeleton width="120px" height="16px" />
                </div>
              </>
            ) : (
              <>
                <div className="avatar">{user?.name?.charAt(0) || "U"}</div>
                <div className="user-details">
                  <h2>{user?.name || "Utilizador"}</h2>
                  <p className="cultural-level">
                    Nível {userStats?.level || 1} - {userStats?.levelTitle || "Iniciante"}
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="user-stats">
            {loadingStats ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="stat">
                  <Skeleton width="30px" height="24px" />
                  <Skeleton width="60px" height="14px" />
                </div>
              ))
            ) : (
              <>
                <div className="stat">
                  <span className="stat-number">{userStats?.discoveries ?? 0}</span>
                  <span className="stat-label">Descobertas</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{userStats?.badgesCount ?? 0}</span>
                  <span className="stat-label">Badges</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{userStats?.groupsCount ?? 0}</span>
                  <span className="stat-label">Grupos</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. MONUMENTS MAP */}
        <div className="section">
          <h3 className="section-title">
            <IonIcon icon={locationOutline} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Monumentos no Mundo
          </h3>
          <div className="map-container">
            <Suspense fallback={<div className="map-loading">A carregar mapa...</div>}>
              <MonumentMap
                monuments={MAP_MONUMENTS}
                onSelect={setSelectedMonument}
              />
            </Suspense>
          </div>
          {selectedMonument && (
            <div className="monument-detail-card">
              <div className="monument-detail-header">
                <h4>{selectedMonument.name}</h4>
                <button className="close-detail" onClick={() => setSelectedMonument(null)}>✕</button>
              </div>
              <div className="monument-detail-tags">
                <span className="monument-tag">{selectedMonument.location}</span>
                <span className="monument-tag">{selectedMonument.country}</span>
                <span className="monument-tag">Séc. {selectedMonument.century}</span>
                <span className="monument-tag">{selectedMonument.style}</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. ACTIVE CHALLENGES — real data */}
        <div className="section">
          <h3 className="section-title">Desafios Ativos</h3>
          {loadingChallenges ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="challenge-card">
                <div className="challenge-header">
                  <Skeleton width="24px" height="24px" borderRadius="50%" />
                  <Skeleton width="200px" height="20px" />
                </div>
                <Skeleton width="100%" height="16px" />
                <Skeleton width="100%" height="16px" />
                <Skeleton width="80%" height="16px" />
                <Skeleton width="120px" height="8px" borderRadius="4px" />
              </div>
            ))
          ) : challenges.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", padding: "16px" }}>
              Sem desafios disponíveis
            </p>
          ) : (
            challenges.map((challenge) => (
              <div key={challenge._id} className="challenge-card">
                <div className="challenge-header">
                  <IonIcon icon={trophyOutline} />
                  <h4>{challenge.title}</h4>
                </div>
                <p className="challenge-description">{challenge.description}</p>
                {challenge.joined && (
                  <>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(
                            (challenge.progress / challenge.target) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {challenge.progress} de {challenge.target} concluídos
                      {challenge.completed && " ✅"}
                    </div>
                  </>
                )}
                {!challenge.joined && !challenge.completed && (
                  <button
                    className="challenge-button"
                    onClick={() => handleJoinChallenge(challenge._id)}
                  >
                    Participar
                  </button>
                )}
                {challenge.joined && !challenge.completed && (
                  <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                    {challenge.participantsCount} participante(s)
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ height: "80px" }}></div>
      </IonContent>

    </IonPage>
  );
};

export default Home;
