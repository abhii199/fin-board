# Finance Dashboard Backend

A comprehensive REST API backend for a Finance Dashboard System with role-based access control, built with Express.js, MongoDB, and JWT authentication.

## Features

- **User Management**: Registration, authentication, role assignment
- **Role-Based Access Control**: Viewer, Analyst, Admin roles with specific permissions
- **Financial Records**: CRUD operations with filtering and pagination
- **Dashboard Summary**: Aggregated data, trends, and analytics
- **Input Validation**: Joi-based validation for all endpoints
- **Rate Limiting**: Protection against brute force attacks
- **Error Handling**: Consistent error responses across the API

## Project Structure

```
finance-backend/
├── config/           # Configuration files
├── controllers/      # Route handlers
├── middleware/       # Express middleware (auth, validation, error handling)
├── models/           # Mongoose models
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Helper functions
├── validators/       # Joi validation schemas
├── tests/            # Unit and integration tests
├── src/              # Entry point
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 16+
- MongoDB 4.4+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd finance-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
```

### Running the Application

```bash
# Development
npm run dev

# Production
npm start

# Run tests
npm test
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| GET | `/api/v1/auth/profile` | Get current user profile |
| PUT | `/api/v1/auth/change-password` | Change password |

### User Management (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/` | List all users |
| GET | `/api/v1/auth/:id` | Get user by ID |
| PUT | `/api/v1/auth/:id` | Update user |
| DELETE | `/api/v1/auth/:id` | Delete user |

### Financial Records

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/v1/records` | List records | All |
| POST | `/api/v1/records` | Create record | Admin |
| GET | `/api/v1/records/:id` | Get record | All |
| PUT | `/api/v1/records/:id` | Update record | Admin |
| DELETE | `/api/v1/records/:id` | Delete record | Admin |
| GET | `/api/v1/records/categories` | List categories | All |

### Summary & Analytics

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/v1/summary/dashboard` | Dashboard summary | All |
| GET | `/api/v1/summary/monthly-comparison` | Monthly comparison | All |
| GET | `/api/v1/summary/top-categories` | Top categories | All |

## Roles and Permissions

### Roles

- **Viewer**: Can view records and summary data
- **Analyst**: Can view records, summary data, and trends
- **Admin**: Full access to all features

### Permissions

| Permission | Viewer | Analyst | Admin |
|------------|--------|---------|-------|
| read_records | ✓ | ✓ | ✓ |
| read_summary | ✓ | ✓ | ✓ |
| create_records | ✗ | ✗ | ✓ |
| update_records | ✗ | ✗ | ✓ |
| delete_records | ✗ | ✗ | ✓ |
| manage_users | ✗ | ✗ | ✓ |

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Query Parameters

### Records Filtering

```
GET /api/v1/records?startDate=2024-01-01&endDate=2024-12-31&type=income&category=Salary&page=1&limit=20
```

### Summary Options

```
GET /api/v1/summary/dashboard?startDate=2024-01-01&endDate=2024-12-31&groupBy=month
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/finance_dashboard |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRES_IN | Token expiration | 7d |

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    { "field": "fieldName", "message": "Error description" }
  ]
}
```

## Assumptions

1. **Soft Delete**: Financial records use soft delete to preserve data integrity
2. **User Isolation**: Users can only access their own records
3. **Default Role**: New users are assigned the 'viewer' role
4. **Token-based Auth**: JWT tokens are used for stateless authentication
5. **Validation**: All inputs are validated using Joi schemas
6. **Date Range**: All dates are in ISO 8601 format

## Future Enhancements

- Email notifications
- Data export (CSV, Excel)
- Recurring transactions
- Budget tracking
- Multi-currency support
- Audit logging

## License

MIT
