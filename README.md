# SmartBill

SmartBill is a polished full-stack invoice and billing application built as a developer assessment project. It combines a neo-brutalist React frontend with an Express + Prisma + PostgreSQL backend, following an MVC-style architecture and emphasizing clean billing logic, validation, and maintainable structure.

## Highlights

- Professional invoice creation workflow
- Live billing calculations with backend recalculation as the source of truth
- Dashboard with invoice summaries and recent invoices
- Invoice detail view with print-friendly output
- CRUD support for invoices and customers
- Prisma-based persistence with PostgreSQL
- Unit tests for billing business logic
- Docker support for local development

## Architecture

The backend follows an MVC-oriented structure:

- Controllers: request handling and response shaping
- Services: business logic and orchestration
- Validators: Zod-based input validation
- Middleware: centralized error handling
- Utils: reusable invoice and monetary helpers

This separation keeps invoice calculations and persistence logic independent from HTTP concerns, making the app easier to maintain and extend.

## Why the architecture looks like this

1. MVC/service separation keeps HTTP, business rules, and data access responsibilities distinct.
2. Invoice values are stored as snapshots in the database so historical invoices remain consistent even if current prices change.
3. Totals are recalculated on the backend before saving to ensure the server remains the authoritative source of truth.
4. Monetary precision is handled with integer minor units to avoid floating-point drift.
5. The project prioritizes a small, polished billing experience over a large but shallow feature set.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Lucide Icons
- Backend: Node.js, Express, TypeScript, Zod
- Database: PostgreSQL + Prisma ORM
- Testing: Vitest
- Containerization: Docker + Docker Compose

## API Endpoints

- GET /api/health
- GET /api/invoices
- GET /api/invoices/:id
- POST /api/invoices
- PUT /api/invoices/:id
- PATCH /api/invoices/:id/status
- DELETE /api/invoices/:id
- GET /api/invoices/stats
- GET /api/customers
- POST /api/customers
- PUT /api/customers/:id
- DELETE /api/customers/:id

## Local Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd SmartBill
```

### 2. Configure environment variables

Use the existing environment files and adjust values as needed:

```bash
# Edit server/.env for backend settings
# Edit client/.env for frontend settings
```

### 3. Start PostgreSQL

Using Docker:

```bash
docker compose up postgres -d
```

### 4. Run Prisma migrations and seed data

```bash
cd server
npm install
npx prisma migrate dev --name init
npm run prisma:seed
```

### 5. Start the development servers

```bash
# terminal 1
cd server
npm run dev

# terminal 2
cd client
npm run dev
```

The frontend will run on http://localhost:5173 and the backend on http://localhost:5000.

## Environment Variables

### Server

- PORT
- NODE_ENV
- DATABASE_URL
- CORS_ORIGIN

### Client

- VITE_API_URL

## Database Migration

```bash
cd server
npx prisma migrate dev
```

## Running Tests

```bash
cd server
npm test
```

## Docker Setup

```bash
docker compose up --build
```

This will start PostgreSQL, the backend, and the frontend together.

## Deployment Notes

- Frontend: deployable to Vercel with the Vite build output
- Backend: deployable separately with a PostgreSQL-compatible DATABASE_URL
- Keep secrets in environment variables and avoid committing .env files

## Known Limitations

- The application intentionally focuses on polished core billing workflows rather than extensive analytics or multi-user features.
- The current implementation uses a simple local-style invoice number generation flow suitable for the assessment scope.

## Future Improvements

- Authentication and authorization
- PDF export improvements
- Pagination and advanced filtering
- Invoice templates and branding customization
