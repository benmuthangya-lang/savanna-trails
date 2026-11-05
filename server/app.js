import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { getTodayInputValue, normalizeEnquiryPayload, validateEnquiry } from '../shared/enquiryValidation.js'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const distDirectory = path.resolve(currentDirectory, '../dist')

export function createApp(options = {}) {
  const app = express()
  // Inject storage and time in tests while keeping simple defaults for the demo.
  const enquiries = options.enquiries || []
  const now = options.now || (() => new Date())

  app.disable('x-powered-by')
  if (options.frontendOrigin) {
    // Allow the deployed frontend to read API responses and complete JSON preflights.
    app.use('/api', cors({
      origin: [options.frontendOrigin],
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
    }))
  }
  // Let validation handle primitive JSON bodies instead of returning a parser-only error.
  app.use(express.json({ limit: '50kb', strict: false }))

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', storage: 'temporary in-memory' })
  })

  app.post('/api/enquiries', (request, response) => {
    // Never trust browser validation alone; check every API request again.
    const enquiry = normalizeEnquiryPayload(request.body)
    const errors = validateEnquiry(enquiry, getTodayInputValue(now()))

    if (Object.keys(errors).length > 0) {
      return response.status(400).json({
        message: 'Please correct the highlighted fields.',
        errors,
      })
    }

    const storedEnquiry = {
      id: enquiries.length + 1,
      ...enquiry,
      travellers: Number(enquiry.travellers),
      createdAt: now().toISOString(),
    }
    // Storage is intentionally in memory and clears whenever the server restarts.
    enquiries.push(storedEnquiry)

    return response.status(201).json({
      id: storedEnquiry.id,
      message: 'Your demonstration enquiry was received. No booking has been confirmed and no email was sent.',
    })
  })

  // Serve the built React app from the same origin as the production API.
  app.use(express.static(distDirectory))

  app.use((error, _request, response, next) => {
    // Return predictable JSON when the request body contains malformed JSON.
    if (error instanceof SyntaxError && 'body' in error) {
      return response.status(400).json({ message: 'Request body must be valid JSON.' })
    }
    return next(error)
  })

  return app
}
