import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { once } from 'node:events'
import { createApp } from '../server/app.js'

const frontendOrigin = 'https://benmuthangya-lang.github.io'
let server
let baseUrl

beforeEach(async () => {
  server = createApp({ frontendOrigin }).listen(0, '127.0.0.1')
  await once(server, 'listening')
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

afterEach(async () => {
  server.close()
  await once(server, 'close')
})

test('allows the frontend JSON preflight', async () => {
  const response = await fetch(`${baseUrl}/api/enquiries`, {
    method: 'OPTIONS',
    headers: {
      Origin: frontendOrigin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  })

  assert.equal(response.status, 204)
  assert.equal(response.headers.get('access-control-allow-origin'), frontendOrigin)
  assert.match(response.headers.get('access-control-allow-methods'), /POST/)
  assert.match(response.headers.get('access-control-allow-headers'), /content-type/i)
})

test('allows the frontend to read a successful enquiry acknowledgement', async () => {
  const response = await fetch(`${baseUrl}/api/enquiries`, {
    method: 'POST',
    headers: { Origin: frontendOrigin, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Demo Visitor',
      email: 'demo@example.com',
      tour: 'Maasai Mara Explorer',
      travelDate: '2099-01-15',
      travellers: 2,
    }),
  })

  assert.equal(response.status, 201)
  assert.equal(response.headers.get('access-control-allow-origin'), frontendOrigin)
  assert.equal((await response.json()).id, 1)
})

test('allows the frontend to read server validation errors', async () => {
  const response = await fetch(`${baseUrl}/api/enquiries`, {
    method: 'POST',
    headers: { Origin: frontendOrigin, 'Content-Type': 'application/json' },
    body: '{}',
  })

  assert.equal(response.status, 400)
  assert.equal(response.headers.get('access-control-allow-origin'), frontendOrigin)
  assert.equal((await response.json()).errors.fullName, 'Enter your full name.')
})

test('omits CORS permission for an unrelated origin', async () => {
  const response = await fetch(`${baseUrl}/api/enquiries`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://unrelated.example',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  })

  assert.equal(response.headers.get('access-control-allow-origin'), null)
})
