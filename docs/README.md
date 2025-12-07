# TaskFlow API Documentation

**Version**: 1.0.0  
**Base URL**: `https://api.taskflow.app/v1`

## Overview

TaskFlow is a comprehensive product management platform for teams. This documentation covers all API endpoints, database schema, and implementation guidelines.

## Documentation Structure

| File | Description |
|------|-------------|
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Complete PostgreSQL database schema with tables, enums, and relationships |
| [01-AUTH.md](./api/01-AUTH.md) | Authentication endpoints (signup, login, tokens, password reset) |
| [02-WORKSPACES.md](./api/02-WORKSPACES.md) | Workspace management and invitations |
| [03-PRODUCTS.md](./api/03-PRODUCTS.md) | Product CRUD operations |
| [04-FEATURES.md](./api/04-FEATURES.md) | Feature management with lifecycle stages |
| [05-SPRINTS.md](./api/05-SPRINTS.md) | Sprint planning and management |
| [06-TASKS.md](./api/06-TASKS.md) | Task operations with time tracking |
| [07-BUGS.md](./api/07-BUGS.md) | Bug reporting and tracking |
| [08-RELEASES.md](./api/08-RELEASES.md) | Release management and deployment |
| [09-TEAM.md](./api/09-TEAM.md) | Team members, roles, and permissions |
| [10-ANALYTICS.md](./api/10-ANALYTICS.md) | Analytics and reporting |
| [11-BILLING.md](./api/11-BILLING.md) | Subscription and payment management |
| [12-SETTINGS.md](./api/12-SETTINGS.md) | User and workspace settings |

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Access tokens expire after 15 minutes. Use the refresh token endpoint to get a new access token.

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Rate Limiting

- **Standard**: 100 requests/minute
- **Auth endpoints**: 10 requests/minute
- **File uploads**: 20 requests/minute

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```
