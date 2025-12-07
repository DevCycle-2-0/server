# Products API

**Base Path**: `/api/v1/workspaces/:workspaceId/products`

## Endpoints Overview

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | List products | Yes | Member |
| POST | `/` | Create product | Yes | Manager |
| GET | `/:id` | Get product details | Yes | Member |
| PATCH | `/:id` | Update product | Yes | Manager |
| DELETE | `/:id` | Delete product | Yes | Admin |
| GET | `/:id/stats` | Get product statistics | Yes | Member |

---

## GET /

List all products in the workspace.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max 100) |
| status | string | - | Filter: active, archived |
| search | string | - | Search by name |
| sort | string | created_at | Sort field |
| order | string | desc | Sort order: asc, desc |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "aaa08400-e29b-41d4-a716-446655440001",
      "name": "Mobile App",
      "description": "iOS and Android mobile application",
      "logo_url": "https://example.com/mobile-logo.png",
      "color": "#6366F1",
      "status": "active",
      "stats": {
        "feature_count": 24,
        "active_sprint_count": 1,
        "open_bug_count": 5,
        "completion_percentage": 68
      },
      "created_by": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-03-01T14:00:00Z"
    },
    {
      "id": "bbb08400-e29b-41d4-a716-446655440002",
      "name": "Web Dashboard",
      "description": "Admin dashboard for managing the platform",
      "logo_url": null,
      "color": "#10B981",
      "status": "active",
      "stats": {
        "feature_count": 18,
        "active_sprint_count": 1,
        "open_bug_count": 2,
        "completion_percentage": 82
      },
      "created_by": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe"
      },
      "created_at": "2024-02-01T09:00:00Z",
      "updated_at": "2024-03-01T14:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "total_pages": 1
  }
}
```

---

## POST /

Create a new product.

### Request

```json
{
  "name": "API Service",
  "description": "Backend REST API service",
  "color": "#F59E0B",
  "settings": {
    "default_sprint_duration": 14,
    "enable_feature_voting": true
  }
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | 2-100 characters |
| description | string | No | Max 1000 characters |
| logo_url | string | No | Valid URL |
| color | string | No | Hex color code |
| settings | object | No | Product-specific settings |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "ccc08400-e29b-41d4-a716-446655440003",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "API Service",
    "description": "Backend REST API service",
    "logo_url": null,
    "color": "#F59E0B",
    "status": "active",
    "settings": {
      "default_sprint_duration": 14,
      "enable_feature_voting": true
    },
    "created_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "created_at": "2024-03-01T14:00:00Z",
    "updated_at": "2024-03-01T14:00:00Z"
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 409 | NAME_EXISTS | Product name already exists in workspace |
| 403 | PRODUCT_LIMIT | Maximum products reached for plan |

---

## GET /:id

Get detailed product information.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "aaa08400-e29b-41d4-a716-446655440001",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Mobile App",
    "description": "iOS and Android mobile application",
    "logo_url": "https://example.com/mobile-logo.png",
    "color": "#6366F1",
    "status": "active",
    "settings": {
      "default_sprint_duration": 14,
      "enable_feature_voting": true,
      "require_feature_approval": false
    },
    "stats": {
      "feature_count": 24,
      "features_by_stage": {
        "idea": 5,
        "discovery": 2,
        "planning": 3,
        "design": 2,
        "development": 6,
        "testing": 3,
        "release": 1,
        "live": 2
      },
      "task_count": 156,
      "tasks_completed": 98,
      "bug_count": 12,
      "bugs_resolved": 7,
      "sprint_count": 8,
      "active_sprint": {
        "id": "ddd08400-e29b-41d4-a716-446655440004",
        "name": "Sprint 8",
        "end_date": "2024-03-15"
      },
      "release_count": 5,
      "latest_release": {
        "id": "eee08400-e29b-41d4-a716-446655440005",
        "version": "2.1.0",
        "released_at": "2024-02-28T10:00:00Z"
      }
    },
    "created_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-03-01T14:00:00Z"
  }
}
```

---

## PATCH /:id

Update product details.

### Request

```json
{
  "name": "Mobile App v2",
  "description": "Updated mobile application for iOS and Android",
  "color": "#8B5CF6",
  "status": "active",
  "settings": {
    "default_sprint_duration": 21,
    "enable_feature_voting": true,
    "require_feature_approval": true
  }
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "aaa08400-e29b-41d4-a716-446655440001",
    "name": "Mobile App v2",
    "description": "Updated mobile application for iOS and Android",
    "color": "#8B5CF6",
    "status": "active",
    "settings": {
      "default_sprint_duration": 21,
      "enable_feature_voting": true,
      "require_feature_approval": true
    },
    "updated_at": "2024-03-02T10:00:00Z"
  }
}
```

---

## DELETE /:id

Delete a product and all associated data.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| archive | boolean | false | Archive instead of delete |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | HAS_ACTIVE_SPRINTS | Complete active sprints first |
| 403 | INSUFFICIENT_PERMISSIONS | Admin role required |

---

## GET /:id/stats

Get detailed product statistics.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | string | 30d | Time period: 7d, 30d, 90d, 1y, all |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_features": 24,
      "completed_features": 12,
      "in_progress_features": 8,
      "backlog_features": 4,
      "completion_rate": 50.0
    },
    "velocity": {
      "current": 32,
      "average": 28,
      "trend": "up",
      "history": [
        { "sprint": "Sprint 5", "points": 24 },
        { "sprint": "Sprint 6", "points": 28 },
        { "sprint": "Sprint 7", "points": 30 },
        { "sprint": "Sprint 8", "points": 32 }
      ]
    },
    "bugs": {
      "total": 12,
      "open": 5,
      "by_severity": {
        "critical": 1,
        "major": 2,
        "minor": 2,
        "trivial": 0
      },
      "avg_resolution_days": 3.5
    },
    "timeline": {
      "features_completed": [
        { "date": "2024-02-01", "count": 2 },
        { "date": "2024-02-15", "count": 3 },
        { "date": "2024-03-01", "count": 4 }
      ],
      "bugs_reported": [
        { "date": "2024-02-01", "count": 4 },
        { "date": "2024-02-15", "count": 3 },
        { "date": "2024-03-01", "count": 2 }
      ]
    },
    "team": {
      "active_contributors": 5,
      "top_contributors": [
        {
          "user_id": "550e8400-e29b-41d4-a716-446655440000",
          "full_name": "John Doe",
          "tasks_completed": 24,
          "points_delivered": 48
        }
      ]
    }
  }
}
```
