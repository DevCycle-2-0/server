# Analytics API

**Base Path**: `/api/v1/workspaces/:workspaceId/analytics`

## Endpoints Overview

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/overview` | Dashboard overview metrics | Yes | Member |
| GET | `/velocity` | Sprint velocity trends | Yes | Member |
| GET | `/burndown` | Burndown charts | Yes | Member |
| GET | `/bugs` | Bug resolution metrics | Yes | Member |
| GET | `/features` | Feature completion metrics | Yes | Member |
| GET | `/releases` | Release frequency data | Yes | Member |
| GET | `/team` | Team performance metrics | Yes | Manager |
| GET | `/time-tracking` | Time tracking reports | Yes | Manager |
| GET | `/products` | Product health metrics | Yes | Member |
| POST | `/export` | Export analytics data | Yes | Manager |

---

## GET /overview

Get dashboard overview metrics.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | string | 30d | 7d, 30d, 90d, 1y |
| product_id | uuid | - | Filter by product |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-02-10",
      "end": "2024-03-10",
      "label": "Last 30 days"
    },
    "summary": {
      "features_completed": 12,
      "features_completed_change": 20,
      "tasks_completed": 89,
      "tasks_completed_change": 15,
      "bugs_resolved": 18,
      "bugs_resolved_change": -5,
      "releases_published": 2,
      "velocity_avg": 32,
      "velocity_change": 8
    },
    "active_sprint": {
      "id": "ddd08400-e29b-41d4-a716-446655440004",
      "name": "Sprint 8",
      "progress": 63,
      "days_remaining": 5,
      "on_track": true
    },
    "trends": {
      "features": [
        { "date": "2024-02-10", "completed": 2 },
        { "date": "2024-02-17", "completed": 3 },
        { "date": "2024-02-24", "completed": 4 },
        { "date": "2024-03-03", "completed": 3 }
      ],
      "tasks": [
        { "date": "2024-02-10", "completed": 18 },
        { "date": "2024-02-17", "completed": 22 },
        { "date": "2024-02-24", "completed": 25 },
        { "date": "2024-03-03", "completed": 24 }
      ]
    },
    "top_contributors": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg",
        "points_delivered": 48,
        "tasks_completed": 24
      }
    ]
  }
}
```

---

## GET /velocity

Get sprint velocity trends.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| sprints | integer | 8 | Number of sprints (max 20) |
| product_id | uuid | - | Filter by product |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "average_velocity": 30,
    "trend": "increasing",
    "trend_percentage": 12,
    "sprints": [
      {
        "id": "sprint-001",
        "name": "Sprint 1",
        "start_date": "2024-01-01",
        "end_date": "2024-01-14",
        "committed_points": 28,
        "completed_points": 24,
        "completion_rate": 85.7
      },
      {
        "id": "sprint-002",
        "name": "Sprint 2",
        "start_date": "2024-01-15",
        "end_date": "2024-01-28",
        "committed_points": 30,
        "completed_points": 28,
        "completion_rate": 93.3
      },
      {
        "id": "sprint-003",
        "name": "Sprint 3",
        "start_date": "2024-01-29",
        "end_date": "2024-02-11",
        "committed_points": 32,
        "completed_points": 30,
        "completion_rate": 93.8
      },
      {
        "id": "sprint-004",
        "name": "Sprint 4",
        "start_date": "2024-02-12",
        "end_date": "2024-02-25",
        "committed_points": 34,
        "completed_points": 32,
        "completion_rate": 94.1
      }
    ],
    "recommendations": [
      "Velocity is trending up. Consider increasing sprint capacity by 10%.",
      "Completion rate is consistently above 90%. Team is estimating well."
    ]
  }
}
```

---

## GET /burndown

Get burndown chart data.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| sprint_id | uuid | current | Specific sprint |
| type | string | points | points, tasks, hours |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "sprint": {
      "id": "ddd08400-e29b-41d4-a716-446655440004",
      "name": "Sprint 8",
      "start_date": "2024-03-01",
      "end_date": "2024-03-15"
    },
    "type": "points",
    "total": 38,
    "remaining": 14,
    "ideal": [
      { "date": "2024-03-01", "value": 38 },
      { "date": "2024-03-02", "value": 35.3 },
      { "date": "2024-03-03", "value": 32.6 },
      { "date": "2024-03-04", "value": 29.9 },
      { "date": "2024-03-05", "value": 27.1 },
      { "date": "2024-03-06", "value": 24.4 },
      { "date": "2024-03-07", "value": 21.7 },
      { "date": "2024-03-08", "value": 19.0 },
      { "date": "2024-03-09", "value": 16.3 },
      { "date": "2024-03-10", "value": 13.6 },
      { "date": "2024-03-11", "value": 10.9 },
      { "date": "2024-03-12", "value": 8.1 },
      { "date": "2024-03-13", "value": 5.4 },
      { "date": "2024-03-14", "value": 2.7 },
      { "date": "2024-03-15", "value": 0 }
    ],
    "actual": [
      { "date": "2024-03-01", "value": 38, "completed": 0 },
      { "date": "2024-03-02", "value": 35, "completed": 3 },
      { "date": "2024-03-03", "value": 35, "completed": 0 },
      { "date": "2024-03-04", "value": 32, "completed": 3 },
      { "date": "2024-03-05", "value": 28, "completed": 4 },
      { "date": "2024-03-06", "value": 25, "completed": 3 },
      { "date": "2024-03-07", "value": 22, "completed": 3 },
      { "date": "2024-03-08", "value": 22, "completed": 0 },
      { "date": "2024-03-09", "value": 22, "completed": 0 },
      { "date": "2024-03-10", "value": 14, "completed": 8 }
    ],
    "scope_changes": [
      {
        "date": "2024-03-05",
        "change": 2,
        "item": { "type": "bug", "title": "Critical bug fix added" }
      }
    ],
    "projection": {
      "on_track": true,
      "estimated_completion": "2024-03-14",
      "confidence": 85
    }
  }
}
```

---

## GET /bugs

Get bug resolution metrics.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | string | 30d | 7d, 30d, 90d, 1y |
| product_id | uuid | - | Filter by product |
| severity | string | - | Filter by severity |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-02-10",
      "end": "2024-03-10"
    },
    "summary": {
      "total_reported": 24,
      "total_resolved": 18,
      "open_bugs": 6,
      "resolution_rate": 75,
      "avg_resolution_days": 3.2
    },
    "by_severity": {
      "critical": { "reported": 2, "resolved": 2, "avg_days": 0.5 },
      "major": { "reported": 8, "resolved": 6, "avg_days": 2.1 },
      "minor": { "reported": 10, "resolved": 8, "avg_days": 4.5 },
      "trivial": { "reported": 4, "resolved": 2, "avg_days": 7.0 }
    },
    "by_product": [
      {
        "product_id": "aaa08400-e29b-41d4-a716-446655440001",
        "product_name": "Mobile App",
        "reported": 15,
        "resolved": 12
      },
      {
        "product_id": "bbb08400-e29b-41d4-a716-446655440002",
        "product_name": "Web Dashboard",
        "reported": 9,
        "resolved": 6
      }
    ],
    "trends": [
      { "date": "2024-02-10", "reported": 5, "resolved": 3 },
      { "date": "2024-02-17", "reported": 7, "resolved": 5 },
      { "date": "2024-02-24", "reported": 6, "resolved": 5 },
      { "date": "2024-03-03", "reported": 6, "resolved": 5 }
    ],
    "top_reporters": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440005",
        "full_name": "Jane Smith",
        "bugs_reported": 8
      }
    ],
    "top_fixers": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe",
        "bugs_fixed": 10
      }
    ]
  }
}
```

---

## GET /features

Get feature completion metrics.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | string | 30d | 7d, 30d, 90d, 1y |
| product_id | uuid | - | Filter by product |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-02-10",
      "end": "2024-03-10"
    },
    "summary": {
      "total_features": 45,
      "completed": 18,
      "in_progress": 15,
      "backlog": 12,
      "completion_rate": 40,
      "avg_cycle_time_days": 21
    },
    "by_stage": {
      "idea": 5,
      "discovery": 3,
      "planning": 4,
      "design": 3,
      "development": 8,
      "testing": 4,
      "release": 2,
      "live": 16
    },
    "by_priority": {
      "critical": { "total": 5, "completed": 4 },
      "high": { "total": 15, "completed": 8 },
      "medium": { "total": 18, "completed": 5 },
      "low": { "total": 7, "completed": 1 }
    },
    "cycle_time": {
      "average_days": 21,
      "by_stage": {
        "idea_to_discovery": 3,
        "discovery_to_planning": 4,
        "planning_to_design": 3,
        "design_to_development": 5,
        "development_to_testing": 4,
        "testing_to_release": 2
      }
    },
    "trends": [
      { "date": "2024-02-10", "completed": 3, "started": 5 },
      { "date": "2024-02-17", "completed": 4, "started": 4 },
      { "date": "2024-02-24", "completed": 5, "started": 3 },
      { "date": "2024-03-03", "completed": 6, "started": 4 }
    ],
    "funnel": {
      "idea": 100,
      "discovery": 85,
      "planning": 70,
      "design": 60,
      "development": 50,
      "testing": 40,
      "release": 35,
      "live": 30
    }
  }
}
```

---

## GET /releases

Get release frequency and metrics.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | string | 90d | 30d, 90d, 1y |
| product_id | uuid | - | Filter by product |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2023-12-10",
      "end": "2024-03-10"
    },
    "summary": {
      "total_releases": 8,
      "major": 1,
      "minor": 5,
      "patch": 2,
      "avg_days_between_releases": 11,
      "rollbacks": 1
    },
    "releases": [
      {
        "id": "rel-001",
        "version": "2.0.0",
        "type": "major",
        "released_at": "2024-01-15T10:00:00Z",
        "features_count": 12,
        "bugs_fixed": 8
      },
      {
        "id": "rel-002",
        "version": "2.0.1",
        "type": "patch",
        "released_at": "2024-01-22T10:00:00Z",
        "features_count": 0,
        "bugs_fixed": 5
      }
    ],
    "by_month": [
      { "month": "2024-01", "releases": 3, "features": 15, "bugs": 12 },
      { "month": "2024-02", "releases": 3, "features": 10, "bugs": 8 },
      { "month": "2024-03", "releases": 2, "features": 6, "bugs": 5 }
    ],
    "deployment_success_rate": 87.5,
    "avg_deployment_time_minutes": 12
  }
}
```

---

## GET /team

Get team performance metrics.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | string | 30d | 7d, 30d, 90d |
| product_id | uuid | - | Filter by product |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-02-10",
      "end": "2024-03-10"
    },
    "summary": {
      "team_size": 5,
      "total_points_delivered": 128,
      "avg_points_per_member": 25.6,
      "total_hours_logged": 480,
      "avg_utilization": 82
    },
    "members": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe",
        "avatar_url": "https://example.com/avatar.jpg",
        "role": "owner",
        "points_delivered": 48,
        "tasks_completed": 24,
        "bugs_fixed": 5,
        "hours_logged": 120,
        "utilization": 85,
        "velocity_trend": "up"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440005",
        "full_name": "Jane Smith",
        "avatar_url": null,
        "role": "admin",
        "points_delivered": 38,
        "tasks_completed": 18,
        "bugs_fixed": 3,
        "hours_logged": 95,
        "utilization": 79,
        "velocity_trend": "stable"
      }
    ],
    "collaboration": {
      "code_reviews": 45,
      "comments": 128,
      "pair_programming_hours": 24
    },
    "skill_distribution": [
      { "skill": "React", "members": 4 },
      { "skill": "TypeScript", "members": 4 },
      { "skill": "Node.js", "members": 2 }
    ]
  }
}
```

---

## GET /time-tracking

Get time tracking reports.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | string | 30d | 7d, 30d, 90d |
| user_id | uuid | - | Filter by user |
| product_id | uuid | - | Filter by product |
| group_by | string | day | day, week, user, product |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-02-10",
      "end": "2024-03-10"
    },
    "summary": {
      "total_hours": 480,
      "billable_hours": 420,
      "avg_hours_per_day": 16,
      "estimated_hours": 520,
      "accuracy": 92.3
    },
    "by_day": [
      { "date": "2024-03-01", "hours": 32, "members_active": 5 },
      { "date": "2024-03-04", "hours": 38, "members_active": 5 },
      { "date": "2024-03-05", "hours": 35, "members_active": 5 }
    ],
    "by_user": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe",
        "hours": 120,
        "estimated": 130,
        "accuracy": 92.3
      }
    ],
    "by_product": [
      {
        "id": "aaa08400-e29b-41d4-a716-446655440001",
        "name": "Mobile App",
        "hours": 300
      },
      {
        "id": "bbb08400-e29b-41d4-a716-446655440002",
        "name": "Web Dashboard",
        "hours": 180
      }
    ],
    "by_task_type": {
      "development": 280,
      "testing": 80,
      "design": 60,
      "meetings": 40,
      "documentation": 20
    }
  }
}
```

---

## GET /products

Get product health metrics.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | string | 30d | 7d, 30d, 90d |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "aaa08400-e29b-41d4-a716-446655440001",
        "name": "Mobile App",
        "color": "#6366F1",
        "health_score": 85,
        "metrics": {
          "velocity": { "value": 32, "trend": "up", "change": 8 },
          "bug_rate": { "value": 0.2, "trend": "down", "change": -10 },
          "release_frequency": { "value": 2.5, "trend": "stable", "change": 0 },
          "team_satisfaction": { "value": 4.2, "trend": "up", "change": 5 }
        },
        "risks": [
          { "type": "technical_debt", "severity": "medium", "description": "Legacy code needs refactoring" }
        ],
        "recommendations": [
          "Consider adding more automated tests",
          "Schedule technical debt sprint"
        ]
      }
    ]
  }
}
```

---

## POST /export

Export analytics data.

### Request

```json
{
  "type": "velocity",
  "format": "csv",
  "period": "90d",
  "filters": {
    "product_id": "aaa08400-e29b-41d4-a716-446655440001"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | overview, velocity, burndown, bugs, features, releases, team, time-tracking |
| format | string | Yes | csv, json, pdf |
| period | string | No | Time period |
| filters | object | No | Additional filters |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "download_url": "https://storage.example.com/exports/analytics-velocity-2024-03-10.csv",
    "expires_at": "2024-03-11T10:00:00Z",
    "file_size": 24560,
    "rows": 156
  }
}
```
