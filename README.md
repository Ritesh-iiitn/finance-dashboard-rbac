# Full-Stack Finance Dashboard

A complete full-stack Finance Dashboard built with modern web technologies, offering role-based access control, analytics summary, dynamic charting, and a clean user management system.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database ORM**: Prisma ORM with SQLite Database
- **Authentication**: NextAuth.js v5 (JWT-based)
- **UI/Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod
- **Security**: bcryptjs for password hashing
- **Charting**: recharts

## How to Run Locally

Follow these steps to set up and run the application on your local machine.

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd finance-dashboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory (or use `.env`):
```env
AUTH_SECRET="your_super_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup the Database and Run Migrations
```bash
npx prisma migrate dev --name init
# or simply push the schema
npx prisma db push
```

### 5. Seed the Database
```bash
npx tsx prisma/seed.ts
```

### 6. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`. You will be redirected to the login page.
Use one of the seeded accounts:
- `admin@example.com` / `admin123`
- `analyst@example.com` / `analyst123`
- `viewer@example.com` / `viewer123`

## API Endpoints List

### Authentication
- `POST /api/auth/register` (Public)
  Registers a new user. Returns a User object.
- POST handled natively via NextAuth for credentials login.

### Financial Records
- `GET /api/records` (Role: VIEWER)
  - Query Params: `?type=INCOME|EXPENSE`, `?category=string`, `?startDate=ISO`, `?endDate=ISO`, `?page=number`, `?limit=number`
  - Response: `{ success: true, data: { records: [...], total: 20, page: 1, limit: 10 } }`
- `POST /api/records` (Role: ADMIN)
  - Required Fields: `amount`, `type`, `category`, `date`, `description` (optional)
  - Response: `{ success: true, data: { id: "...", ... } }`
- `PUT /api/records/[id]` (Role: ADMIN)
  - Update fields via JSON body
  - Response: `{ success: true, data: { ... } }`
- `DELETE /api/records/[id]` (Role: ADMIN)
  - Soft-delete a record.
  - Response: `{ success: true }`

### Dashboard Summaries
- `GET /api/dashboard/summary` (Role: ANALYST, ADMIN)
  - Response: `{ success: true, data: { totalIncome: X, totalExpenses: Y, netBalance: Z, totalRecords: N } }`
- `GET /api/dashboard/by-category` (Role: ANALYST, ADMIN)
  - Response: `{ success: true, data: [ { category: "Food", income: 0, expense: 50 }, ... ] }`
- `GET /api/dashboard/trends` (Role: ANALYST, ADMIN)
  - Response: `{ success: true, data: [ { month: "Jan 24", totalIncome: 1000, totalExpenses: 500 }, ... ] }`
- `GET /api/dashboard/recent` (Role: VIEWER, ANALYST, ADMIN)
  - Response: `{ success: true, data: [ { ...record }, ... ] }`

### User Management
- `GET /api/users` (Role: ADMIN)
  - Response: `{ success: true, data: [ { id: "...", name: "...", role: "...", status: "..." } ] }`
- `POST /api/users` (Role: ADMIN)
  - Create a new user (with role & password)
- `PUT /api/users/[id]` (Role: ADMIN)
  - Update a user's role or status.
- `DELETE /api/users/[id]` (Role: ADMIN)
  - Soft-deactivates the user (sets status to `INACTIVE`).

## Assumptions & Tradeoffs

1. **SQLite Database**: Used SQLite for an easy local setup without needing a heavier database engine. However, Prisma allows migration to Postgres/MySQL by simply changing the `provider` in `schema.prisma`.
2. **Soft Deletes**: Deleting records or deactivating users doesn't destroy the row in the DB, to maintain historical data and compliance with basic audit logs. We filter `isDeleted: false` everywhere.
3. **Session Strategy**: Using JWT strategy for NextAuth as it allows fully stateless authentication which is suitable and scale-ready. 
4. **No Pagination on Users**: For simplicity, User listing is not paginated as internal admin dashboards usually manage fewer user accounts compared to financial records.
5. **No Strict Email Verification**: Account registration automatically provisions an `ACTIVE` account without verifying email logic out of the scope of this assignment.
6. **NextAuth Session Role Typing**: For Next.js TypeScript support, we extended `next-auth.d.ts` globally rather than complex generic declarations. 
7. **Role Hierarchy**: We enforced RBAC systematically into an extensible wrapper `withRoleGuard` using Next.js handlers approach over Edge Middleware, primarily to read Prisma DB effectively if needed without edge runtimes failing.
