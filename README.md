# Savanna Trails

Savanna Trails is a **fictional Kenyan tours and travel business created as a portfolio demonstration**. The tours, prices, and enquiry workflow are illustrative. This project is not a real travel operator, does not accept bookings or payments, and does not send email.

## Features

- Responsive Kenyan landscape-inspired interface with original CSS artwork.
- Mobile navigation with keyboard support and an Escape-key close action.
- Six sample tours with destinations, durations, descriptions, and sample KES prices.
- Combined tour-name search and destination filtering with a clear no-results state.
- Enquire links that select the relevant tour and move focus into the enquiry form.
- Accessible enquiry form with field-level validation and loading, success, and error states.
- Duplicate-submission prevention while a request is active.
- Express REST API with the same validation enforced again on the server.
- Temporary in-memory enquiry storage for demonstration purposes.
- Automated Node tests covering filtering, valid and invalid API submissions, malformed input, and unavailable-server responses.
- Playwright browser tests covering responsive navigation, combined filters, tour selection, validation, submission, and failure recovery.

## Technology stack

- React and JavaScript
- Vite
- Plain CSS
- Node.js and Express
- Native Fetch API
- Node's built-in test runner
- Playwright
- ESLint

## Requirements

- Windows with PowerShell
- Node.js 20.19+ or 22.12+ (a current LTS release is recommended)
- npm

The commands use `npm.cmd` because it works even when PowerShell's script execution policy blocks `npm.ps1`.

## Setup

```powershell
cd D:\personal\savanna-trails
npm.cmd ci
Copy-Item .env.example .env
```

The `.env` file is optional when using the default ports. It is ignored by Git.

### Development

Run the Express API in the first terminal:

```powershell
npm.cmd run server:watch
```

Run Vite in a second terminal:

```powershell
npm.cmd run dev
```

Open `http://127.0.0.1:5173`. Vite forwards `/api` requests to the Express server.

### Production-style local run

Build the frontend and start Express:

```powershell
npm.cmd run build
npm.cmd start
```

Open `http://127.0.0.1:5000`. Express serves both the built frontend and API.

### GitHub Pages frontend demo

In the `savanna-trails` GitHub repository, open **Settings → Pages** and set **Source** to **GitHub Actions**. Upload the project's `.github` folder along with the source files, then commit to `main`. The **Publish Savanna Trails** workflow builds and publishes the frontend.

The workflow sets the build's base path to `/savanna-trails/` for the repository URL. The local development and production-style commands above use their usual addresses.

GitHub Pages serves the frontend. Successful enquiry submissions require a separately deployed Express API and an updated `VITE_API_BASE_URL` during the frontend build. That API must allow the frontend origin through its CORS policy. The included API settings support local development and the same-origin Express deployment described above.

### Checks

Run the lightweight quality gate, which lints the source, runs the Node tests, and creates a production build:

```powershell
npm.cmd run check
```

Install Playwright's Chromium browser once, then run the browser-level journeys:

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Playwright starts or reuses both the Express and Vite development servers automatically.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/App.jsx` | Composes the page and coordinates selected-tour state. |
| `src/components/` | Focused React sections, cards, icons, and the enquiry form. |
| `src/styles/` | Ordered CSS files for foundations, page sections, and responsive rules. |
| `shared/` | Tour data and validation shared by the browser and server. |
| `server/` | Express application and local server entry point. |
| `test/` | Fast Node tests for filtering and the API. |
| `e2e/` | Playwright tests for complete browser journeys. |

## Environment variables

Copy [.env.example](.env.example) to `.env` before changing the defaults.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | Port used by the Express server. |
| `API_PROXY_TARGET` | `http://127.0.0.1:5000` | API target used by Vite's development proxy. |
| `VITE_API_BASE_URL` | Empty | Optional API base path or origin used by the browser build. Leave empty for the supported proxy and same-origin setup. An external origin must allow this frontend through its own CORS policy. |

Variables prefixed with `VITE_` are included in the browser build and must never contain secrets.

## API

### `GET /api/health`

Returns the server and storage mode:

```json
{
  "status": "ok",
  "storage": "temporary in-memory"
}
```

### `POST /api/enquiries`

Accepts JSON with these fields:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `fullName` | string | Yes | Non-empty, maximum 100 characters. |
| `email` | string | Yes | Valid email format, maximum 254 characters. |
| `tour` | string | Yes | Must match one of the six sample tours. |
| `travelDate` | `YYYY-MM-DD` string | Yes | Valid date that is not in the past. |
| `travellers` | number or numeric string | Yes | Whole number between 1 and 100. |
| `message` | string | No | Maximum 1,000 characters. |

Example request:

```json
{
  "fullName": "Amina Kamau",
  "email": "amina@example.com",
  "tour": "Maasai Mara Explorer",
  "travelDate": "2027-01-15",
  "travellers": 2,
  "message": "A demonstration enquiry."
}
```

A valid request returns HTTP `201` with a temporary numeric ID and an explicit demonstration message. Validation failures return HTTP `400` with a general message and an `errors` object keyed by field name. The API never claims that a booking was confirmed or an email was sent.

## Temporary storage limitation

Enquiries are stored in a process-local JavaScript array. They disappear whenever the Express server stops or restarts, are not shared between server processes, and are not suitable for production use. There is no database, email delivery, authentication, payment handling, spam protection, or public enquiry-list endpoint.

## Manual verification checklist

- Resize the page at phone, tablet, and desktop widths and check for horizontal overflow.
- Open the mobile menu, follow each link, and close it with Escape.
- Search by tour name, combine search with a destination, and trigger the no-results state.
- Clear the filters and confirm all six tours return.
- Activate each Enquire link and confirm the correct tour is selected in the form.
- Submit an empty or invalid form and check field-level errors and focus placement.
- Submit a valid future-dated enquiry and check the loading and success states.
- Stop Express while Vite remains open, submit again, and confirm values remain in the form with an unavailable-server message.
- Navigate using only the keyboard and verify the skip link, labels, tab order, and visible focus indicators.
- Check the browser console for errors.
