import { expect, test } from '@playwright/test'
import { maxTravellers } from '../shared/enquiryValidation.js'

function futureDate(daysAhead = 30) {
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
  return date.toISOString().slice(0, 10)
}

async function fillValidEnquiry(page) {
  await page.getByLabel('Full name').fill('Amina Wanjiku')
  await page.getByLabel('Email address').fill('amina@example.com')
  await page.getByLabel('Selected tour').selectOption('Samburu Wild North')
  await page.getByLabel('Preferred travel date').fill(futureDate())
  await page.getByLabel('Number of travellers').fill('2')
  await page.getByLabel('Message (optional)').fill('Please share the sample itinerary.')
}

async function expectNoHorizontalOverflow(page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(hasOverflow).toBe(false)
}

test('mobile navigation closes with Escape and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')

  // Use a stable locator because the accessible name changes while the menu is open.
  const menuButton = page.locator('.menu-toggle')
  await expect(menuButton).toHaveAccessibleName('Open navigation menu')
  await menuButton.click()

  await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  await expect(menuButton).toHaveAccessibleName('Close navigation menu')
  await expect(page.getByRole('link', { name: 'Tours', exact: true })).toBeVisible()

  await page.keyboard.press('Escape')

  await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  await expect(menuButton).toHaveAccessibleName('Open navigation menu')
  await expect(menuButton).toBeFocused()
  await expectNoHorizontalOverflow(page)
})

test('search and destination filters work together and can be cleared', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/#tours')

  await page.getByLabel('Search by tour name').fill('Mara')
  await page.getByLabel('Filter by destination').selectOption('Maasai Mara')

  await expect(page.locator('.tour-card')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Maasai Mara Explorer' })).toBeVisible()

  // A search and a conflicting destination should produce the explicit empty state.
  await page.getByLabel('Filter by destination').selectOption('Tsavo')
  await expect(page.getByRole('heading', { name: 'No journeys found' })).toBeVisible()
  await expect(page.getByText(/Showing\s+0\s+of 6 tours/)).toBeVisible()

  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page.locator('.tour-card')).toHaveCount(6)
  await expect(page.getByLabel('Search by tour name')).toHaveValue('')
  await expect(page.getByLabel('Filter by destination')).toHaveValue('All destinations')
  await expectNoHorizontalOverflow(page)
})

test('an Enquire link selects its tour and moves focus to the form', async ({ page }) => {
  await page.goto('/#tours')

  const dianiCard = page.locator('.tour-card').filter({ hasText: 'Diani Coast Retreat' })
  await dianiCard.getByRole('link', { name: 'Enquire about Diani Coast Retreat' }).click()

  const tourSelect = page.getByLabel('Selected tour')
  await expect(page).toHaveURL(/#enquiry$/)
  await expect(tourSelect).toHaveValue('Diani Coast Retreat')
  await expect(tourSelect).toBeFocused()
})

test('the enquiry form validates, submits, and preserves values after a network error', async ({ page }) => {
  await page.goto('/#enquiry')

  // Use a stable locator because the label changes while a request is pending.
  const submitButton = page.locator('.submit-button')
  await expect(submitButton).toHaveAccessibleName('Send sample enquiry')
  await submitButton.click()

  await expect(page.getByText('Enter your full name.')).toBeVisible()
  await expect(page.getByText('Enter your email address.')).toBeVisible()
  await expect(page.getByText('Choose a sample tour.')).toBeVisible()
  await expect(page.getByText('Choose your preferred travel date.')).toBeVisible()
  await expect(page.getByLabel('Full name')).toBeFocused()

  await page.getByLabel('Full name').fill('Amina Wanjiku')
  await page.getByLabel('Email address').fill('amina@example.com')
  await page.getByLabel('Selected tour').selectOption('Samburu Wild North')
  await page.getByLabel('Preferred travel date').fill(futureDate())
  await page.getByLabel('Number of travellers').fill('2')
  await page.getByLabel('Message (optional)').fill('Please share the sample itinerary.')

  let enquiryRequests = 0
  let releaseRequest
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/enquiries') {
      enquiryRequests += 1
    }
  })
  await page.route('**/api/enquiries', async (route) => {
    await new Promise((resolve) => { releaseRequest = resolve })
    await route.continue()
  }, { times: 1 })

  await submitButton.click()
  await expect(submitButton).toBeDisabled()
  await expect(submitButton).toHaveAccessibleName(/Submitting/)
  await expect.poll(() => enquiryRequests).toBe(1)

  // Submitting the form programmatically while the request is pending must not send a duplicate.
  await page.locator('.enquiry-form').evaluate((form) => form.requestSubmit())
  await page.waitForTimeout(100)
  expect(enquiryRequests).toBe(1)
  releaseRequest()

  await expect(page.getByText(/demonstration enquiry was received/i)).toBeVisible()
  await expect(page.getByLabel('Full name')).toHaveValue('')

  // Abort only the next API call to simulate an unavailable server without stopping a process.
  await page.route('**/api/enquiries', (route) => route.abort('failed'), { times: 1 })
  await page.getByLabel('Full name').fill('Amina Wanjiku')
  await page.getByLabel('Email address').fill('amina@example.com')
  await page.getByLabel('Preferred travel date').fill(futureDate(60))
  await page.getByLabel('Number of travellers').fill('3')
  await page.getByLabel('Message (optional)').fill('Keep this message after failure.')
  await submitButton.click()

  await expect(page.getByRole('alert')).toContainText('could not reach the enquiry server')
  await expect(page.getByLabel('Full name')).toHaveValue('Amina Wanjiku')
  await expect(page.getByLabel('Email address')).toHaveValue('amina@example.com')
  await expect(page.getByLabel('Selected tour')).toHaveValue('Samburu Wild North')
  await expect(page.getByLabel('Number of travellers')).toHaveValue('3')
  await expect(page.getByLabel('Message (optional)')).toHaveValue('Keep this message after failure.')
})

test('an unexpected successful HTTP response preserves the enquiry and shows an error', async ({ page }) => {
  await page.route('**/api/enquiries', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<html>Fallback page</html>',
  }))
  await page.goto('/#enquiry')
  await fillValidEnquiry(page)
  const travelDate = await page.getByLabel('Preferred travel date').inputValue()
  await page.locator('.submit-button').click()

  await expect(page.getByRole('alert')).toContainText('unexpected response')
  await expect(page.locator('.status-success')).toHaveCount(0)
  await expect(page.getByLabel('Full name')).toHaveValue('Amina Wanjiku')
  await expect(page.getByLabel('Email address')).toHaveValue('amina@example.com')
  await expect(page.getByLabel('Selected tour')).toHaveValue('Samburu Wild North')
  await expect(page.getByLabel('Preferred travel date')).toHaveValue(travelDate)
  await expect(page.getByLabel('Number of travellers')).toHaveValue('2')
  await expect(page.getByLabel('Message (optional)')).toHaveValue('Please share the sample itinerary.')
  await expect(page.locator('.submit-button')).toBeEnabled()
})

test('server validation focuses the enabled field and allows a corrected retry', async ({ page }) => {
  await page.route('**/api/enquiries', (route) => route.fulfill({
    status: 400,
    contentType: 'application/json',
    body: JSON.stringify({
      message: 'Please correct the highlighted fields.',
      errors: { email: 'Please check your email address.' },
    }),
  }), { times: 1 })
  await page.goto('/#enquiry')
  await fillValidEnquiry(page)
  await page.locator('.submit-button').click()

  await expect(page.getByText('Please check your email address.')).toBeVisible()
  await expect(page.getByLabel('Email address')).toBeEnabled()
  await expect(page.getByLabel('Email address')).toBeFocused()
  await expect(page.getByLabel('Full name')).toHaveValue('Amina Wanjiku')

  await page.getByLabel('Email address').fill('amina.updated@example.com')
  await page.locator('.submit-button').click()
  await expect(page.locator('.status-success')).toContainText('demonstration enquiry was received')
})

test('the form rejects an excessive traveller count and accepts the maximum', async ({ page }) => {
  await page.goto('/#enquiry')
  await fillValidEnquiry(page)
  let enquiryRequests = 0
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/enquiries') {
      enquiryRequests += 1
    }
  })

  await page.getByLabel('Number of travellers').fill(String(maxTravellers + 1))
  await page.locator('.submit-button').click()
  await expect(page.getByText(`Choose between 1 and ${maxTravellers} travellers.`)).toBeVisible()
  await expect(page.getByLabel('Number of travellers')).toBeFocused()
  expect(enquiryRequests).toBe(0)

  await page.getByLabel('Number of travellers').fill(String(maxTravellers))
  await page.locator('.submit-button').click()
  await expect(page.locator('.status-success')).toContainText('demonstration enquiry was received')
  expect(enquiryRequests).toBe(1)
})
