import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    host: true,            // permite acceso externo (0.0.0.0)
    port: 5173,
    // ✅ permite dominios del túnel
    allowedHosts: [
      '.trycloudflare.com', // comodín para no editar cada vez
      '.loca.lt'            // si usas LocalTunnel
      // o el host exacto:
      // 'start-exhibition-moderate-bean.trycloudflare.com'
    ],
    // (opcional) para que el HMR funcione detrás de HTTPS del túnel
    hmr: {
      clientPort: 443,
      protocol: 'wss'
      // host: 'start-exhibition-moderate-bean.trycloudflare.com' // opcional
    },
    cors: true
  }
})