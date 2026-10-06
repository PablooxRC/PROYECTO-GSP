import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { eachMonthOfInterval, format, startOfYear, endOfYear } from "date-fns";
import { es } from "date-fns/locale"; // ✅ Importar idioma español

const fechasImportantes = [
  { mes: 0, dia: 17, evento: "Asamblea de grupo" },
  { mes: 1, dia: 8, evento: "Inicio de reuniones" },
  { mes: 2, dia: 23, evento: "Campamento de grupo" },
  { mes: 3, dia: 12, evento: "Reunion Conjunta día del niño" },
  { mes: 3, dia: 17, evento: "IM nacional" },
  { mes: 4, dia: 2, evento: "ExploAvengers - Exploradores" },
  { mes: 5, dia: 21, evento: "PioMatch - Pioneros" },
  { mes: 7, dia: 21, evento: "Estafeta - Exploradores" },
  { mes: 10, dia: 1, evento: "IM distrital" },
  { mes: 11, dia: 25, evento: "Navidad" },
];

function HomePage() {
  const { user } = useAuth();
  const anioActual = new Date().getFullYear();
  const meses = eachMonthOfInterval({
    start: startOfYear(new Date(anioActual, 0, 1)),
    end: endOfYear(new Date(anioActual, 0, 1)),
  });

  return (
    <div className="page-shell">
      <header className="page-header home-header">
        <div>
          <h1 className="page-title">
            Un año de aventuras
            <br className="hidden sm:block" /> en comunidad.
          </h1>
          <p className="page-description">
            Reuniones, campamentos y encuentros del grupo scout. Consulta las
            fechas de nuestro calendario anual.
          </p>
        </div>
        <div className="home-year" aria-label={`Calendario ${anioActual}`}>
          {anioActual}
        </div>
      </header>
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="text-lg font-semibold">Calendario de eventos</h2>
        <span className="text-sm text-[#a5afc2]">Enero a diciembre</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {meses.map((mes, i) => (
          <Card key={i} className="calendar-month min-h-40">
            <h3 className="text-base font-semibold mb-5 capitalize">
              {format(mes, "MMMM", { locale: es })}{" "}
              {/* ✅ Nombre del mes en español */}
            </h3>
            <ul className="text-sm space-y-3">
              {fechasImportantes
                .filter((f) => f.mes === i)
                .map((f, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="calendar-day shrink-0">{f.dia}</span>
                    <span className="pt-1 leading-relaxed">{f.evento}</span>
                  </li>
                ))}
              {fechasImportantes.filter((f) => f.mes === i).length === 0 && (
                <li className="text-[#a5afc2]">Sin eventos programados</li>
              )}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
