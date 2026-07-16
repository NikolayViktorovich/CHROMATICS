import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TECH_LIST_DIR = path.resolve(__dirname, 'tech_list')

function techListPlugin(): Plugin {
  return {
    name: 'tech-list-static',
    configureServer(server) {
      server.middlewares.use('/tech_list', (req, res, next) => {
        const urlPath = decodeURIComponent(req.url ?? '/').replace(/\?.*$/, '')
        const filePath = path.resolve(TECH_LIST_DIR, `.${urlPath}`)
        if (!filePath.startsWith(TECH_LIST_DIR) || !fs.existsSync(filePath)) {
          next()
          return
        }
        const stat = fs.statSync(filePath)
        if (!stat.isFile()) {
          next()
          return
        }
        if (filePath.endsWith('.pdf')) res.setHeader('Content-Type', 'application/pdf')
        fs.createReadStream(filePath).pipe(res)
      })
    },
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist/tech_list')
      fs.cpSync(TECH_LIST_DIR, outDir, { recursive: true })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), techListPlugin()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
})
