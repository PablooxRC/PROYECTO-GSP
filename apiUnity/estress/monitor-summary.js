import si from 'systeminformation';

const stats = {
  node: { cpu: [], mem: [], count: [] },
  postgres: { cpu: [], mem: [], count: [] },
};

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

async function monitorProcess(name, displayName, regex) {
  const processes = await si.processes();
  const filtered = processes.list.filter(p => p.name && regex.test(p.name));

  let totalCpu = 0;
  let totalMem = 0;

  console.log(`${displayName} Processes: ${filtered.length} active`);

  filtered.forEach(p => {
    const cpu = typeof p.pcpu === 'number' ? p.pcpu : 0;
    const mem = typeof p.mem_rss === 'number' ? p.mem_rss / 1024 / 1024 : 0; // MB

    totalCpu += cpu;
    totalMem += mem;

    console.log(`PID: ${p.pid} | CPU: ${cpu.toFixed(2)}% | Memory: ${mem.toFixed(2)} MB`);
  });

  console.log(`Total: CPU: ${totalCpu.toFixed(2)}% | Memory: ${totalMem.toFixed(2)} MB\n`);

  stats[name].cpu.push(totalCpu);
  stats[name].mem.push(totalMem);
  stats[name].count.push(filtered.length);
}

async function monitor() {
  const now = new Date().toLocaleTimeString();
  console.clear();
  console.log(`===== ${now} =====\n`);

  await monitorProcess('node', 'Node.js', /node\.exe/i);
  await monitorProcess('postgres', 'PostgreSQL', /postgres\.exe/i);
}

function printSummary() {
  function summary(name, displayName) {
    const cpu = stats[name].cpu;
    const mem = stats[name].mem;
    const count = stats[name].count;

    const avgCpu = sum(cpu) / (cpu.length || 1);
    const peakCpu = Math.max(...cpu, 0);

    const avgMem = sum(mem) / (mem.length || 1);
    const peakMem = Math.max(...mem, 0);

    const avgCount = sum(count) / (count.length || 1);
    const maxCount = Math.max(...count, 0);

    console.log(`${displayName} Processes:`);
    console.log(`Average CPU: ${avgCpu.toFixed(2)}%`);
    console.log(`Peak CPU: ${peakCpu.toFixed(2)}%`);
    console.log(`Average Memory: ${avgMem.toFixed(2)} MB`);
    console.log(`Peak Memory: ${peakMem.toFixed(2)} MB`);
    console.log(`Average Process Count: ${avgCount.toFixed(0)}`);
    console.log(`Max Process Count: ${maxCount}\n`);
  }

  console.log('===== SUMMARY =====');
  summary('node', 'Node.js');
  summary('postgres', 'PostgreSQL');
}

const interval = setInterval(monitor, 2000);

process.on('SIGINT', () => {
  clearInterval(interval);
  console.log('\nFinalizando monitoreo...\n');
  printSummary();
  process.exit();
});
