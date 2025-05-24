import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { eachMonthOfInterval, format, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale'; // ✅ Importar idioma español

const fechasImportantes = [
  { mes: 0, dia: 17, evento: 'Asamblea de grupo' },
  { mes: 1, dia: 8, evento: 'Inicio de reuniones' },
  { mes: 2, dia: 23, evento: 'Campamento de grupo' },
  { mes: 3, dia: 12, evento: 'Reunion Conjunta día del niño' },
  { mes: 3, dia: 17, evento: 'IM nacional' },
  { mes: 4, dia: 2, evento: 'ExploAvengers - Exploradores' },
  { mes: 5, dia: 21, evento: 'PioMatch - Pioneros' },
  { mes: 7, dia: 21, evento: 'Estafeta - Exploradores' },
  { mes: 10, dia: 1, evento: 'IM distrital' },
  { mes: 11, dia: 25, evento: 'Navidad' },
];

function HomePage() {
  const { user } = useAuth();
  const anioActual = new Date().getFullYear();
  const meses = eachMonthOfInterval({
    start: startOfYear(new Date(anioActual, 0, 1)),
    end: endOfYear(new Date(anioActual, 0, 1)),
  });

  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold mb-4">Calendario Anual - Eventos Scout</h1>

      <div className="grid grid-cols-3 gap-4">
        {meses.map((mes, i) => (
          <Card key={i} className="p-4">
            <h3 className="text-xl font-semibold mb-2">
              {format(mes, 'MMMM', { locale: es })} {/* ✅ Nombre del mes en español */}
            </h3>
            <ul className="text-sm list-disc list-inside">
              {fechasImportantes
                .filter(f => f.mes === i)
                .map((f, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{f.dia}</span>: {f.evento}
                  </li>
              ))}
              {fechasImportantes.filter(f => f.mes === i).length === 0 && (
                <li className="text-gray-500">Sin eventos</li>
              )}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
