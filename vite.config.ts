import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function downloadMimePlugin(): Plugin {
  function applyMime(req: IncomingMessage, res: ServerResponse) {
    const path = (req.url ?? '').split('?')[0]
    if (path.endsWith('.mobileconfig')) {
      res.setHeader('Content-Type', 'application/x-apple-aspen-config')
    } else if (path.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive')
      res.setHeader(
        'Content-Disposition',
        "attachment; filename=\"mawjood.apk\"; filename*=UTF-8''%D9%85%D9%88%D8%AC%D9%88%D8%AF.apk",
      )
    }
  }

  return {
    name: 'download-mime',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        applyMime(req, res)
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        applyMime(req, res)
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), downloadMimePlugin()],
})
