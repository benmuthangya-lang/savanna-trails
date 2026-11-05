import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { once } from 'node:events'
import { createApp } from '../server/app.js'
import { EnquiryApiError, submitEnquiry } from '../src/api.js'
import { maxTravellers } from '../shared/enquiryValidation.js'

const fixedNow = new Date('2026-11-05T12:00:00.000Z')
const validEnquiry = {
  fullName: 'Amina Kamau',
  email: 'amina@example.com',
  tour: 'Maasai Mara Explorer',
  travelDate: '2026-12-15',
  travellers: '2',
  message: 'A sample enquiry.',
}

let server
let baseUrl
let enquiries

beforeEach(async () => {
  enquiries = []
  server = createApp({ enquiries, now: () => fixedNow }).listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  baseUrl = `http://127.0.0.1:${address.port}`
})

afterEach(async () => {
  server.close()
  await once(server, 'close')
})

test('accepts and stores a valid enquiry', async () => {
  const result = await submitEnquiry(validEnquiry, { baseUrl })

  assert.equal(result.id, 1)
  assert.match(result.message, /No booking has been confirmed/)
  assert.equal(enquiries.length, 1)
  assert.equal(enquiries[0].travellers, 2)
})

test('rejects invalid fields without storing the enquiry', async () => {
  await assert.rejects(
    submitEnquiry({
      ...validEnquiry,
      email: 'not-an-email',
      tour: 'Imaginary Tour',
      travelDate: '2026-11-04',
      travellers: '0',
    }, { baseUrl }),
    (error) => {
      assert.ok(error instanceof EnquiryApiError)
      assert.equal(error.status, 400)
      assert.deepEqual(Object.keys(error.fieldErrors).sort(), ['email', 'tour', 'travelDate', 'travellers'])
      return true
    },
  )

  assert.equal(enquiries.length, 0)
})

test('rejects a fractional traveller count as a server-side validation error', async () => {
  await assert.rejects(
    submitEnquiry({ ...validEnquiry, travellers: '1.5' }, { baseUrl }),
    (error) => {
      assert.equal(error.status, 400)
      assert.match(error.fieldErrors.travellers, /positive whole number/)
      return true
    },
  )
})

test('accepts traveller count boundaries as strings and numbers', async () => {
  for (const travellers of ['1', 1, String(maxTravellers), maxTravellers]) {
    await submitEnquiry({ ...validEnquiry, travellers }, { baseUrl })
    assert.equal(enquiries.at(-1).travellers, Number(travellers))
  }

  assert.equal(enquiries.length, 4)
})

test('rejects excessive and unsafe traveller counts without storing enquiries', async () => {
  const invalidCounts = [String(maxTravellers + 1), maxTravellers + 1, '9007199254740993', '9'.repeat(310)]

  for (const travellers of invalidCounts) {
    await assert.rejects(
      submitEnquiry({ ...validEnquiry, travellers }, { baseUrl }),
      (error) => {
        assert.ok(error instanceof EnquiryApiError)
        assert.equal(error.status, 400)
        assert.equal(error.fieldErrors.travellers, `Choose between 1 and ${maxTravellers} travellers.`)
        return true
      },
    )
  }

  assert.equal(enquiries.length, 0)
})

test('rejects a null request body with required field errors', async () => {
  await assert.rejects(
    submitEnquiry(null, { baseUrl }),
    (error) => {
      assert.equal(error.status, 400)
      assert.deepEqual(
        Object.keys(error.fieldErrors).sort(),
        ['email', 'fullName', 'tour', 'travelDate', 'travellers'],
      )
      return true
    },
  )
})

test('returns JSON for malformed request bodies', async () => {
  const response = await fetch(`${baseUrl}/api/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{invalid-json',
  })
  const result = await response.json()

  assert.equal(response.status, 400)
  assert.equal(result.message, 'Request body must be valid JSON.')
})

test('returns a helpful network error when the server is unavailable', async () => {
  await assert.rejects(
    submitEnquiry(validEnquiry, {
      fetchImpl: async () => { throw new TypeError('fetch failed') },
    }),
    (error) => {
      assert.ok(error instanceof EnquiryApiError)
      assert.equal(error.kind, 'network')
      assert.match(error.message, /details are still here/i)
      return true
    },
  )
})

test('treats a proxy 503 response as an unavailable server', async () => {
  await assert.rejects(
    submitEnquiry(validEnquiry, {
      fetchImpl: async () => ({
        ok: false,
        status: 503,
        json: async () => { throw new SyntaxError('not json') },
      }),
    }),
    (error) => {
      assert.equal(error.kind, 'network')
      assert.match(error.message, /details are still here/i)
      return true
    },
  )
})

const unexpectedResponses = [
  { name: 'an HTML fallback', status: 200, body: '<html>Fallback page</html>' },
  { name: 'an empty response', status: 204, body: null },
  { name: 'an acknowledgement with the wrong status', status: 200, body: JSON.stringify({ id: 1, message: 'Received.' }) },
  { name: 'null JSON', status: 201, body: 'null' },
  { name: 'a missing enquiry ID', status: 201, body: JSON.stringify({ message: 'Received.' }) },
  { name: 'an invalid enquiry ID', status: 201, body: JSON.stringify({ id: 0, message: 'Received.' }) },
  { name: 'a missing acknowledgement message', status: 201, body: JSON.stringify({ id: 1 }) },
  { name: 'a malformed acknowledgement message', status: 201, body: JSON.stringify({ id: 1, message: {} }) },
]

for (const { name, status, body } of unexpectedResponses) {
  test(`rejects ${name} instead of reporting submission success`, async () => {
    await assert.rejects(
      submitEnquiry(validEnquiry, {
        fetchImpl: async () => new Response(body, { status }),
      }),
      (error) => {
        assert.ok(error instanceof EnquiryApiError)
        assert.equal(error.status, status)
        assert.match(error.message, /unexpected response/i)
        assert.match(error.message, /details are still here/i)
        return true
      },
    )
  })
}
