# MediScan Backend

Express.js backend with PostgreSQL and Prisma ORM.

## Setup

1. Install dependencies:

```bash
npm install
```

1. Configure your database URL in `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/mediscan?schema=public"
```

1. Generate Prisma client:

```bash
npm run db:generate
```

1. Run migrations:

```bash
npm run db:migrate
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
