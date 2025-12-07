# Team API

**Base Path**: `/api/v1/workspaces/:workspaceId/team`

## Endpoints Overview

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/members` | List team members | Yes | Member |
| GET | `/members/:id` | Get member profile | Yes | Member |
| PATCH | `/members/:id` | Update member | Yes | Admin |
| GET | `/members/:id/workload` | Get member workload | Yes | Member |
| GET | `/members/:id/availability` | Get availability | Yes | Member |
| PATCH | `/members/:id/availability` | Update availability | Yes | Member |
| GET | `/workload` | Get team workload | Yes | Manager |
| GET | `/skills` | List team skills | Yes | Member |
| POST | `/skills` | Add skill | Yes | Member |
| GET | `/capacity` | Get team capacity | Yes | Manager |

---

## GET /members

List all team members in the workspace.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 50 | Items per page |
| role | string | - | Filter by role |
| skill | string | - | Filter by skill |
| search | string | - | Search name/email |
| available | boolean | - | Filter by availability |

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
      "title": "Lead Developer",
      "department": "Engineering",
      "skills": ["React", "TypeScript", "Node.js", "PostgreSQL"],
      "workload": {
        "assigned_points": 12,
        "capacity_points": 15,
        "utilization_percentage": 80
      },
      "availability": {
        "status": "available",
        "hours_per_week": 40
      },
      "joined_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440005",
      "email": "jane@example.com",
      "full_name": "Jane Smith",
      "avatar_url": null,
      "role": "admin",
      "title": "Senior Developer",
      "department": "Engineering",
      "skills": ["React", "TypeScript", "GraphQL"],
      "workload": {
        "assigned_points": 10,
        "capacity_points": 12,
        "utilization_percentage": 83
      },
      "availability": {
        "status": "available",
        "hours_per_week": 40
      },
      "joined_at": "2024-02-01T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 5,
    "total_pages": 1
  }
}
```

---

## GET /members/:id

Get detailed member profile.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "full_name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg",
    "role": "owner",
    "title": "Lead Developer",
    "department": "Engineering",
    "bio": "Passionate about building great products",
    "timezone": "America/New_York",
    "skills": [
      { "name": "React", "level": "expert" },
      { "name": "TypeScript", "level": "expert" },
      { "name": "Node.js", "level": "advanced" },
      { "name": "PostgreSQL", "level": "intermediate" }
    ],
    "contact": {
      "slack": "@johndoe",
      "github": "johndoe"
    },
    "workload": {
      "current_sprint": {
        "assigned_points": 12,
        "completed_points": 8,
        "tasks_count": 5,
        "tasks_completed": 3
      },
      "capacity_points": 15,
      "utilization_percentage": 80
    },
    "availability": {
      "status": "available",
      "hours_per_week": 40,
      "working_hours": {
        "start": "09:00",
        "end": "17:00",
        "timezone": "America/New_York"
      },
      "time_off": []
    },
    "stats": {
      "tasks_completed_30d": 24,
      "points_delivered_30d": 48,
      "bugs_fixed_30d": 5,
      "avg_task_completion_days": 2.3
    },
    "recent_activity": [
      {
        "type": "task_completed",
        "entity": { "id": "task-001", "title": "Implement login API" },
        "created_at": "2024-03-09T16:30:00Z"
      }
    ],
    "joined_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## PATCH /members/:id

Update member profile (Admin only, or self for limited fields).

### Request

```json
{
  "title": "Staff Engineer",
  "department": "Platform",
  "bio": "Building scalable systems",
  "skills": [
    { "name": "React", "level": "expert" },
    { "name": "Kubernetes", "level": "intermediate" }
  ]
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Staff Engineer",
    "department": "Platform",
    "bio": "Building scalable systems",
    "skills": [
      { "name": "React", "level": "expert" },
      { "name": "Kubernetes", "level": "intermediate" }
    ],
    "updated_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## GET /members/:id/workload

Get detailed workload for a team member.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | string | current_sprint | current_sprint, 7d, 30d |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "member_id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "John Doe",
    "period": "current_sprint",
    "sprint": {
      "id": "ddd08400-e29b-41d4-a716-446655440004",
      "name": "Sprint 8",
      "start_date": "2024-03-01",
      "end_date": "2024-03-15"
    },
    "summary": {
      "capacity_points": 15,
      "assigned_points": 12,
      "completed_points": 8,
      "remaining_points": 4,
      "utilization_percentage": 80
    },
    "items": {
      "features": [
        {
          "id": "fff08400-e29b-41d4-a716-446655440001",
          "title": "User Authentication",
          "story_points": 8,
          "status": "in_progress"
        }
      ],
      "tasks": [
        {
          "id": "task-001",
          "title": "Implement login API",
          "story_points": 3,
          "status": "done"
        },
        {
          "id": "task-020",
          "title": "Create password reset flow",
          "story_points": 5,
          "status": "in_progress"
        }
      ],
      "bugs": [
        {
          "id": "bug-001",
          "title": "Login button unresponsive",
          "severity": "major",
          "status": "in_progress"
        }
      ]
    },
    "time_tracking": {
      "logged_hours": 28,
      "expected_hours": 35,
      "by_day": [
        { "date": "2024-03-01", "hours": 4 },
        { "date": "2024-03-04", "hours": 6 },
        { "date": "2024-03-05", "hours": 5 }
      ]
    },
    "burndown": [
      { "date": "2024-03-01", "remaining": 12 },
      { "date": "2024-03-05", "remaining": 8 },
      { "date": "2024-03-10", "remaining": 4 }
    ]
  }
}
```

---

## GET /members/:id/availability

Get member availability calendar.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| from_date | date | today | Start date |
| to_date | date | +30 days | End date |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "member_id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "John Doe",
    "default_hours_per_week": 40,
    "working_hours": {
      "monday": { "start": "09:00", "end": "17:00" },
      "tuesday": { "start": "09:00", "end": "17:00" },
      "wednesday": { "start": "09:00", "end": "17:00" },
      "thursday": { "start": "09:00", "end": "17:00" },
      "friday": { "start": "09:00", "end": "17:00" },
      "saturday": null,
      "sunday": null
    },
    "timezone": "America/New_York",
    "time_off": [
      {
        "id": "pto-001",
        "type": "vacation",
        "start_date": "2024-03-25",
        "end_date": "2024-03-29",
        "status": "approved"
      }
    ],
    "calendar": [
      {
        "date": "2024-03-10",
        "day": "Monday",
        "available": true,
        "hours": 8,
        "notes": null
      },
      {
        "date": "2024-03-25",
        "day": "Monday",
        "available": false,
        "hours": 0,
        "notes": "Vacation"
      }
    ]
  }
}
```

---

## PATCH /members/:id/availability

Update member availability.

### Request

```json
{
  "hours_per_week": 32,
  "working_hours": {
    "friday": { "start": "09:00", "end": "13:00" }
  },
  "time_off": [
    {
      "type": "vacation",
      "start_date": "2024-03-25",
      "end_date": "2024-03-29"
    }
  ]
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "member_id": "550e8400-e29b-41d4-a716-446655440000",
    "hours_per_week": 32,
    "working_hours": {
      "friday": { "start": "09:00", "end": "13:00" }
    },
    "time_off": [
      {
        "id": "pto-001",
        "type": "vacation",
        "start_date": "2024-03-25",
        "end_date": "2024-03-29",
        "status": "pending"
      }
    ],
    "updated_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## GET /workload

Get team-wide workload overview.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| sprint_id | uuid | current | Specific sprint |
| product_id | uuid | - | Filter by product |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sprint": {
      "id": "ddd08400-e29b-41d4-a716-446655440004",
      "name": "Sprint 8"
    },
    "summary": {
      "total_capacity": 75,
      "total_assigned": 62,
      "total_completed": 40,
      "team_utilization": 82.7,
      "on_track": true
    },
    "members": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg",
        "capacity": 15,
        "assigned": 12,
        "completed": 8,
        "utilization": 80,
        "status": "on_track"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440005",
        "full_name": "Jane Smith",
        "avatar_url": null,
        "capacity": 12,
        "assigned": 14,
        "completed": 10,
        "utilization": 116.7,
        "status": "overloaded"
      }
    ],
    "distribution": {
      "by_status": {
        "todo": 8,
        "in_progress": 14,
        "done": 40
      },
      "by_type": {
        "features": 20,
        "tasks": 35,
        "bugs": 7
      }
    }
  }
}
```

---

## GET /skills

List all skills in the team.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "name": "React",
      "count": 4,
      "members": [
        { "id": "550e8400-e29b-41d4-a716-446655440000", "full_name": "John Doe", "level": "expert" },
        { "id": "660e8400-e29b-41d4-a716-446655440005", "full_name": "Jane Smith", "level": "expert" }
      ]
    },
    {
      "name": "TypeScript",
      "count": 4,
      "members": [
        { "id": "550e8400-e29b-41d4-a716-446655440000", "full_name": "John Doe", "level": "expert" },
        { "id": "660e8400-e29b-41d4-a716-446655440005", "full_name": "Jane Smith", "level": "expert" }
      ]
    },
    {
      "name": "Node.js",
      "count": 2,
      "members": [
        { "id": "550e8400-e29b-41d4-a716-446655440000", "full_name": "John Doe", "level": "advanced" }
      ]
    }
  ]
}
```

---

## POST /skills

Add a skill to your profile.

### Request

```json
{
  "name": "GraphQL",
  "level": "intermediate"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | 2-50 characters |
| level | string | Yes | beginner, intermediate, advanced, expert |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "skill": {
      "name": "GraphQL",
      "level": "intermediate"
    },
    "updated_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## GET /capacity

Get team capacity planning data.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| from_date | date | today | Start date |
| to_date | date | +90 days | End date |
| product_id | uuid | - | Filter by product |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2024-03-10",
      "to": "2024-06-10"
    },
    "sprints": [
      {
        "id": "ddd08400-e29b-41d4-a716-446655440004",
        "name": "Sprint 8",
        "start_date": "2024-03-01",
        "end_date": "2024-03-15",
        "capacity": 75,
        "committed": 62
      },
      {
        "id": "ddd08400-e29b-41d4-a716-446655440005",
        "name": "Sprint 9",
        "start_date": "2024-03-16",
        "end_date": "2024-03-29",
        "capacity": 68,
        "committed": 0
      }
    ],
    "members_capacity": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe",
        "weekly_capacity": 15,
        "planned_time_off": [
          { "start_date": "2024-03-25", "end_date": "2024-03-29" }
        ],
        "capacity_by_sprint": {
          "ddd08400-e29b-41d4-a716-446655440004": 15,
          "ddd08400-e29b-41d4-a716-446655440005": 12
        }
      }
    ],
    "total_capacity_by_week": [
      { "week_start": "2024-03-11", "capacity": 75 },
      { "week_start": "2024-03-18", "capacity": 75 },
      { "week_start": "2024-03-25", "capacity": 60 }
    ]
  }
}
```
