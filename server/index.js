import { loadEnvFile } from 'node:process'
import { createApp } from './app.js'

try {
  // Node loads an optional local .env file without another dependency.
  loadEnvFile()
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const port = Number.parseInt(process.env.PORT || '5000', 10)
const host = process.env.HOST || '127.0.0.1'
// CORS uses the origin only, even if a full frontend URL was entered in the settings.
const frontendOrigin = process.env.FRONTEND_ORIGIN
  ? new URL(process.env.FRONTEND_ORIGIN).origin
  : undefined
// Demo-only storage: all enquiries disappear when this process stops.
const enquiries = []
const app = createApp({ enquiries, frontendOrigin })

app.listen(port, host, () => {
  console.log(`Savanna Trails server running at http://${host}:${port}`)
  console.log('Enquiries use temporary in-memory storage and will disappear when this server restarts.')
})
