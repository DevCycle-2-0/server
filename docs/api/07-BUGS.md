# Bugs API

**Base Path**: `/api/v1/workspaces/:workspaceId/bugs`

## Endpoints Overview

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | List bugs | Yes | Member |
| POST | `/` | Report bug | Yes | Member |
| GET | `/:id` | Get bug details | Yes | Member |
| PATCH | `/:id` | Update bug | Yes | Member |
| DELETE | `/:id` | Delete bug | Yes | Manager |
| PATCH | `/:id/status` | Update status | Yes | Member |
| PATCH | `/:id/assign` | Assign bug | Yes | Manager |
| POST | `/:id/duplicate` | Mark as duplicate | Yes | Member |
| GET | `/:id/comments` | Get comments | Yes | Member |
| POST | `/:id/comments` | Add comment | Yes | Member |

---

## GET /

List bugs with filtering and pagination.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max 100) |
| product_id | uuid | - | Filter by product |
| feature_id | uuid | - | Filter by feature |
| sprint_id | uuid | - | Filter by sprint |
| status | string | - | backlog, todo, in_progress, review, done |
| severity | string | - | critical, major, minor, trivial |
| priority | string | - | critical, high, medium, low |
| assignee_id | uuid | - | Filter by assignee |
| reporter_id | uuid | - | Filter by reporter |
| search | string | - | Search title/description |
| tags | string | - | Comma-separated tags |
| created_from | date | - | Created date range start |
| created_to | date | - | Created date range end |
| sort | string | created_at | Sort field |
| order | string | desc | Sort order: asc, desc |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "bug-001",
      "title": "Login button unresponsive on mobile",
      "description": "The login button doesn't respond to taps on iOS devices",
      "severity": "major",
      "priority": "high",
      "status": "in_progress",
      "product": {
        "id": "aaa08400-e29b-41d4-a716-446655440001",
        "name": "Mobile App",
        "color": "#6366F1"
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
      "tags": ["ios", "ui", "urgent"],
      "comment_count": 3,
      "created_at": "2024-03-05T09:00:00Z",
      "updated_at": "2024-03-06T14:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "total_pages": 1
  }
}
```

---

## POST /

Report a new bug.

### Request

```json
{
  "title": "App crashes on profile photo upload",
  "description": "When uploading a photo larger than 5MB, the app crashes without error message",
  "product_id": "aaa08400-e29b-41d4-a716-446655440001",
  "feature_id": "fff08400-e29b-41d4-a716-446655440002",
  "severity": "major",
  "priority": "high",
  "steps_to_reproduce": "1. Go to Profile settings\n2. Tap 'Change Photo'\n3. Select an image larger than 5MB\n4. App crashes",
  "expected_behavior": "Photo should be uploaded or show file size error",
  "actual_behavior": "App crashes and restarts",
  "environment": {
    "os": "iOS 17.2",
    "device": "iPhone 15 Pro",
    "app_version": "2.1.0",
    "browser": null
  },
  "tags": ["crash", "upload", "ios"],
  "attachments": [
    {
      "name": "crash-log.txt",
      "url": "https://storage.example.com/uploads/crash-log.txt"
    }
  ]
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | Yes | 10-200 characters |
| description | string | Yes | 20-5000 characters |
| product_id | uuid | No | Valid product ID |
| feature_id | uuid | No | Valid feature ID |
| severity | string | Yes | critical, major, minor, trivial |
| priority | string | No | critical, high, medium, low |
| steps_to_reproduce | string | No | Max 2000 characters |
| expected_behavior | string | No | Max 1000 characters |
| actual_behavior | string | No | Max 1000 characters |
| environment | object | No | Device/browser info |
| tags | array | No | Max 10 tags |
| attachments | array | No | Max 10 attachments |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "bug-015",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "App crashes on profile photo upload",
    "description": "When uploading a photo larger than 5MB, the app crashes without error message",
    "severity": "major",
    "priority": "high",
    "status": "todo",
    "product": {
      "id": "aaa08400-e29b-41d4-a716-446655440001",
      "name": "Mobile App"
    },
    "feature": {
      "id": "fff08400-e29b-41d4-a716-446655440002",
      "title": "User Profile"
    },
    "steps_to_reproduce": "1. Go to Profile settings\n2. Tap 'Change Photo'\n3. Select an image larger than 5MB\n4. App crashes",
    "expected_behavior": "Photo should be uploaded or show file size error",
    "actual_behavior": "App crashes and restarts",
    "environment": {
      "os": "iOS 17.2",
      "device": "iPhone 15 Pro",
      "app_version": "2.1.0"
    },
    "reporter": {
      "id": "660e8400-e29b-41d4-a716-446655440005",
      "full_name": "Jane Smith"
    },
    "tags": ["crash", "upload", "ios"],
    "attachments": [
      {
        "id": "att-001",
        "name": "crash-log.txt",
        "url": "https://storage.example.com/uploads/crash-log.txt"
      }
    ],
    "created_at": "2024-03-06T10:00:00Z"
  }
}
```

---

## GET /:id

Get detailed bug information.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "bug-001",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Login button unresponsive on mobile",
    "description": "The login button doesn't respond to taps on iOS devices running iOS 17+",
    "severity": "major",
    "priority": "high",
    "status": "in_progress",
    "product": {
      "id": "aaa08400-e29b-41d4-a716-446655440001",
      "name": "Mobile App",
      "color": "#6366F1"
    },
    "feature": {
      "id": "fff08400-e29b-41d4-a716-446655440001",
      "title": "User Authentication"
    },
    "sprint": {
      "id": "ddd08400-e29b-41d4-a716-446655440004",
      "name": "Sprint 8"
    },
    "steps_to_reproduce": "1. Open the app on an iOS 17 device\n2. Navigate to login screen\n3. Enter credentials\n4. Tap the login button\n5. Nothing happens",
    "expected_behavior": "User should be logged in and redirected to dashboard",
    "actual_behavior": "Button doesn't respond to tap, no visual feedback",
    "environment": {
      "os": "iOS 17.2",
      "device": "iPhone 15, iPhone 14 Pro",
      "app_version": "2.1.0",
      "browser": null
    },
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
    "tags": ["ios", "ui", "urgent"],
    "attachments": [
      {
        "id": "att-002",
        "name": "screen-recording.mp4",
        "url": "https://storage.example.com/uploads/screen-recording.mp4",
        "size": 2450000,
        "type": "video/mp4"
      }
    ],
    "duplicate_of": null,
    "duplicates": [],
    "related_bugs": [
      {
        "id": "bug-003",
        "title": "Touch events not registering on buttons"
      }
    ],
    "resolution": null,
    "resolved_at": null,
    "activity": [
      {
        "type": "status_changed",
        "from": "todo",
        "to": "in_progress",
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "full_name": "John Doe"
        },
        "created_at": "2024-03-06T14:00:00Z"
      },
      {
        "type": "assigned",
        "to": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "full_name": "John Doe"
        },
        "user": {
          "id": "660e8400-e29b-41d4-a716-446655440005",
          "full_name": "Jane Smith"
        },
        "created_at": "2024-03-06T10:00:00Z"
      }
    ],
    "created_at": "2024-03-05T09:00:00Z",
    "updated_at": "2024-03-06T14:00:00Z"
  }
}
```

---

## PATCH /:id

Update bug details.

### Request

```json
{
  "title": "Login button unresponsive on iOS 17+ devices",
  "severity": "critical",
  "priority": "critical",
  "sprint_id": "ddd08400-e29b-41d4-a716-446655440004",
  "tags": ["ios", "ui", "urgent", "blocker"]
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "bug-001",
    "title": "Login button unresponsive on iOS 17+ devices",
    "severity": "critical",
    "priority": "critical",
    "sprint": {
      "id": "ddd08400-e29b-41d4-a716-446655440004",
      "name": "Sprint 8"
    },
    "tags": ["ios", "ui", "urgent", "blocker"],
    "updated_at": "2024-03-06T15:00:00Z"
  }
}
```

---

## DELETE /:id

Delete a bug.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Bug deleted successfully"
}
```

---

## PATCH /:id/status

Update bug status.

### Request

```json
{
  "status": "done",
  "resolution": "Fixed touch event handler for iOS 17 compatibility",
  "comment": "Deployed fix in version 2.1.1"
}
```

| Status | Description |
|--------|-------------|
| backlog | Not yet triaged |
| todo | Confirmed and ready to fix |
| in_progress | Currently being worked on |
| review | Fix ready for review/testing |
| done | Resolved and verified |
| cancelled | Won't fix / not a bug |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "bug-001",
    "status": "done",
    "previous_status": "in_progress",
    "resolution": "Fixed touch event handler for iOS 17 compatibility",
    "resolved_at": "2024-03-07T11:00:00Z",
    "resolved_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "updated_at": "2024-03-07T11:00:00Z"
  }
}
```

---

## PATCH /:id/assign

Assign bug to a team member.

### Request

```json
{
  "assignee_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "bug-001",
    "assignee": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "updated_at": "2024-03-06T10:00:00Z"
  }
}
```

---

## POST /:id/duplicate

Mark bug as duplicate of another bug.

### Request

```json
{
  "duplicate_of": "bug-003"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "bug-001",
    "status": "cancelled",
    "duplicate_of": {
      "id": "bug-003",
      "title": "Touch events not registering on buttons"
    },
    "updated_at": "2024-03-06T12:00:00Z"
  }
}
```

---

## GET /:id/comments

Get bug comments.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "comment-020",
      "content": "I can reproduce this on my iPhone 15 Pro as well",
      "author": {
        "id": "770e8400-e29b-41d4-a716-446655440006",
        "full_name": "Mike Johnson",
        "avatar_url": null
      },
      "attachments": [
        {
          "id": "att-003",
          "name": "screenshot.png",
          "url": "https://storage.example.com/uploads/screenshot.png"
        }
      ],
      "created_at": "2024-03-05T10:00:00Z"
    },
    {
      "id": "comment-021",
      "content": "Found the issue - it's related to the iOS 17 touch event handling changes",
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe"
      },
      "created_at": "2024-03-06T14:30:00Z"
    }
  ],
  "meta": {
    "total": 3
  }
}
```

---

## POST /:id/comments

Add a comment to the bug.

### Request

```json
{
  "content": "Fix deployed to staging, please verify @Jane",
  "mentions": ["660e8400-e29b-41d4-a716-446655440005"],
  "attachments": [
    {
      "name": "fix-diff.png",
      "url": "https://storage.example.com/uploads/fix-diff.png"
    }
  ]
}
```

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "comment-022",
    "content": "Fix deployed to staging, please verify @Jane",
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
    "attachments": [
      {
        "id": "att-004",
        "name": "fix-diff.png",
        "url": "https://storage.example.com/uploads/fix-diff.png"
      }
    ],
    "created_at": "2024-03-07T10:00:00Z"
  }
}
```
