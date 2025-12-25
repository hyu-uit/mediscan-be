# MediScan Backend

Medication reminder backend with Node.js, Express, TypeScript, Prisma.

## Project Structure

```
src/
├── index.ts              # Entry point
├── constants/            # Constants, enum mappings
├── types/                # TypeScript types
├── utils/                # Utilities (prisma, response, errors, time)
├── middleware/           # Auth, error handling
├── routes/               # URL routing
├── controllers/          # HTTP handlers
├── services/             # Business logic
├── queues/               # BullMQ queues
└── workers/              # Background jobs
```

## Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Medications
- `GET /api/medications` - Get all
- `POST /api/medications` - Create
- `PATCH /api/medications/:id` - Update
- `DELETE /api/medications/:id` - Delete

### Schedules
- `POST /api/schedules/bulk` - Bulk create medications with schedules
- `POST /api/schedules` - Create schedule
- `GET /api/schedules/medication/:id` - Get by medication
- `PATCH /api/schedules/:id` - Update
- `DELETE /api/schedules/:id` - Delete

### Medication Logs
- `GET /api/medication-logs` - Get logs (today or ?date=)
- `POST /api/medication-logs/:id/taken` - Mark taken
- `POST /api/medication-logs/:id/skip` - Skip

### User Settings
- `GET /api/user-settings` - Get
- `PATCH /api/user-settings` - Update
