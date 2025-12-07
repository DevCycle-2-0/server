# Releases API

**Base Path**: `/api/v1/workspaces/:workspaceId/releases`

## Endpoints Overview

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | List releases | Yes | Member |
| POST | `/` | Create release | Yes | Manager |
| GET | `/:id` | Get release details | Yes | Member |
| PATCH | `/:id` | Update release | Yes | Manager |
| DELETE | `/:id` | Delete release | Yes | Admin |
| POST | `/:id/publish` | Publish release | Yes | Admin |
| POST | `/:id/rollback` | Rollback release | Yes | Admin |
| GET | `/:id/features` | Get included features | Yes | Member |
| POST | `/:id/features` | Add features | Yes | Manager |
| DELETE | `/:id/features/:featureId` | Remove feature | Yes | Manager |
| GET | `/:id/notes` | Get release notes | Yes | Member |
| PATCH | `/:id/notes` | Update release notes | Yes | Manager |
| GET | `/:id/changelog` | Get public changelog | No | - |

---

## GET /

List releases with filtering.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| product_id | uuid | - | Filter by product |
| status | string | - | draft, planned, in_progress, staged, released, rolled_back |
| type | string | - | major, minor, patch, hotfix |
| sort | string | created_at | Sort field |
| order | string | desc | Sort order |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "rel-005",
      "version": "2.2.0",
      "name": "Authentication Update",
      "status": "in_progress",
      "release_type": "minor",
      "product": {
        "id": "aaa08400-e29b-41d4-a716-446655440001",
        "name": "Mobile App",
        "color": "#6366F1"
      },
      "target_date": "2024-03-20",
      "feature_count": 4,
      "features_completed": 2,
      "progress_percentage": 50,
      "created_by": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe"
      },
      "created_at": "2024-03-01T10:00:00Z"
    },
    {
      "id": "rel-004",
      "version": "2.1.0",
      "name": "User Profile Features",
      "status": "released",
      "release_type": "minor",
      "product": {
        "id": "aaa08400-e29b-41d4-a716-446655440001",
        "name": "Mobile App"
      },
      "target_date": "2024-02-28",
      "released_at": "2024-02-28T10:00:00Z",
      "feature_count": 5,
      "features_completed": 5,
      "progress_percentage": 100,
      "created_at": "2024-02-01T10:00:00Z"
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

## POST /

Create a new release.

### Request

```json
{
  "version": "2.3.0",
  "name": "Payment Integration",
  "description": "Add payment processing and subscription management",
  "product_id": "aaa08400-e29b-41d4-a716-446655440001",
  "release_type": "minor",
  "target_date": "2024-04-15",
  "pipeline_config": {
    "stages": ["build", "test", "staging", "production"],
    "auto_deploy_staging": true,
    "require_approval": true
  }
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| version | string | Yes | Semantic version (e.g., 1.2.3) |
| name | string | No | 2-100 characters |
| description | string | No | Max 2000 characters |
| product_id | uuid | No | Valid product ID |
| release_type | string | Yes | major, minor, patch, hotfix |
| target_date | date | No | Future date |
| pipeline_config | object | No | Deployment pipeline settings |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "rel-006",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "version": "2.3.0",
    "name": "Payment Integration",
    "description": "Add payment processing and subscription management",
    "status": "draft",
    "release_type": "minor",
    "product": {
      "id": "aaa08400-e29b-41d4-a716-446655440001",
      "name": "Mobile App"
    },
    "target_date": "2024-04-15",
    "pipeline_config": {
      "stages": ["build", "test", "staging", "production"],
      "auto_deploy_staging": true,
      "require_approval": true
    },
    "created_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "created_at": "2024-03-10T10:00:00Z"
  }
}
```

---

## GET /:id

Get detailed release information.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "rel-005",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001",
    "version": "2.2.0",
    "name": "Authentication Update",
    "description": "Enhanced authentication with OAuth2 and MFA support",
    "status": "in_progress",
    "release_type": "minor",
    "product": {
      "id": "aaa08400-e29b-41d4-a716-446655440001",
      "name": "Mobile App",
      "color": "#6366F1"
    },
    "target_date": "2024-03-20",
    "released_at": null,
    "released_by": null,
    "features": [
      {
        "id": "fff08400-e29b-41d4-a716-446655440001",
        "title": "User Authentication",
        "stage": "development",
        "status": "in_progress"
      },
      {
        "id": "fff08400-e29b-41d4-a716-446655440003",
        "title": "Multi-Factor Authentication",
        "stage": "testing",
        "status": "in_progress"
      },
      {
        "id": "fff08400-e29b-41d4-a716-446655440004",
        "title": "OAuth2 Integration",
        "stage": "live",
        "status": "done"
      },
      {
        "id": "fff08400-e29b-41d4-a716-446655440005",
        "title": "Password Policies",
        "stage": "live",
        "status": "done"
      }
    ],
    "feature_summary": {
      "total": 4,
      "completed": 2,
      "in_progress": 2,
      "by_stage": {
        "development": 1,
        "testing": 1,
        "live": 2
      }
    },
    "bugs_fixed": [
      {
        "id": "bug-001",
        "title": "Login button unresponsive on mobile",
        "severity": "major"
      }
    ],
    "pipeline": {
      "config": {
        "stages": ["build", "test", "staging", "production"],
        "auto_deploy_staging": true,
        "require_approval": true
      },
      "current_stage": null,
      "history": []
    },
    "release_notes": {
      "summary": "This release brings enhanced security with OAuth2 and MFA",
      "highlights": [
        "OAuth2 support for Google, Apple, and GitHub",
        "Optional multi-factor authentication",
        "Enhanced password policies"
      ],
      "breaking_changes": [],
      "deprecations": []
    },
    "rollback_reason": null,
    "rolled_back_at": null,
    "created_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "created_at": "2024-03-01T10:00:00Z",
    "updated_at": "2024-03-10T14:00:00Z"
  }
}
```

---

## PATCH /:id

Update release details.

### Request

```json
{
  "name": "Authentication Update v2",
  "target_date": "2024-03-25",
  "description": "Enhanced authentication with OAuth2, MFA, and SSO support"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "rel-005",
    "name": "Authentication Update v2",
    "target_date": "2024-03-25",
    "description": "Enhanced authentication with OAuth2, MFA, and SSO support",
    "updated_at": "2024-03-10T15:00:00Z"
  }
}
```

---

## DELETE /:id

Delete a release.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Release deleted successfully"
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | ALREADY_RELEASED | Cannot delete published release |

---

## POST /:id/publish

Publish/deploy a release.

### Request

```json
{
  "deploy_to": "production",
  "notes": "Deploying after successful staging verification"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "rel-005",
    "version": "2.2.0",
    "status": "released",
    "released_at": "2024-03-20T10:00:00Z",
    "released_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "pipeline": {
      "current_stage": "production",
      "completed_at": "2024-03-20T10:05:00Z"
    }
  }
}
```

### Errors

| Code | Error | Description |
|------|-------|-------------|
| 400 | INCOMPLETE_FEATURES | Not all features are complete |
| 400 | APPROVAL_REQUIRED | Needs approval before deploy |
| 400 | ALREADY_RELEASED | Release already published |

---

## POST /:id/rollback

Rollback a released version.

### Request

```json
{
  "reason": "Critical bug discovered in authentication flow",
  "rollback_to": "rel-004"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "rel-005",
    "version": "2.2.0",
    "status": "rolled_back",
    "rollback_reason": "Critical bug discovered in authentication flow",
    "rolled_back_at": "2024-03-20T12:00:00Z",
    "rolled_back_by": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe"
    },
    "rolled_back_to": {
      "id": "rel-004",
      "version": "2.1.0"
    }
  }
}
```

---

## GET /:id/features

Get features included in the release.

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "fff08400-e29b-41d4-a716-446655440001",
      "title": "User Authentication",
      "description": "Secure login with OAuth2 support",
      "stage": "development",
      "status": "in_progress",
      "priority": "high",
      "story_points": 8,
      "assignee": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "full_name": "John Doe"
      },
      "added_at": "2024-03-01T10:00:00Z"
    }
  ]
}
```

---

## POST /:id/features

Add features to the release.

### Request

```json
{
  "feature_ids": [
    "fff08400-e29b-41d4-a716-446655440006",
    "fff08400-e29b-41d4-a716-446655440007"
  ]
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "added": 2,
    "feature_count": 6
  }
}
```

---

## DELETE /:id/features/:featureId

Remove a feature from the release.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Feature removed from release",
  "data": {
    "feature_count": 5
  }
}
```

---

## GET /:id/notes

Get detailed release notes.

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "release_id": "rel-005",
    "version": "2.2.0",
    "summary": "This release brings enhanced security with OAuth2 and MFA support",
    "highlights": [
      "OAuth2 support for Google, Apple, and GitHub",
      "Optional multi-factor authentication",
      "Enhanced password policies",
      "Improved session management"
    ],
    "features": [
      {
        "title": "OAuth2 Integration",
        "description": "Sign in with Google, Apple, or GitHub accounts"
      },
      {
        "title": "Multi-Factor Authentication",
        "description": "Add an extra layer of security with TOTP or SMS verification"
      }
    ],
    "bug_fixes": [
      {
        "id": "bug-001",
        "title": "Login button unresponsive on mobile",
        "description": "Fixed touch event handling on iOS 17+ devices"
      }
    ],
    "breaking_changes": [
      {
        "description": "Removed deprecated /auth/legacy endpoint",
        "migration": "Use /auth/login instead"
      }
    ],
    "deprecations": [
      {
        "feature": "Password-only authentication",
        "removal_version": "3.0.0",
        "alternative": "Use OAuth2 or email magic links"
      }
    ],
    "known_issues": [],
    "updated_at": "2024-03-15T10:00:00Z"
  }
}
```

---

## PATCH /:id/notes

Update release notes.

### Request

```json
{
  "summary": "Enhanced security release with OAuth2, MFA, and SSO",
  "highlights": [
    "OAuth2 support for Google, Apple, GitHub, and Microsoft",
    "Multi-factor authentication with TOTP and SMS",
    "Enterprise SSO support",
    "Enhanced password policies"
  ],
  "breaking_changes": [],
  "deprecations": []
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "release_id": "rel-005",
    "updated_at": "2024-03-15T11:00:00Z"
  }
}
```

---

## GET /:id/changelog

Get public changelog (no authentication required).

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "version": "2.2.0",
    "name": "Authentication Update",
    "released_at": "2024-03-20T10:00:00Z",
    "summary": "Enhanced security with OAuth2 and MFA support",
    "highlights": [
      "OAuth2 support for Google, Apple, and GitHub",
      "Optional multi-factor authentication",
      "Enhanced password policies"
    ],
    "features": [
      {
        "title": "OAuth2 Integration",
        "description": "Sign in with Google, Apple, or GitHub accounts"
      }
    ],
    "bug_fixes": [
      {
        "title": "Fixed mobile login issues",
        "description": "Resolved touch event handling on iOS 17+ devices"
      }
    ],
    "breaking_changes": []
  }
}
```
