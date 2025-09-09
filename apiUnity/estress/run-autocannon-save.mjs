import autocannon from 'autocannon';
import fs from 'fs';

const body = {
  ci: '8637944',
  answers: ['pregunta1', 'pregunta2']
};

// Configuración de la prueba
const instance = autocannon({
  url: 'https://172.20.10.2:4000/save-wrong-answers',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
  connections: 5,   // número de conexiones concurrentes
  duration: 15      // duración en segundos
});

// Mostrar la tabla en tiempo real en la terminal
autocannon.track(instance, { renderProgressBar: true });

// Cuando termina la prueba
instance.on('done', result => {
  // Guardar resultados en JSON
  fs.writeFileSync('results-save.json', JSON.stringify(result, null, 2));
  console.log('\nResultados guardados en results-save.json');
});
