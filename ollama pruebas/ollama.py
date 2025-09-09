import psutil
import GPUtil
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import time
import signal
import sys
import csv

PROCESS_NAME = "ollama"
CSV_FILE = "ollama_metrics.csv"

# Datos acumulados
records = []
time_data = []
cpu_data = []
ram_data = []
gpu_data = []

def get_ollama_process():
    for proc in psutil.process_iter(['pid', 'name']):
        if PROCESS_NAME.lower() in proc.info['name'].lower():
            return proc
    return None

def update(frame):
    proc = get_ollama_process()
    if proc:
        try:
            cpu = proc.cpu_percent(interval=0.1)
            ram = proc.memory_info().rss / (1024 ** 2)  # MB
            gpus = GPUtil.getGPUs()
            gpu = gpus[0].load * 100 if gpus else 0
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

            # Guardar en memoria
            records.append([timestamp, cpu, ram, gpu])
            time_data.append(frame)
            cpu_data.append(cpu)
            ram_data.append(ram)
            gpu_data.append(gpu)

            # Mantener solo últimas 50 muestras en el gráfico
            if len(time_data) > 50:
                time_data.pop(0)
                cpu_data.pop(0)
                ram_data.pop(0)
                gpu_data.pop(0)

            # Graficar
            plt.cla()
            plt.subplot(3,1,1)
            plt.plot(time_data, cpu_data, label="CPU %", color="red")
            plt.ylabel("CPU %")
            plt.legend()

            plt.subplot(3,1,2)
            plt.plot(time_data, ram_data, label="RAM (MB)", color="blue")
            plt.ylabel("RAM (MB)")
            plt.legend()

            plt.subplot(3,1,3)
            plt.plot(time_data, gpu_data, label="GPU %", color="green")
            plt.ylabel("GPU %")
            plt.xlabel("Tiempo")
            plt.legend()

        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

def save_csv_and_exit(sig=None, frame=None):
    """Guardar CSV antes de salir"""
    with open(CSV_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "cpu_percent", "ram_mb", "gpu_percent"])
        writer.writerows(records)
    print(f"\n✅ Datos guardados en {CSV_FILE}")
    sys.exit(0)

# Capturar Ctrl+C y cierre de ventana
signal.signal(signal.SIGINT, save_csv_and_exit)
signal.signal(signal.SIGTERM, save_csv_and_exit)

fig = plt.figure(figsize=(8,7))
ani = animation.FuncAnimation(fig, update, interval=1000)
plt.tight_layout()
plt.show()

# Si cierras la ventana de matplotlib también guarda
save_csv_and_exit()
