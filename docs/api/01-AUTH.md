# Authentication API

**Base Path**: `/api/v1/auth`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Create new account | No |
| POST | `/login` | Authenticate user | No |
| POST | `/logout` | End session | Yes |
| POST | `/refresh` | Refresh access token | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |
| POST | `/verify-email` | Verify email address | No |
| POST | `/resend-verification` | Resend verification email | No |
| GET | `/me` | Get current user | Yes |

---

## POST /signup

Create a new user account.

### Request

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "workspace_name": "My Company"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 number |
| full_name | string | Yes | 2-100 characters |
| workspace_name | string | No | 2-50 characters (defaults to "{name}'s Workspace") |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "avatar_url": null,
      "email_verified": false,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "workspace": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "My Company",
      "slug": "my-company",
      "role": "owner"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
      "expires_in": 900,
      "token_type": "Bearer"
    }
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 409 | EMAIL_EXISTS | Email already registered |
| 422 | WEAK_PASSWORD | Password doesn't meet requirements |

---

## POST /login

Authenticate with email and password.

### Request

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "email_verified": true,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "workspaces": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "My Company",
        "slug": "my-company",
        "role": "owner"
      }
    ],
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
      "expires_in": 900,
      "token_type": "Bearer"
    }
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 401 | INVALID_CREDENTIALS | Wrong email or password |
| 403 | EMAIL_NOT_VERIFIED | Email verification required |
| 423 | ACCOUNT_LOCKED | Too many failed attempts |

---

## POST /logout

End the current session and invalidate tokens.

### Headers

```
Authorization: Bearer <access_token>
```

### Request

```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

## POST /refresh

Get a new access token using refresh token.

### Request

```json
{
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "bmV3IHJlZnJlc2ggdG9rZW4...",
    "expires_in": 900,
    "token_type": "Bearer"
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 401 | INVALID_REFRESH_TOKEN | Token is invalid or expired |
| 401 | TOKEN_REVOKED | Token has been revoked |

---

## POST /forgot-password

Request a password reset email.

### Request

```json
{
  "email": "user@example.com"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "If an account exists, a reset email has been sent"
}
```

> **Note**: Always returns success to prevent email enumeration.

---

## POST /reset-password

Reset password using the token from email.

### Request

```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!",
  "password_confirmation": "NewSecurePass123!"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | INVALID_TOKEN | Token is invalid or expired |
| 422 | PASSWORD_MISMATCH | Passwords don't match |
| 422 | WEAK_PASSWORD | Password doesn't meet requirements |

---

## POST /verify-email

Verify email address with token.

### Request

```json
{
  "token": "verification_token_from_email"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## POST /resend-verification

Resend email verification link.

### Request

```json
{
  "email": "user@example.com"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

## GET /me

Get current authenticated user.

### Headers

```
Authorization: Bearer <access_token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "timezone": "America/New_York",
    "locale": "en",
    "email_verified": true,
    "created_at": "2024-01-15T10:30:00Z",
    "workspaces": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "My Company",
        "slug": "my-company",
        "role": "owner"
      }
    ]
  }
}
```
