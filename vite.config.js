import { defineConfig, loadEnv  } from 'vite'
import react from '@vitejs/plugin-react'

import dotenv from 'dotenv'



// Load app-level env vars to node-level env vars.

dotenv.config();

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000
    }
  }
})
