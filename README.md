# Finance Data Processing and Access Control Backend

A simple and clear backend for a finance dashboard assignment using Node.js, Express, MongoDB (Mongoose), JWT authentication, role-based access control, and summary aggregations.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT auth
- Zod validation
- Express Rate Limit

## Features Implemented

- User and role management (`viewer`, `analyst`, `admin`)
- User status handling (`active`, `inactive`)
- JWT-based authentication
- Financial records CRUD with filtering and pagination
- Dashboard summary APIs (totals, net balance, category totals, recent activity)
- Monthly trend summary
- Role-based access restrictions
- Input validation and clear error responses
- Soft delete for records
- API rate limiting

## Role Access Matrix

- `viewer`
  - Can access summary endpoints only
  - Cannot read/create/update/delete records
- `analyst`
  - Can read records and summaries
  - Cannot create/update/delete records
- `admin`
  - Full access to users, records, and summaries

## Project Structure

- `src/index.js`: app bootstrap, middleware setup, error handling
- `src/utils/db.js`: MongoDB connection
- `src/models/User.js`: user schema + password hashing
- `src/models/Financial-Records.js`: financial records schema + soft delete
- `src/models/Category.js`: category model (optional extension)
- `src/middlewares/auth.js`: auth + role authorization
- `src/middlewares/rateLimmiter.js`: global and login rate limiting
- `src/controllers/*.js`: request handling logic
- `src/routes/*.js`: API route definitions

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Ensure `.env` contains:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/finance_dashboard
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

3. Start server:

```bash
pnpm start
```

## API Base URL

`/api/v1`

## Health

- `GET /api/v1/health`

## Auth and Users

- `POST /api/v1/auth/register`
  - Register user (`name`, `email`, `password`, optional `role`, optional `status`)
- `POST /api/v1/auth/login`
  - Login and get JWT (`email`, `password`)
- `GET /api/v1/auth/profile` (auth required)
- `PATCH /api/v1/auth/change-password` (auth required)
  - body: `currentPassword`, `newPassword`

Admin only:
- `GET /api/v1/auth/users`
- `GET /api/v1/auth/users/:id`
- `PATCH /api/v1/auth/users/:id`
- `DELETE /api/v1/auth/users/:id`

## Financial Records

- `GET /api/v1/records` (analyst/admin)
  - Query: `type`, `category`, `from`, `to`, `page`, `limit`
  - Admin can also query another user: `userId`
- `GET /api/v1/records/:id` (analyst/admin)
- `POST /api/v1/records` (admin)
  - body: `amount`, `type`, `category`, optional `date`, optional `notes`, optional `userId`
- `PATCH /api/v1/records/:id` (admin)
- `DELETE /api/v1/records/:id` (admin, soft delete)

## Summary APIs

- `GET /api/v1/summary/dashboard` (viewer/analyst/admin)
  - Query: `from`, `to`, optional `userId` for admin
  - Returns: total income, total expenses, net balance, category totals, recent activity
- `GET /api/v1/summary/trends` (viewer/analyst/admin)
  - Query: `months` (default 6, max 24), optional `userId` for admin
  - Returns monthly income/expense/net trends

## Assumptions and Tradeoffs

- Registration is open by default for assignment simplicity.
- `admin` role controls user management and all write operations.
- Record delete is implemented as soft delete.
- `Category` model is included but not enforced in record validation to keep implementation straightforward.
- Users generally operate on their own data, while `admin` can inspect other users via `userId` query.

## Submission Notes

This implementation maps directly to the assignment requirements:
- clear role model and access control
- complete financial record management
- meaningful dashboard summaries
- validation and error handling
- persistent storage via MongoDB
