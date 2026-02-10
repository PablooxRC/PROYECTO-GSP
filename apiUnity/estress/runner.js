import autocannon from 'autocannon';

const INSECURE = true; 
const DURATION = 15; 

const endpoints = [
  {
    name: 'login',
    url: 'https://172.20.10.3:4000/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { ci: '8637944' }
  },
  {
    name: 'save-wrong-answers',
    url: 'https://172.20.10.3:4000/save-wrong-answers',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { ci: '8637944', answers: ['pregunta1', 'pregunta2'] }
  }
];

// Conexiones a testear
const connectionLevels = [5, 10, 20, 30, 50];

async function runTest(endpoint, connections) {
  return new Promise((resolve) => {
    console.log(`\n=== Endpoint: ${endpoint.name} | Conexiones: ${connections} ===`);
    console.log(`Running ${DURATION}s test @ ${endpoint.url}`);

    const inst = autocannon({
      url: endpoint.url,
      connections,
      duration: DURATION,
      method: endpoint.method,
      headers: endpoint.headers,
      body: JSON.stringify(endpoint.body),
      insecure: INSECURE
    }, (result) => {
      if (!result) {
        console.error(`ERROR: No se pudo ejecutar el test para ${endpoint.name} con ${connections} conexiones`);
        resolve({
          endpoint: endpoint.name,
          connections,
          totalRequests: 0,
          averageLatency: 0,
          latencyP95: 0,
          success2xx: 0,
          failures: 0
        });
        return;
      }

      const { requests = {}, latency = {}, errors = 0, timeouts = 0 } = result;

      resolve({
        endpoint: endpoint.name,
        connections,
        totalRequests: requests.total || 0,
        averageLatency: latency.average || 0,
        latencyP95: latency.p95 || 0,
        success2xx: result['2xx'] || 0,
        failures: errors + timeouts
      });
    });

    inst.on('error', (err) => {
      console.error('Error global de autocannon:', err.message);
    });
  });
}

async function main() {
  const results = [];

  for (const endpoint of endpoints) {
    for (const connections of connectionLevels) {
      const result = await runTest(endpoint, connections);
      results.push(result);
    }
  }

  console.log('\n=== Resultados finales ===');
  console.table(results);
}

main();
