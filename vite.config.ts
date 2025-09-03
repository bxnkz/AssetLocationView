import fs from 'fs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';


export default defineConfig({
  plugins: 
  [react(),
    tailwindcss(),
  ],
  server: {
    host: 'ratiphong.tips.co.th',
    port: 5173, 
    strictPort: true,
    https:{
      key: fs.readFileSync('./cert/localhost+2-key.pem'),
      cert: fs.readFileSync('./cert/localhost+2.pem'),
    }
  }
})
