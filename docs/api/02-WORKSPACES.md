# Workspaces API

**Base Path**: `/api/v1/workspaces`

## Endpoints Overview

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | List user's workspaces | Yes | Any |
| POST | `/` | Create workspace | Yes | Any |
| GET | `/:id` | Get workspace details | Yes | Member |
| PATCH | `/:id` | Update workspace | Yes | Admin |
| DELETE | `/:id` | Delete workspace | Yes | Owner |
| POST | `/:id/invites` | Invite member | Yes | Admin |
| GET | `/:id/invites` | List pending invites | Yes | Admin |
| DELETE | `/:id/invites/:inviteId` | Cancel invite | Yes | Admin |
| POST | `/join` | Accept invite | Yes | Any |
| GET | `/:id/members` | List members | Yes | Member |
| PATCH | `/:id/members/:userId` | Update member role | Yes | Admin |
| DELETE | `/:id/members/:userId` | Remove member | Yes | Admin |

---

## GET /

List all workspaces the user belongs to.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "My Company",
      "slug": "my-company",
      "logo_url": "https://example.com/logo.png",
      "role": "owner",
      "member_count": 5,
      "subscription_plan": "professional",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Client Project",
      "slug": "client-project",
      "logo_url": null,
      "role": "member",
      "member_count": 12,
      "subscription_plan": "enterprise",
      "created_at": "2024-02-01T09:00:00Z"
    }
  ]
}
```

---

## POST /

Create a new workspace.

### Request

```json
{
  "name": "New Startup",
  "slug": "new-startup"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | 2-50 characters |
| slug | string | No | Lowercase, alphanumeric, hyphens only |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "New Startup",
    "slug": "new-startup",
    "logo_url": null,
    "owner_id": "550e8400-e29b-41d4-a716-446655440000",
    "subscription_plan": "free",
    "settings": {},
    "created_at": "2024-03-01T14:00:00Z"
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 409 | SLUG_EXISTS | Workspace slug already taken |
| 403 | WORKSPACE_LIMIT | Maximum workspaces reached for plan |

---

## GET /:id

Get workspace details.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "My Company",
    "slug": "my-company",
    "logo_url": "https://example.com/logo.png",
    "owner_id": "550e8400-e29b-41d4-a716-446655440000",
    "subscription_plan": "professional",
    "subscription_status": "active",
    "settings": {
      "default_timezone": "America/New_York",
      "week_start": "monday",
      "sprint_duration_weeks": 2
    },
    "stats": {
      "member_count": 5,
      "product_count": 3,
      "active_features": 24,
      "active_sprints": 2
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-03-01T14:00:00Z"
  }
}
```

---

## PATCH /:id

Update workspace settings.

### Request

```json
{
  "name": "My Company Inc.",
  "logo_url": "https://example.com/new-logo.png",
  "settings": {
    "default_timezone": "Europe/London",
    "sprint_duration_weeks": 3
  }
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "My Company Inc.",
    "slug": "my-company",
    "logo_url": "https://example.com/new-logo.png",
    "settings": {
      "default_timezone": "Europe/London",
      "week_start": "monday",
      "sprint_duration_weeks": 3
    },
    "updated_at": "2024-03-02T10:00:00Z"
  }
}
```

---

## DELETE /:id

Delete workspace and all associated data.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Workspace deleted successfully"
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 403 | NOT_OWNER | Only owner can delete workspace |
| 400 | ACTIVE_SUBSCRIPTION | Cancel subscription first |

---

## POST /:id/invites

Invite a new member to the workspace.

### Request

```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| role | string | Yes | One of: admin, manager, member, viewer |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "email": "newmember@example.com",
    "role": "member",
    "status": "pending",
    "invited_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "expires_at": "2024-03-08T14:00:00Z",
    "created_at": "2024-03-01T14:00:00Z"
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 409 | ALREADY_MEMBER | User is already a member |
| 409 | INVITE_EXISTS | Pending invite already exists |
| 403 | MEMBER_LIMIT | Maximum members reached for plan |

---

## GET /:id/invites

List pending invitations.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "email": "newmember@example.com",
      "role": "member",
      "status": "pending",
      "invited_by": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe"
      },
      "expires_at": "2024-03-08T14:00:00Z",
      "created_at": "2024-03-01T14:00:00Z"
    }
  ]
}
```

---

## DELETE /:id/invites/:inviteId

Cancel a pending invitation.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Invitation cancelled"
}
```

---

## POST /join

Accept a workspace invitation.

### Request

```json
{
  "token": "invite_token_from_email"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "workspace": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "My Company",
      "slug": "my-company"
    },
    "role": "member"
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | INVALID_TOKEN | Token is invalid or expired |
| 409 | ALREADY_MEMBER | Already a member of this workspace |

---

## GET /:id/members

List workspace members.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max 100) |
| role | string | - | Filter by role |
| search | string | - | Search by name or email |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "role": "owner",
      "joined_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440005",
      "email": "jane@example.com",
      "full_name": "Jane Smith",
      "avatar_url": null,
      "role": "admin",
      "joined_at": "2024-02-01T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

---

## PATCH /:id/members/:userId

Update a member's role.

### Request

```json
{
  "role": "admin"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440005",
    "email": "jane@example.com",
    "full_name": "Jane Smith",
    "role": "admin",
    "updated_at": "2024-03-01T14:00:00Z"
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 403 | CANNOT_CHANGE_OWNER | Cannot change owner's role |
| 403 | INSUFFICIENT_PERMISSIONS | Cannot assign higher role |

---

## DELETE /:id/members/:userId

Remove a member from the workspace.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 403 | CANNOT_REMOVE_OWNER | Cannot remove workspace owner |
| 403 | CANNOT_REMOVE_SELF | Use leave endpoint instead |
