# Sprints API

**Base Path**: `/api/v1/workspaces/:workspaceId/sprints`

## Endpoints Overview

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | List sprints | Yes | Member |
| POST | `/` | Create sprint | Yes | Manager |
| GET | `/:id` | Get sprint details | Yes | Member |
| PATCH | `/:id` | Update sprint | Yes | Manager |
| DELETE | `/:id` | Delete sprint | Yes | Admin |
| POST | `/:id/start` | Start sprint | Yes | Manager |
| POST | `/:id/complete` | Complete sprint | Yes | Manager |
| GET | `/:id/burndown` | Get burndown data | Yes | Member |
| GET | `/:id/items` | Get sprint items | Yes | Member |
| POST | `/:id/items` | Add items to sprint | Yes | Manager |
| DELETE | `/:id/items/:itemId` | Remove item | Yes | Manager |
| GET | `/:id/retrospective` | Get retrospective | Yes | Member |
| POST | `/:id/retrospective` | Save retrospective | Yes | Manager |

---

## GET /

List sprints with filtering.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| product_id | uuid | - | Filter by product |
| status | string | - | planning, active, completed, cancelled |
| sort | string | start_date | Sort field |
| order | string | desc | Sort order |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "ddd08400-e29b-41d4-a716-446655440004",
      "name": "Sprint 8",
      "goal": "Complete authentication module",
      "status": "active",
      "start_date": "2024-03-01",
      "end_date": "2024-03-15",
      "product": {
        "id": "aaa08400-e29b-41d4-a716-446655440001",
        "name": "Mobile App"
      },
      "capacity_points": 40,
      "committed_points": 38,
      "completed_points": 24,
      "progress_percentage": 63,
      "days_remaining": 5,
      "item_counts": {
        "features": 4,
        "tasks": 12,
        "bugs": 3
      },
      "created_at": "2024-02-28T10:00:00Z"
    },
    {
      "id": "ddd08400-e29b-41d4-a716-446655440003",
      "name": "Sprint 7",
      "goal": "User profile features",
      "status": "completed",
      "start_date": "2024-02-15",
      "end_date": "2024-02-28",
      "product": {
        "id": "aaa08400-e29b-41d4-a716-446655440001",
        "name": "Mobile App"
      },
      "capacity_points": 40,
      "committed_points": 36,
      "completed_points": 34,
      "velocity": 34,
      "progress_percentage": 100,
      "created_at": "2024-02-14T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "total_pages": 1
  }
}
```

---

## POST /

Create a new sprint.

### Request

```json
{
  "name": "Sprint 9",
  "goal": "Payment integration",
  "product_id": "aaa08400-e29b-41d4-a716-446655440001",
  "start_date": "2024-03-16",
  "end_date": "2024-03-29",
  "capacity_points": 42
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | 2-100 characters |
| goal | string | No | Max 500 characters |
| product_id | uuid | No | Valid product ID |
| start_date | date | Yes | Valid date |
| end_date | date | Yes | After start_date |
| capacity_points | integer | No | 1-200 |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "ddd08400-e29b-41d4-a716-446655440005",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Sprint 9",
    "goal": "Payment integration",
    "status": "planning",
    "start_date": "2024-03-16",
    "end_date": "2024-03-29",
    "product": {
      "id": "aaa08400-e29b-41d4-a716-446655440001",
      "name": "Mobile App"
    },
    "capacity_points": 42,
    "committed_points": 0,
    "completed_points": 0,
    "created_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "created_at": "2024-03-10T10:00:00Z"
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | INVALID_DATES | End date must be after start date |
| 409 | OVERLAPPING_SPRINT | Dates overlap with existing sprint |

---

## GET /:id

Get detailed sprint information.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "ddd08400-e29b-41d4-a716-446655440004",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Sprint 8",
    "goal": "Complete authentication module",
    "status": "active",
    "start_date": "2024-03-01",
    "end_date": "2024-03-15",
    "product": {
      "id": "aaa08400-e29b-41d4-a716-446655440001",
      "name": "Mobile App",
      "color": "#6366F1"
    },
    "capacity_points": 40,
    "committed_points": 38,
    "completed_points": 24,
    "velocity": null,
    "progress_percentage": 63,
    "days_remaining": 5,
    "days_elapsed": 9,
    "items": {
      "features": [
        {
          "id": "fff08400-e29b-41d4-a716-446655440001",
          "title": "User Authentication",
          "status": "in_progress",
          "story_points": 8
        }
      ],
      "tasks": [
        {
          "id": "task-001",
          "title": "Implement login API",
          "status": "done",
          "story_points": 3
        }
      ],
      "bugs": [
        {
          "id": "bug-001",
          "title": "Login form validation error",
          "status": "in_progress",
          "severity": "major"
        }
      ]
    },
    "item_counts": {
      "features": { "total": 4, "done": 1 },
      "tasks": { "total": 12, "done": 6 },
      "bugs": { "total": 3, "done": 1 }
    },
    "team_workload": [
      {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe",
        "assigned_points": 12,
        "completed_points": 8
      },
      {
        "user_id": "660e8400-e29b-41d4-a716-446655440005",
        "full_name": "Jane Smith",
        "assigned_points": 10,
        "completed_points": 6
      }
    ],
    "created_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "created_at": "2024-02-28T10:00:00Z",
    "updated_at": "2024-03-10T14:00:00Z"
  }
}
```

---

## PATCH /:id

Update sprint details.

### Request

```json
{
  "name": "Sprint 8 - Extended",
  "goal": "Complete authentication and user profile",
  "end_date": "2024-03-17",
  "capacity_points": 45
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "ddd08400-e29b-41d4-a716-446655440004",
    "name": "Sprint 8 - Extended",
    "goal": "Complete authentication and user profile",
    "end_date": "2024-03-17",
    "capacity_points": 45,
    "updated_at": "2024-03-10T15:00:00Z"
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | CANNOT_MODIFY_COMPLETED | Cannot modify completed sprint |

---

## DELETE /:id

Delete a sprint.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| move_items_to | uuid | - | Move items to another sprint |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Sprint deleted successfully",
  "data": {
    "items_moved": 15,
    "moved_to_sprint": "ddd08400-e29b-41d4-a716-446655440005"
  }
}
```

---

## POST /:id/start

Start a planning sprint.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "ddd08400-e29b-41d4-a716-446655440005",
    "name": "Sprint 9",
    "status": "active",
    "started_at": "2024-03-16T09:00:00Z"
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | ALREADY_ACTIVE | Sprint already started |
| 400 | ACTIVE_SPRINT_EXISTS | Another sprint is already active |
| 400 | NO_ITEMS | Sprint has no items |

---

## POST /:id/complete

Complete an active sprint.

### Request

```json
{
  "move_incomplete_to": "ddd08400-e29b-41d4-a716-446655440006",
  "notes": "Good sprint, met most goals"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "ddd08400-e29b-41d4-a716-446655440004",
    "name": "Sprint 8",
    "status": "completed",
    "completed_at": "2024-03-15T17:00:00Z",
    "summary": {
      "committed_points": 38,
      "completed_points": 34,
      "velocity": 34,
      "completion_rate": 89.5,
      "items_completed": 15,
      "items_incomplete": 4,
      "items_moved": 4
    }
  }
}
```

---

## GET /:id/burndown

Get burndown chart data.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sprint_id": "ddd08400-e29b-41d4-a716-446655440004",
    "total_points": 38,
    "ideal_burndown": [
      { "date": "2024-03-01", "points": 38 },
      { "date": "2024-03-02", "points": 35.3 },
      { "date": "2024-03-03", "points": 32.6 },
      { "date": "2024-03-04", "points": 29.9 },
      { "date": "2024-03-05", "points": 27.1 },
      { "date": "2024-03-06", "points": 24.4 },
      { "date": "2024-03-07", "points": 21.7 },
      { "date": "2024-03-08", "points": 19.0 },
      { "date": "2024-03-09", "points": 16.3 },
      { "date": "2024-03-10", "points": 13.6 },
      { "date": "2024-03-11", "points": 10.9 },
      { "date": "2024-03-12", "points": 8.1 },
      { "date": "2024-03-13", "points": 5.4 },
      { "date": "2024-03-14", "points": 2.7 },
      { "date": "2024-03-15", "points": 0 }
    ],
    "actual_burndown": [
      { "date": "2024-03-01", "points": 38, "completed": 0 },
      { "date": "2024-03-02", "points": 35, "completed": 3 },
      { "date": "2024-03-03", "points": 35, "completed": 0 },
      { "date": "2024-03-04", "points": 32, "completed": 3 },
      { "date": "2024-03-05", "points": 28, "completed": 4 },
      { "date": "2024-03-06", "points": 25, "completed": 3 },
      { "date": "2024-03-07", "points": 22, "completed": 3 },
      { "date": "2024-03-08", "points": 22, "completed": 0 },
      { "date": "2024-03-09", "points": 22, "completed": 0 },
      { "date": "2024-03-10", "points": 14, "completed": 8 }
    ],
    "scope_changes": [
      { "date": "2024-03-05", "change": 2, "reason": "Added critical bug fix" }
    ]
  }
}
```

---

## GET /:id/items

Get all items in the sprint.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| type | string | - | feature, task, bug |
| status | string | - | Filter by status |
| assignee_id | uuid | - | Filter by assignee |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "features": [
      {
        "id": "fff08400-e29b-41d4-a716-446655440001",
        "title": "User Authentication",
        "status": "in_progress",
        "priority": "high",
        "story_points": 8,
        "assignee": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "full_name": "John Doe"
        }
      }
    ],
    "tasks": [
      {
        "id": "task-001",
        "title": "Implement login API",
        "status": "done",
        "priority": "high",
        "story_points": 3,
        "feature_id": "fff08400-e29b-41d4-a716-446655440001",
        "assignee": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "full_name": "John Doe"
        }
      }
    ],
    "bugs": [
      {
        "id": "bug-001",
        "title": "Login form validation error",
        "status": "in_progress",
        "severity": "major",
        "priority": "high",
        "assignee": {
          "id": "660e8400-e29b-41d4-a716-446655440005",
          "full_name": "Jane Smith"
        }
      }
    ]
  }
}
```

---

## POST /:id/items

Add items to the sprint.

### Request

```json
{
  "items": [
    { "type": "feature", "id": "fff08400-e29b-41d4-a716-446655440002" },
    { "type": "task", "id": "task-005" },
    { "type": "bug", "id": "bug-003" }
  ]
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "added": 3,
    "committed_points": 45,
    "capacity_points": 42,
    "over_capacity": true
  }
}
```

---

## DELETE /:id/items/:itemId

Remove an item from the sprint.

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | feature, task, or bug |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Item removed from sprint",
  "data": {
    "committed_points": 35
  }
}
```

---

## GET /:id/retrospective

Get sprint retrospective.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sprint_id": "ddd08400-e29b-41d4-a716-446655440003",
    "went_well": [
      "Good team collaboration",
      "Met velocity targets",
      "Clear communication"
    ],
    "needs_improvement": [
      "Better estimation on complex tasks",
      "More testing time needed"
    ],
    "action_items": [
      {
        "id": "action-001",
        "description": "Add estimation poker sessions",
        "owner": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "full_name": "John Doe"
        },
        "status": "in_progress"
      }
    ],
    "team_mood": 4.2,
    "created_at": "2024-02-28T17:00:00Z",
    "updated_at": "2024-02-28T17:30:00Z"
  }
}
```

---

## POST /:id/retrospective

Save sprint retrospective.

### Request

```json
{
  "went_well": [
    "Good team collaboration",
    "Met velocity targets",
    "Clear communication"
  ],
  "needs_improvement": [
    "Better estimation on complex tasks",
    "More testing time needed"
  ],
  "action_items": [
    {
      "description": "Add estimation poker sessions",
      "owner_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "team_mood": 4.2
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sprint_id": "ddd08400-e29b-41d4-a716-446655440004",
    "saved_at": "2024-03-15T17:30:00Z"
  }
}
```
