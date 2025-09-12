import fs from 'fs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: 'ratiphong.tips.co.th',
    port: 5173, 
    strictPort: true,
    https:{
      key: fs.readFileSync('./cert/localhost+2-key.pem'),
      cert: fs.readFileSync('./cert/localhost+2.pem'),
    },
    proxy: {
      // proxy ทุก request ที่ขึ้นต้นด้วย /api ไปยัง .NET backend
      "/api": {
        target: "https://localhost:7112",  // URL ของ .NET API ที่ local
        changeOrigin: true,
        secure: false, // ถ้าใช้ self-signed certificate
        rewrite: (path) => path.replace(/^\/api/, ""), // ตัด /api ออกก่อนส่งให้ backend
      },
    },
  }
})
