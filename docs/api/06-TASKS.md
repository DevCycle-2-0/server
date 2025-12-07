# Tasks API

**Base Path**: `/api/v1/workspaces/:workspaceId/tasks`

## Endpoints Overview

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | List tasks | Yes | Member |
| POST | `/` | Create task | Yes | Member |
| GET | `/:id` | Get task details | Yes | Member |
| PATCH | `/:id` | Update task | Yes | Member |
| DELETE | `/:id` | Delete task | Yes | Manager |
| PATCH | `/:id/status` | Update status | Yes | Member |
| POST | `/:id/time-logs` | Log time | Yes | Member |
| GET | `/:id/time-logs` | Get time logs | Yes | Member |
| GET | `/:id/subtasks` | Get subtasks | Yes | Member |
| POST | `/:id/subtasks` | Create subtask | Yes | Member |
| GET | `/:id/comments` | Get comments | Yes | Member |
| POST | `/:id/comments` | Add comment | Yes | Member |

---

## GET /

List tasks with filtering and pagination.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max 100) |
| product_id | uuid | - | Filter by product |
| feature_id | uuid | - | Filter by feature |
| sprint_id | uuid | - | Filter by sprint |
| status | string | - | backlog, todo, in_progress, review, done |
| priority | string | - | critical, high, medium, low |
| type | string | - | task, subtask, story, epic |
| assignee_id | uuid | - | Filter by assignee |
| reporter_id | uuid | - | Filter by reporter |
| search | string | - | Search title/description |
| tags | string | - | Comma-separated tags |
| due_date_from | date | - | Due date range start |
| due_date_to | date | - | Due date range end |
| sort | string | created_at | Sort field |
| order | string | desc | Sort order: asc, desc |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "task-001",
      "title": "Implement login API",
      "description": "Create REST API endpoints for user authentication",
      "type": "task",
      "status": "done",
      "priority": "high",
      "story_points": 3,
      "estimated_hours": 6,
      "logged_hours": 5.5,
      "product": {
        "id": "aaa08400-e29b-41d4-a716-446655440001",
        "name": "Mobile App"
      },
      "feature": {
        "id": "fff08400-e29b-41d4-a716-446655440001",
        "title": "User Authentication"
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
      "tags": ["backend", "api"],
      "subtask_count": 2,
      "subtasks_completed": 2,
      "due_date": "2024-03-10",
      "completed_at": "2024-03-09T16:30:00Z",
      "created_at": "2024-03-01T10:00:00Z",
      "updated_at": "2024-03-09T16:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

---

## POST /

Create a new task.

### Request

```json
{
  "title": "Create password reset flow",
  "description": "Implement forgot password and reset functionality",
  "type": "task",
  "product_id": "aaa08400-e29b-41d4-a716-446655440001",
  "feature_id": "fff08400-e29b-41d4-a716-446655440001",
  "sprint_id": "ddd08400-e29b-41d4-a716-446655440004",
  "priority": "high",
  "story_points": 5,
  "estimated_hours": 8,
  "assignee_id": "550e8400-e29b-41d4-a716-446655440000",
  "tags": ["backend", "auth"],
  "due_date": "2024-03-12"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | Yes | 5-200 characters |
| description | string | No | Max 5000 characters |
| type | string | No | task, subtask, story, epic |
| product_id | uuid | No | Valid product ID |
| feature_id | uuid | No | Valid feature ID |
| sprint_id | uuid | No | Valid sprint ID |
| parent_task_id | uuid | No | Valid task ID (for subtasks) |
| priority | string | No | critical, high, medium, low |
| story_points | integer | No | 1-100 |
| estimated_hours | decimal | No | 0.25-1000 |
| assignee_id | uuid | No | Valid user ID |
| tags | array | No | Max 10 tags |
| due_date | date | No | Valid date |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "task-020",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Create password reset flow",
    "description": "Implement forgot password and reset functionality",
    "type": "task",
    "status": "todo",
    "priority": "high",
    "story_points": 5,
    "estimated_hours": 8,
    "logged_hours": 0,
    "product": {
      "id": "aaa08400-e29b-41d4-a716-446655440001",
      "name": "Mobile App"
    },
    "feature": {
      "id": "fff08400-e29b-41d4-a716-446655440001",
      "title": "User Authentication"
    },
    "sprint": {
      "id": "ddd08400-e29b-41d4-a716-446655440004",
      "name": "Sprint 8"
    },
    "assignee": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "reporter": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "tags": ["backend", "auth"],
    "due_date": "2024-03-12",
    "position": 5,
    "created_at": "2024-03-05T10:00:00Z",
    "updated_at": "2024-03-05T10:00:00Z"
  }
}
```

---

## GET /:id

Get detailed task information.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "task-001",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Implement login API",
    "description": "Create REST API endpoints for user authentication including:\n- POST /auth/login\n- POST /auth/logout\n- POST /auth/refresh",
    "type": "task",
    "status": "done",
    "priority": "high",
    "story_points": 3,
    "estimated_hours": 6,
    "logged_hours": 5.5,
    "product": {
      "id": "aaa08400-e29b-41d4-a716-446655440001",
      "name": "Mobile App",
      "color": "#6366F1"
    },
    "feature": {
      "id": "fff08400-e29b-41d4-a716-446655440001",
      "title": "User Authentication",
      "stage": "development"
    },
    "sprint": {
      "id": "ddd08400-e29b-41d4-a716-446655440004",
      "name": "Sprint 8",
      "status": "active"
    },
    "parent_task": null,
    "assignee": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "email": "john@example.com"
    },
    "reporter": {
      "id": "660e8400-e29b-41d4-a716-446655440005",
      "full_name": "Jane Smith"
    },
    "tags": ["backend", "api"],
    "subtasks": [
      {
        "id": "task-001-sub-1",
        "title": "Design API schema",
        "status": "done",
        "assignee": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "full_name": "John Doe"
        }
      },
      {
        "id": "task-001-sub-2",
        "title": "Write unit tests",
        "status": "done",
        "assignee": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "full_name": "John Doe"
        }
      }
    ],
    "time_logs_summary": {
      "total_hours": 5.5,
      "by_user": [
        {
          "user_id": "550e8400-e29b-41d4-a716-446655440000",
          "full_name": "John Doe",
          "hours": 5.5
        }
      ]
    },
    "activity": [
      {
        "type": "status_changed",
        "from": "in_progress",
        "to": "done",
        "user": { "id": "550e8400-e29b-41d4-a716-446655440000", "full_name": "John Doe" },
        "created_at": "2024-03-09T16:30:00Z"
      }
    ],
    "due_date": "2024-03-10",
    "completed_at": "2024-03-09T16:30:00Z",
    "position": 1,
    "created_at": "2024-03-01T10:00:00Z",
    "updated_at": "2024-03-09T16:30:00Z"
  }
}
```

---

## PATCH /:id

Update task details.

### Request

```json
{
  "title": "Implement login API with rate limiting",
  "priority": "critical",
  "story_points": 5,
  "estimated_hours": 10,
  "assignee_id": "660e8400-e29b-41d4-a716-446655440005",
  "due_date": "2024-03-08"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "task-001",
    "title": "Implement login API with rate limiting",
    "priority": "critical",
    "story_points": 5,
    "estimated_hours": 10,
    "assignee": {
      "id": "660e8400-e29b-41d4-a716-446655440005",
      "full_name": "Jane Smith"
    },
    "due_date": "2024-03-08",
    "updated_at": "2024-03-05T11:00:00Z"
  }
}
```

---

## DELETE /:id

Delete a task.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | HAS_SUBTASKS | Delete subtasks first |
| 403 | INSUFFICIENT_PERMISSIONS | Manager role required |

---

## PATCH /:id/status

Update task status.

### Request

```json
{
  "status": "in_progress",
  "comment": "Starting work on this"
}
```

| Status | Description |
|--------|-------------|
| backlog | Not yet prioritized |
| todo | Ready to work on |
| in_progress | Currently being worked on |
| review | Ready for review |
| done | Completed |
| cancelled | Will not be done |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "task-020",
    "status": "in_progress",
    "previous_status": "todo",
    "updated_at": "2024-03-05T12:00:00Z"
  }
}
```

---

## POST /:id/time-logs

Log time worked on a task.

### Request

```json
{
  "hours": 2.5,
  "description": "Implemented password reset endpoint",
  "logged_date": "2024-03-05"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| hours | decimal | Yes | 0.25-24 |
| description | string | No | Max 500 characters |
| logged_date | date | No | Defaults to today |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "time-log-001",
    "task_id": "task-020",
    "hours": 2.5,
    "description": "Implemented password reset endpoint",
    "logged_date": "2024-03-05",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "created_at": "2024-03-05T18:00:00Z"
  },
  "task_summary": {
    "logged_hours": 2.5,
    "estimated_hours": 8,
    "remaining_hours": 5.5
  }
}
```

---

## GET /:id/time-logs

Get time logs for a task.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| user_id | uuid | - | Filter by user |
| from_date | date | - | Start date |
| to_date | date | - | End date |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "time-log-001",
      "hours": 2.5,
      "description": "Implemented password reset endpoint",
      "logged_date": "2024-03-05",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "created_at": "2024-03-05T18:00:00Z"
    },
    {
      "id": "time-log-002",
      "hours": 3,
      "description": "Added email sending and tests",
      "logged_date": "2024-03-06",
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "created_at": "2024-03-06T17:00:00Z"
    }
  ],
  "summary": {
    "total_hours": 5.5,
    "by_date": [
      { "date": "2024-03-05", "hours": 2.5 },
      { "date": "2024-03-06", "hours": 3 }
    ]
  }
}
```

---

## GET /:id/subtasks

Get subtasks of a task.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "task-001-sub-1",
      "title": "Design API schema",
      "status": "done",
      "priority": "high",
      "assignee": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe"
      },
      "position": 1,
      "completed_at": "2024-03-02T14:00:00Z"
    },
    {
      "id": "task-001-sub-2",
      "title": "Write unit tests",
      "status": "done",
      "priority": "medium",
      "assignee": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe"
      },
      "position": 2,
      "completed_at": "2024-03-03T16:00:00Z"
    }
  ]
}
```

---

## POST /:id/subtasks

Create a subtask.

### Request

```json
{
  "title": "Add input validation",
  "priority": "high",
  "assignee_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "task-001-sub-3",
    "parent_task_id": "task-001",
    "title": "Add input validation",
    "type": "subtask",
    "status": "todo",
    "priority": "high",
    "assignee": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "position": 3,
    "created_at": "2024-03-05T10:00:00Z"
  }
}
```

---

## GET /:id/comments

Get task comments.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "comment-010",
      "content": "Should we add rate limiting to this endpoint?",
      "author": {
        "id": "660e8400-e29b-41d4-a716-446655440005",
        "full_name": "Jane Smith",
        "avatar_url": null
      },
      "mentions": [],
      "replies": [
        {
          "id": "comment-011",
          "content": "Yes, I'll add that. Thanks for the suggestion!",
          "author": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "full_name": "John Doe"
          },
          "created_at": "2024-03-05T11:00:00Z"
        }
      ],
      "created_at": "2024-03-05T10:30:00Z"
    }
  ],
  "meta": {
    "total": 2
  }
}
```

---

## POST /:id/comments

Add a comment to the task.

### Request

```json
{
  "content": "This is ready for review @Jane",
  "mentions": ["660e8400-e29b-41d4-a716-446655440005"]
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "comment-012",
    "content": "This is ready for review @Jane",
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
    "created_at": "2024-03-06T16:00:00Z"
  }
}
```
