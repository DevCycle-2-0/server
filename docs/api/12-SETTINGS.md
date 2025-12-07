# Settings API

**Base Path**: `/api/v1`

## Endpoints Overview

### User Settings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me/settings` | Get user settings | Yes |
| PATCH | `/users/me/settings` | Update user settings | Yes |
| PATCH | `/users/me/profile` | Update user profile | Yes |
| POST | `/users/me/avatar` | Upload avatar | Yes |
| DELETE | `/users/me/avatar` | Remove avatar | Yes |
| POST | `/users/me/change-password` | Change password | Yes |
| POST | `/users/me/enable-2fa` | Enable 2FA | Yes |
| POST | `/users/me/disable-2fa` | Disable 2FA | Yes |
| GET | `/users/me/sessions` | List active sessions | Yes |
| DELETE | `/users/me/sessions/:id` | Revoke session | Yes |

### Workspace Settings
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/workspaces/:id/settings` | Get workspace settings | Yes | Admin |
| PATCH | `/workspaces/:id/settings` | Update workspace settings | Yes | Admin |
| GET | `/workspaces/:id/integrations` | List integrations | Yes | Admin |
| POST | `/workspaces/:id/integrations` | Add integration | Yes | Admin |
| DELETE | `/workspaces/:id/integrations/:integrationId` | Remove integration | Yes | Admin |

---

## GET /users/me/settings

Get current user's settings.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "theme": "system",
    "language": "en",
    "timezone": "America/New_York",
    "date_format": "MMM dd, yyyy",
    "time_format": "12h",
    "notifications": {
      "email": {
        "enabled": true,
        "digest": "daily",
        "task_assigned": true,
        "task_completed": true,
        "mentions": true,
        "sprint_updates": true,
        "release_updates": true
      },
      "push": {
        "enabled": true,
        "task_assigned": true,
        "mentions": true,
        "urgent_only": false
      },
      "desktop": {
        "enabled": true,
        "sound": true
      }
    },
    "display": {
      "compact_mode": false,
      "show_avatars": true,
      "sidebar_collapsed": false,
      "default_view": "list"
    },
    "accessibility": {
      "reduce_motion": false,
      "high_contrast": false,
      "font_size": "medium"
    },
    "keyboard_shortcuts": true,
    "two_factor_enabled": false,
    "updated_at": "2024-03-01T10:00:00Z"
  }
}
```

---

## PATCH /users/me/settings

Update user settings.

### Request

```json
{
  "theme": "dark",
  "language": "fr",
  "timezone": "Europe/Paris",
  "notifications": {
    "email": {
      "digest": "weekly",
      "sprint_updates": false
    }
  },
  "display": {
    "compact_mode": true
  }
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "theme": "dark",
    "language": "fr",
    "timezone": "Europe/Paris",
    "notifications": {
      "email": {
        "enabled": true,
        "digest": "weekly",
        "task_assigned": true,
        "task_completed": true,
        "mentions": true,
        "sprint_updates": false,
        "release_updates": true
      }
    },
    "display": {
      "compact_mode": true,
      "show_avatars": true,
      "sidebar_collapsed": false,
      "default_view": "list"
    },
    "updated_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## PATCH /users/me/profile

Update user profile information.

### Request

```json
{
  "full_name": "John D. Doe",
  "title": "Staff Engineer",
  "department": "Platform",
  "bio": "Building great products",
  "contact": {
    "phone": "+1-555-123-4567",
    "slack": "@johndoe",
    "github": "johndoe"
  }
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "full_name": "John D. Doe",
    "title": "Staff Engineer",
    "department": "Platform",
    "bio": "Building great products",
    "avatar_url": "https://example.com/avatar.jpg",
    "contact": {
      "phone": "+1-555-123-4567",
      "slack": "@johndoe",
      "github": "johndoe"
    },
    "updated_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## POST /users/me/avatar

Upload a new avatar image.

### Request

**Content-Type**: `multipart/form-data`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| avatar | file | Yes | JPEG, PNG, GIF. Max 5MB. Min 100x100px |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "avatar_url": "https://storage.example.com/avatars/550e8400-e29b-41d4-a716-446655440000.jpg",
    "updated_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## DELETE /users/me/avatar

Remove current avatar.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Avatar removed"
}
```

---

## POST /users/me/change-password

Change account password.

### Request

```json
{
  "current_password": "OldSecurePass123!",
  "new_password": "NewSecurePass456!",
  "new_password_confirmation": "NewSecurePass456!"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 401 | INCORRECT_PASSWORD | Current password is wrong |
| 422 | PASSWORD_MISMATCH | New passwords don't match |
| 422 | WEAK_PASSWORD | Password doesn't meet requirements |
| 422 | SAME_PASSWORD | New password same as current |

---

## POST /users/me/enable-2fa

Enable two-factor authentication.

### Step 1: Request setup

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
    "backup_codes": [
      "abc123def456",
      "ghi789jkl012",
      "mno345pqr678",
      "stu901vwx234",
      "yza567bcd890"
    ]
  }
}
```

### Step 2: Verify and activate

### Request

```json
{
  "code": "123456"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "two_factor_enabled": true,
    "enabled_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## POST /users/me/disable-2fa

Disable two-factor authentication.

### Request

```json
{
  "password": "SecurePass123!",
  "code": "123456"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "two_factor_enabled": false,
    "disabled_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## GET /users/me/sessions

List active sessions.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "sess_001",
      "device": {
        "type": "desktop",
        "os": "macOS 14.2",
        "browser": "Chrome 122"
      },
      "ip_address": "192.168.1.1",
      "location": "New York, NY, US",
      "is_current": true,
      "last_active": "2024-03-10T10:00:00Z",
      "created_at": "2024-03-01T09:00:00Z"
    },
    {
      "id": "sess_002",
      "device": {
        "type": "mobile",
        "os": "iOS 17.2",
        "browser": "Safari"
      },
      "ip_address": "192.168.1.2",
      "location": "New York, NY, US",
      "is_current": false,
      "last_active": "2024-03-09T18:00:00Z",
      "created_at": "2024-02-15T10:00:00Z"
    }
  ]
}
```

---

## DELETE /users/me/sessions/:id

Revoke a session (log out from device).

### Response (200 OK)

```json
{
  "success": true,
  "message": "Session revoked"
}
```

---

## GET /workspaces/:id/settings

Get workspace settings.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "general": {
      "name": "My Company",
      "slug": "my-company",
      "logo_url": "https://example.com/logo.png",
      "default_timezone": "America/New_York",
      "week_start": "monday"
    },
    "features": {
      "feature_voting": true,
      "public_roadmap": false,
      "require_feature_approval": true,
      "auto_close_resolved_bugs": true
    },
    "sprints": {
      "default_duration_weeks": 2,
      "auto_create_next": true,
      "require_retrospective": true
    },
    "notifications": {
      "daily_digest": true,
      "sprint_reminders": true,
      "release_announcements": true
    },
    "security": {
      "require_2fa": false,
      "allowed_email_domains": [],
      "session_timeout_hours": 24,
      "ip_whitelist": []
    },
    "branding": {
      "primary_color": "#6366F1",
      "logo_url": "https://example.com/logo.png",
      "favicon_url": null
    },
    "updated_at": "2024-03-01T10:00:00Z"
  }
}
```

---

## PATCH /workspaces/:id/settings

Update workspace settings.

### Request

```json
{
  "general": {
    "default_timezone": "Europe/London"
  },
  "features": {
    "require_feature_approval": false
  },
  "sprints": {
    "default_duration_weeks": 3
  },
  "security": {
    "require_2fa": true,
    "allowed_email_domains": ["company.com", "contractor.com"]
  }
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "general": {
      "default_timezone": "Europe/London"
    },
    "features": {
      "require_feature_approval": false
    },
    "sprints": {
      "default_duration_weeks": 3
    },
    "security": {
      "require_2fa": true,
      "allowed_email_domains": ["company.com", "contractor.com"]
    },
    "updated_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## GET /workspaces/:id/integrations

List configured integrations.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "int_001",
      "type": "slack",
      "name": "Slack",
      "status": "connected",
      "config": {
        "workspace_name": "My Company",
        "default_channel": "#engineering"
      },
      "connected_at": "2024-02-01T10:00:00Z"
    },
    {
      "id": "int_002",
      "type": "github",
      "name": "GitHub",
      "status": "connected",
      "config": {
        "organization": "my-company",
        "repositories": ["frontend", "backend", "mobile"]
      },
      "connected_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "int_003",
      "type": "jira",
      "name": "Jira",
      "status": "disconnected",
      "config": null,
      "connected_at": null
    }
  ],
  "available": [
    {
      "type": "linear",
      "name": "Linear",
      "description": "Sync issues and projects with Linear",
      "icon_url": "https://example.com/linear-icon.png"
    },
    {
      "type": "figma",
      "name": "Figma",
      "description": "Link Figma designs to features",
      "icon_url": "https://example.com/figma-icon.png"
    }
  ]
}
```

---

## POST /workspaces/:id/integrations

Add a new integration.

### Request

```json
{
  "type": "slack",
  "auth_code": "oauth_code_from_slack"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "int_004",
    "type": "slack",
    "name": "Slack",
    "status": "connected",
    "config": {
      "workspace_name": "My Company",
      "default_channel": "#general"
    },
    "connected_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## DELETE /workspaces/:id/integrations/:integrationId

Remove an integration.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Integration disconnected"
}
```
