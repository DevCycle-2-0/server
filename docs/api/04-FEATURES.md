# Features API

**Base Path**: `/api/v1/workspaces/:workspaceId/features`

## Endpoints Overview

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | List features | Yes | Member |
| POST | `/` | Create feature | Yes | Member |
| GET | `/:id` | Get feature details | Yes | Member |
| PATCH | `/:id` | Update feature | Yes | Member |
| DELETE | `/:id` | Delete feature | Yes | Manager |
| POST | `/:id/vote` | Vote for feature | Yes | Member |
| DELETE | `/:id/vote` | Remove vote | Yes | Member |
| PATCH | `/:id/stage` | Update stage | Yes | Manager |
| POST | `/:id/assign-sprint` | Assign to sprint | Yes | Manager |
| GET | `/:id/tasks` | Get feature tasks | Yes | Member |
| GET | `/:id/comments` | Get comments | Yes | Member |
| POST | `/:id/comments` | Add comment | Yes | Member |

---

## GET /

List features with filtering and pagination.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max 100) |
| product_id | uuid | - | Filter by product |
| sprint_id | uuid | - | Filter by sprint |
| stage | string | - | Filter by stage |
| status | string | - | Filter by status |
| priority | string | - | Filter by priority |
| assignee_id | uuid | - | Filter by assignee |
| search | string | - | Search title/description |
| tags | string | - | Comma-separated tags |
| sort | string | created_at | Sort field |
| order | string | desc | Sort order: asc, desc |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "fff08400-e29b-41d4-a716-446655440001",
      "title": "User Authentication",
      "description": "Implement secure login with OAuth2 support",
      "stage": "development",
      "priority": "high",
      "status": "in_progress",
      "votes": 12,
      "has_voted": true,
      "story_points": 8,
      "product": {
        "id": "aaa08400-e29b-41d4-a716-446655440001",
        "name": "Mobile App",
        "color": "#6366F1"
      },
      "sprint": {
        "id": "ddd08400-e29b-41d4-a716-446655440004",
        "name": "Sprint 8"
      },
      "assignee": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "reporter": {
        "id": "660e8400-e29b-41d4-a716-446655440005",
        "full_name": "Jane Smith"
      },
      "tags": ["auth", "security", "mvp"],
      "task_count": 5,
      "tasks_completed": 2,
      "due_date": "2024-03-15",
      "created_at": "2024-02-01T10:00:00Z",
      "updated_at": "2024-03-01T14:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 24,
    "total_pages": 2
  }
}
```

---

## POST /

Create a new feature request.

### Request

```json
{
  "title": "Push Notifications",
  "description": "Implement push notifications for iOS and Android",
  "product_id": "aaa08400-e29b-41d4-a716-446655440001",
  "priority": "medium",
  "story_points": 5,
  "tags": ["mobile", "notifications"],
  "due_date": "2024-04-01"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | Yes | 5-200 characters |
| description | string | No | Max 5000 characters |
| product_id | uuid | No | Valid product ID |
| priority | string | No | critical, high, medium, low |
| story_points | integer | No | 1-100 |
| tags | array | No | Max 10 tags |
| due_date | date | No | Future date |
| assignee_id | uuid | No | Valid user ID |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "ggg08400-e29b-41d4-a716-446655440002",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Push Notifications",
    "description": "Implement push notifications for iOS and Android",
    "stage": "idea",
    "priority": "medium",
    "status": "backlog",
    "votes": 0,
    "story_points": 5,
    "product": {
      "id": "aaa08400-e29b-41d4-a716-446655440001",
      "name": "Mobile App"
    },
    "reporter": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "tags": ["mobile", "notifications"],
    "due_date": "2024-04-01",
    "created_at": "2024-03-01T14:00:00Z",
    "updated_at": "2024-03-01T14:00:00Z"
  }
}
```

---

## GET /:id

Get feature details with full information.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "fff08400-e29b-41d4-a716-446655440001",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "User Authentication",
    "description": "Implement secure login with OAuth2 support including:\n- Email/password login\n- Google OAuth\n- Apple Sign In\n- Password reset flow",
    "stage": "development",
    "priority": "high",
    "status": "in_progress",
    "votes": 12,
    "has_voted": true,
    "story_points": 8,
    "product": {
      "id": "aaa08400-e29b-41d4-a716-446655440001",
      "name": "Mobile App",
      "color": "#6366F1"
    },
    "sprint": {
      "id": "ddd08400-e29b-41d4-a716-446655440004",
      "name": "Sprint 8",
      "start_date": "2024-03-01",
      "end_date": "2024-03-15"
    },
    "target_release": {
      "id": "eee08400-e29b-41d4-a716-446655440005",
      "version": "2.2.0"
    },
    "assignee": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "email": "john@example.com"
    },
    "reporter": {
      "id": "660e8400-e29b-41d4-a716-446655440005",
      "full_name": "Jane Smith",
      "avatar_url": null
    },
    "tags": ["auth", "security", "mvp"],
    "attachments": [
      {
        "id": "att-001",
        "name": "auth-flow-diagram.png",
        "url": "https://storage.example.com/attachments/auth-flow.png",
        "size": 245000,
        "type": "image/png"
      }
    ],
    "custom_fields": {
      "business_value": "high",
      "technical_complexity": "medium"
    },
    "tasks": {
      "total": 5,
      "completed": 2,
      "in_progress": 2,
      "todo": 1
    },
    "stage_history": [
      {
        "stage": "idea",
        "entered_at": "2024-02-01T10:00:00Z",
        "duration_days": 3
      },
      {
        "stage": "discovery",
        "entered_at": "2024-02-04T10:00:00Z",
        "duration_days": 5
      },
      {
        "stage": "planning",
        "entered_at": "2024-02-09T10:00:00Z",
        "duration_days": 4
      },
      {
        "stage": "design",
        "entered_at": "2024-02-13T10:00:00Z",
        "duration_days": 7
      },
      {
        "stage": "development",
        "entered_at": "2024-02-20T10:00:00Z",
        "duration_days": null
      }
    ],
    "due_date": "2024-03-15",
    "completed_at": null,
    "created_at": "2024-02-01T10:00:00Z",
    "updated_at": "2024-03-01T14:00:00Z"
  }
}
```

---

## PATCH /:id

Update feature details.

### Request

```json
{
  "title": "User Authentication v2",
  "description": "Updated authentication implementation",
  "priority": "critical",
  "story_points": 13,
  "assignee_id": "660e8400-e29b-41d4-a716-446655440005",
  "tags": ["auth", "security", "mvp", "v2"],
  "due_date": "2024-03-20"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "fff08400-e29b-41d4-a716-446655440001",
    "title": "User Authentication v2",
    "description": "Updated authentication implementation",
    "priority": "critical",
    "story_points": 13,
    "assignee": {
      "id": "660e8400-e29b-41d4-a716-446655440005",
      "full_name": "Jane Smith"
    },
    "tags": ["auth", "security", "mvp", "v2"],
    "due_date": "2024-03-20",
    "updated_at": "2024-03-02T10:00:00Z"
  }
}
```

---

## DELETE /:id

Delete a feature.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Feature deleted successfully"
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | HAS_LINKED_ITEMS | Feature has linked tasks/bugs |
| 403 | INSUFFICIENT_PERMISSIONS | Manager role required |

---

## POST /:id/vote

Vote for a feature.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "feature_id": "fff08400-e29b-41d4-a716-446655440001",
    "votes": 13,
    "has_voted": true
  }
}
```

---

## DELETE /:id/vote

Remove vote from a feature.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "feature_id": "fff08400-e29b-41d4-a716-446655440001",
    "votes": 11,
    "has_voted": false
  }
}
```

---

## PATCH /:id/stage

Update feature stage in the lifecycle.

### Request

```json
{
  "stage": "testing",
  "notes": "Development complete, ready for QA"
}
```

| Stage | Description |
|-------|-------------|
| idea | Initial idea, not yet validated |
| discovery | Researching and validating the idea |
| planning | Defining scope and requirements |
| design | Creating designs and prototypes |
| development | Active development in progress |
| testing | QA and testing phase |
| release | Ready for or in deployment |
| live | Released and in production |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "fff08400-e29b-41d4-a716-446655440001",
    "stage": "testing",
    "previous_stage": "development",
    "stage_changed_at": "2024-03-02T10:00:00Z",
    "stage_changed_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    }
  }
}
```

---

## POST /:id/assign-sprint

Assign feature to a sprint.

### Request

```json
{
  "sprint_id": "ddd08400-e29b-41d4-a716-446655440004"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "feature_id": "fff08400-e29b-41d4-a716-446655440001",
    "sprint": {
      "id": "ddd08400-e29b-41d4-a716-446655440004",
      "name": "Sprint 8",
      "start_date": "2024-03-01",
      "end_date": "2024-03-15"
    }
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | SPRINT_NOT_ACTIVE | Sprint is not in planning/active state |
| 400 | CAPACITY_EXCEEDED | Sprint capacity would be exceeded |

---

## GET /:id/tasks

Get tasks linked to this feature.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "task-001",
      "title": "Implement login API",
      "status": "done",
      "priority": "high",
      "story_points": 3,
      "assignee": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe"
      }
    },
    {
      "id": "task-002",
      "title": "Create login UI",
      "status": "in_progress",
      "priority": "high",
      "story_points": 2,
      "assignee": {
        "id": "660e8400-e29b-41d4-a716-446655440005",
        "full_name": "Jane Smith"
      }
    }
  ]
}
```

---

## GET /:id/comments

Get feature comments.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 50 | Items per page |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "comment-001",
      "content": "Should we also support GitHub OAuth?",
      "author": {
        "id": "660e8400-e29b-41d4-a716-446655440005",
        "full_name": "Jane Smith",
        "avatar_url": null
      },
      "mentions": [],
      "replies": [
        {
          "id": "comment-002",
          "content": "Good idea, adding to scope",
          "author": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "full_name": "John Doe"
          },
          "created_at": "2024-02-02T11:00:00Z"
        }
      ],
      "created_at": "2024-02-02T10:00:00Z",
      "edited_at": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 5
  }
}
```

---

## POST /:id/comments

Add a comment to the feature.

### Request

```json
{
  "content": "This looks great! Ready for review.",
  "mentions": ["660e8400-e29b-41d4-a716-446655440005"],
  "parent_id": null
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "comment-003",
    "content": "This looks great! Ready for review.",
    "author": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "mentions": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440005",
        "full_name": "Jane Smith"
      }
    ],
    "parent_id": null,
    "created_at": "2024-03-02T14:00:00Z"
  }
}
```
