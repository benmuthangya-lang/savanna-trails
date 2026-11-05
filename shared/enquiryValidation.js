import { tourNames } from './tours.js'

// The browser and server share this module so both enforce the same rules.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

export const maxTravellers = 100

export function getTodayInputValue(date = new Date()) {
  // Use local calendar parts so UTC conversion cannot change the user's day.
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isRealDate(value) {
  if (!isoDatePattern.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  // JavaScript rolls invalid dates forward, so compare every parsed part afterward.
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
}

export function validateEnquiry(values, today = getTodayInputValue()) {
  const errors = {}
  const fullName = values.fullName.trim()
  const email = values.email.trim()
  const tour = values.tour.trim()
  const travelDate = values.travelDate.trim()
  const travellers = values.travellers.trim()
  const travellerCount = Number(travellers)
  const message = values.message.trim()

  if (!fullName) errors.fullName = 'Enter your full name.'
  else if (fullName.length > 100) errors.fullName = 'Keep your name under 100 characters.'

  if (!email) errors.email = 'Enter your email address.'
  else if (email.length > 254 || !emailPattern.test(email)) errors.email = 'Enter a valid email address.'

  if (!tour) errors.tour = 'Choose a sample tour.'
  else if (!tourNames.includes(tour)) errors.tour = 'Choose a tour from the list.'

  if (!travelDate) errors.travelDate = 'Choose your preferred travel date.'
  else if (!isRealDate(travelDate)) errors.travelDate = 'Choose a valid travel date.'
  // YYYY-MM-DD strings sort chronologically, so no timezone conversion is needed.
  else if (travelDate < today) errors.travelDate = 'Travel date cannot be in the past.'

  if (!travellers) errors.travellers = 'Enter the number of travellers.'
  else if (!/^\d+$/.test(travellers) || travellerCount < 1) {
    errors.travellers = 'Travellers must be a positive whole number.'
  }
  else if (!Number.isSafeInteger(travellerCount) || travellerCount > maxTravellers) {
    errors.travellers = `Choose between 1 and ${maxTravellers} travellers.`
  }

  if (message.length > 1000) errors.message = 'Keep your message under 1,000 characters.'

  return errors
}

export function normalizeEnquiryPayload(payload = {}) {
  // Treat any untrusted non-object request body as empty before reading its fields.
  const source = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {}
  const text = (value) => typeof value === 'string' ? value.trim() : ''
  const travellers = typeof source.travellers === 'string' || typeof source.travellers === 'number'
    ? String(source.travellers).trim()
    : ''

  return {
    fullName: text(source.fullName),
    email: text(source.email).toLowerCase(),
    tour: text(source.tour),
    travelDate: text(source.travelDate),
    travellers,
    message: text(source.message),
  }
}
