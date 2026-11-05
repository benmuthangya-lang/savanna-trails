import { loadEnvFile } from 'node:process'
import { createApp } from './app.js'

try {
  // Node loads an optional local .env file without another dependency.
  loadEnvFile()
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const port = Number.parseInt(process.env.PORT || '5000', 10)
// Demo-only storage: all enquiries disappear when this process stops.
const enquiries = []
const app = createApp({ enquiries })

app.listen(port, '127.0.0.1', () => {
  console.log(`Savanna Trails server running at http://127.0.0.1:${port}`)
  console.log('Enquiries use temporary in-memory storage and will disappear when this server restarts.')
})
