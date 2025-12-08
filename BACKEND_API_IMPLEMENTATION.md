# DevCycle Backend API Implementation Guide

> **Version**: 1.0.0  
> **Last Updated**: 2024-12-08  
> **Target**: Backend Developer Team

This document provides complete specifications for implementing the REST API backend for the DevCycle platform. All endpoints, request/response schemas, validation rules, and error codes are defined to ensure exact compatibility with the frontend implementation.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Base Configuration](#base-configuration)
3. [Authentication Module](#1-authentication-module)
4. [Products Module](#2-products-module)
5. [Features Module](#3-features-module)
6. [Tasks Module](#4-tasks-module)
7. [Bugs Module](#5-bugs-module)
8. [Sprints Module](#6-sprints-module)
9. [Releases Module](#7-releases-module)
10. [Team Module](#8-team-module)
11. [Analytics Module](#9-analytics-module)
12. [Settings Module](#10-settings-module)
13. [Dashboard Module](#11-dashboard-module)
14. [Billing Module](#12-billing-module)
15. [Common Types & Enums](#common-types--enums)
16. [Error Handling](#error-handling)
17. [Database Schema](#database-schema)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      DevCycle Frontend                          │
│                   (React + TanStack Query)                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS/REST
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway                                 │
│                  (Rate Limiting, CORS)                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
    ┌─────────────────────┼─────────────────────┐
    ▼                     ▼                     ▼
┌─────────┐        ┌─────────────┐       ┌──────────┐
│  Auth   │        │   Core API  │       │ Webhooks │
│ Service │        │   Service   │       │ Handler  │
└────┬────┘        └──────┬──────┘       └────┬─────┘
     │                    │                   │
     └────────────────────┼───────────────────┘
                          ▼
              ┌─────────────────────┐
              │    PostgreSQL DB    │
              └─────────────────────┘
```

---

## Base Configuration

### API Base URL
```
Production: https://api.devcycle.io/v1
Staging:    https://api-staging.devcycle.io/v1
```

### Global Headers

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer <access_token>
X-Workspace-Id: <workspace_uuid> (optional, for multi-workspace)
```

**Response Headers:**
```http
Content-Type: application/json
X-Request-Id: <uuid>
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699999999
```

### Standard Response Wrapper

```typescript
// Success Response
interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

// Paginated Response
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Response
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
    requestId: string;
  };
}
```

---

## 1. Authentication Module

### Data Types

```typescript
interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

type UserRole = 'owner' | 'admin' | 'member' | 'viewer';
type AppRole = 
  | 'business_owner'
  | 'product_owner'
  | 'technical_leader'
  | 'ui_ux_designer'
  | 'frontend_dev'
  | 'backend_dev'
  | 'mobile_android'
  | 'mobile_ios'
  | 'qa_tester'
  | 'project_manager';
```

### Endpoints

#### POST /auth/login
**Description:** Authenticate user with email and password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://...",
      "emailVerified": true,
      "workspaceId": "uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 3600
    }
  }
}
```

**Validation:**
- `email`: Required, valid email format, max 255 chars
- `password`: Required, min 8 chars

---

#### POST /auth/signup
**Description:** Register a new user account

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "Jane Doe",
  "workspaceName": "My Company"
}
```

**Response (201):** Same as login response

**Validation:**
- `email`: Required, valid email, unique
- `password`: Required, min 8 chars, must contain uppercase, lowercase, number
- `name`: Required, min 2 chars, max 100 chars
- `workspaceName`: Optional, min 2 chars, max 100 chars

---

#### POST /auth/logout
**Description:** Invalidate current session tokens

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (204):** No content

---

#### GET /auth/me
**Description:** Get current authenticated user

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "emailVerified": true,
    "workspaceId": "uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### GET /auth/me/roles
**Description:** Get current user's roles in workspace

**Response (200):**
```json
{
  "data": ["owner", "product_owner"]
}
```

---

#### PATCH /auth/me
**Description:** Update current user profile

**Request:**
```json
{
  "name": "Updated Name",
  "avatar": "https://new-avatar-url.com/image.jpg"
}
```

**Response (200):** Updated AuthUser object

---

#### POST /auth/refresh
**Description:** Refresh access token

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

#### POST /auth/password/reset-request
**Description:** Request password reset email

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

---

#### POST /auth/password/reset
**Description:** Reset password with token

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

---

#### POST /auth/password/change
**Description:** Change password (authenticated)

**Request:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

#### POST /auth/verify-email
**Description:** Verify email address with token

**Request:**
```json
{
  "token": "verification-token"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

---

#### POST /auth/resend-verification
**Description:** Resend email verification

**Response (200):**
```json
{
  "message": "Verification email sent"
}
```

---

### Workspace Endpoints

#### POST /workspaces
**Description:** Create a new workspace

**Request:**
```json
{
  "name": "My Company",
  "slug": "my-company"
}
```

**Response (201):** Workspace object

---

#### GET /workspaces/current
**Description:** Get current workspace

**Response (200):** Workspace object

---

#### PATCH /workspaces/:id
**Description:** Update workspace

**Request:**
```json
{
  "name": "Updated Company Name"
}
```

**Response (200):** Updated Workspace object

---

#### DELETE /workspaces/:id
**Description:** Delete workspace

**Response (204):** No content

---

#### POST /workspaces/:workspaceId/invites
**Description:** Invite user to workspace

**Request:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

**Response (201):**
```json
{
  "message": "Invitation sent"
}
```

---

#### POST /workspaces/invites/accept
**Description:** Accept workspace invitation

**Request:**
```json
{
  "token": "invitation-token"
}
```

**Response (200):**
```json
{
  "message": "Invitation accepted"
}
```

---

#### GET /workspaces/:workspaceId/members
**Description:** Get all workspace members

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### DELETE /workspaces/:workspaceId/members/:userId
**Description:** Remove member from workspace

**Response (204):** No content

---

#### PATCH /workspaces/:workspaceId/members/:userId/role
**Description:** Update member role

**Request:**
```json
{
  "role": "admin"
}
```

**Response (200):**
```json
{
  "message": "Role updated"
}
```

---

## 2. Products Module

### Data Types

```typescript
type Platform = 'web' | 'android' | 'ios' | 'api' | 'desktop';

interface Product {
  id: string;
  name: string;
  description: string;
  platforms: Platform[];
  ownerId: string;
  ownerName: string;
  status: 'active' | 'archived';
  featuresCount: number;
  bugsCount: number;
  teamMembersCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductStats {
  totalFeatures: number;
  activeFeatures: number;
  completedFeatures: number;
  openBugs: number;
  resolvedBugs: number;
  activeSprintsCount: number;
  teamMembersCount: number;
  lastActivityAt: string;
}
```

### Endpoints

#### GET /products
**Description:** Get all products with optional filters

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| status | string | Filter by status: active, archived |
| platform | string | Filter by platform |
| search | string | Search in name, description |
| sortBy | string | Sort field: name, createdAt, updatedAt |
| sortOrder | string | asc or desc |

**Response (200):** PaginatedResponse<Product>

---

#### GET /products/:id
**Description:** Get single product by ID

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Mobile App",
    "description": "Our flagship mobile application",
    "platforms": ["android", "ios"],
    "ownerId": "uuid",
    "ownerName": "John Doe",
    "status": "active",
    "featuresCount": 25,
    "bugsCount": 5,
    "teamMembersCount": 8,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
}
```

---

#### POST /products
**Description:** Create a new product

**Request:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "platforms": ["web", "android", "ios"]
}
```

**Validation:**
- `name`: Required, min 2 chars, max 100 chars, unique per workspace
- `description`: Optional, max 1000 chars
- `platforms`: Required, array of valid platform values

**Response (201):** Product object

---

#### PATCH /products/:id
**Description:** Update product

**Request:**
```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "platforms": ["web"]
}
```

**Response (200):** Updated Product object

---

#### DELETE /products/:id
**Description:** Delete product (soft delete, archives)

**Response (204):** No content

---

#### GET /products/:id/stats
**Description:** Get product statistics

**Response (200):**
```json
{
  "data": {
    "totalFeatures": 50,
    "activeFeatures": 15,
    "completedFeatures": 30,
    "openBugs": 12,
    "resolvedBugs": 45,
    "activeSprintsCount": 2,
    "teamMembersCount": 10,
    "lastActivityAt": "2024-01-20T14:30:00Z"
  }
}
```

---

#### GET /products/:id/team
**Description:** Get product team members

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "Jane Doe",
      "userEmail": "jane@example.com",
      "userAvatar": "https://...",
      "role": "frontend_dev",
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /products/:id/team
**Description:** Add team member to product

**Request:**
```json
{
  "userId": "uuid"
}
```

**Response (201):**
```json
{
  "message": "Team member added"
}
```

---

#### DELETE /products/:id/team/:userId
**Description:** Remove team member from product

**Response (204):** No content

---

## 3. Features Module

### Data Types

```typescript
type FeatureStatus = 
  | 'idea'
  | 'review'
  | 'approved'
  | 'planning'
  | 'design'
  | 'development'
  | 'testing'
  | 'release'
  | 'live'
  | 'rejected';

type Priority = 'low' | 'medium' | 'high' | 'critical';

interface Feature {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  priority: Priority;
  productId: string;
  productName: string;
  platform: Platform;
  requestedBy: string;
  requestedByName: string;
  assigneeId?: string;
  assigneeName?: string;
  sprintId?: string;
  sprintName?: string;
  votes: number;
  votedBy: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

interface FeatureLifecycleData {
  // Discovery Stage
  userStories: UserStory[];
  wireframes: Wireframe[];
  flowDiagrams: FlowDiagram[];
  
  // Planning Stage
  sprintId?: string;
  estimatedHours?: number;
  estimatedDays?: number;
  taskBreakdown: TaskBreakdown[];
  dependencies: string[];
  
  // Design Stage
  designFiles: DesignFile[];
  designReviewChecklist: DesignReviewItem[];
  designComments: Comment[];
  designApproved: boolean;
  designApprovedBy?: string;
  designApprovedAt?: string;
  
  // Development Stage
  developmentTasks: TaskBreakdown[];
  codeCommits: CodeCommit[];
  developmentProgress: number;
  
  // Testing Stage
  testCases: TestCase[];
  linkedBugIds: string[];
  testingProgress: number;
  fixCycleCount: number;
  
  // Release Stage
  changelog: ChangelogEntry[];
  buildVersion?: string;
  deploymentStatus: DeploymentStatus[];
  releaseNotes?: string;
  releasedAt?: string;
}
```

### Endpoints

#### GET /features
**Description:** Get all features with filters

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | Filter by status (comma-separated) |
| priority | string | Filter by priority (comma-separated) |
| productId | string | Filter by product |
| platform | string | Filter by platform |
| assigneeId | string | Filter by assignee |
| sprintId | string | Filter by sprint |
| search | string | Search in title, description |
| sortBy | string | Sort field |
| sortOrder | string | asc or desc |

**Response (200):** PaginatedResponse<Feature>

---

#### GET /features/:id
**Description:** Get feature by ID with full lifecycle data

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "title": "User Authentication",
    "description": "Implement OAuth 2.0 login",
    "status": "development",
    "priority": "high",
    "productId": "uuid",
    "productName": "Web App",
    "platform": "web",
    "requestedBy": "uuid",
    "requestedByName": "Jane Doe",
    "assigneeId": "uuid",
    "assigneeName": "John Dev",
    "sprintId": "uuid",
    "sprintName": "Sprint 5",
    "votes": 15,
    "votedBy": ["uuid1", "uuid2"],
    "estimatedHours": 40,
    "actualHours": 32,
    "tags": ["authentication", "security"],
    "lifecycle": {
      "userStories": [...],
      "designFiles": [...],
      "testCases": [...]
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-20T00:00:00Z"
  }
}
```

---

#### POST /features
**Description:** Create a new feature

**Request:**
```json
{
  "title": "New Feature",
  "description": "Feature description with markdown support",
  "priority": "medium",
  "productId": "uuid",
  "platform": "web",
  "tags": ["new", "enhancement"],
  "dueDate": "2024-03-01"
}
```

**Validation:**
- `title`: Required, min 5 chars, max 200 chars
- `description`: Required, min 10 chars, max 5000 chars
- `priority`: Required, valid priority value
- `productId`: Required, valid UUID, must exist
- `platform`: Required, valid platform value

**Response (201):** Feature object

---

#### PATCH /features/:id
**Description:** Update feature

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "high",
  "estimatedHours": 24,
  "tags": ["updated"]
}
```

**Response (200):** Updated Feature object

---

#### DELETE /features/:id
**Description:** Delete feature

**Response (204):** No content

---

#### PATCH /features/:id/status
**Description:** Update feature status

**Request:**
```json
{
  "status": "approved"
}
```

**Validation:**
- Status transitions must follow valid workflow (idea → review → approved → ...)

**Response (200):** Updated Feature object

---

#### POST /features/:id/vote
**Description:** Vote for a feature

**Response (200):**
```json
{
  "data": {
    "votes": 16,
    "votedBy": ["uuid1", "uuid2", "current_user_uuid"]
  }
}
```

---

#### DELETE /features/:id/vote
**Description:** Remove vote from feature

**Response (200):**
```json
{
  "data": {
    "votes": 15,
    "votedBy": ["uuid1", "uuid2"]
  }
}
```

---

#### POST /features/:id/assign-sprint
**Description:** Assign feature to sprint

**Request:**
```json
{
  "sprintId": "uuid"
}
```

**Response (200):** Updated Feature object

---

#### DELETE /features/:id/assign-sprint
**Description:** Unassign feature from sprint

**Response (200):** Updated Feature object

---

#### POST /features/:id/approve
**Description:** Approve feature (requires approval permission)

**Request:**
```json
{
  "comment": "Approved for development"
}
```

**Response (200):** Updated Feature object

---

#### POST /features/:id/reject
**Description:** Reject feature (requires approval permission)

**Request:**
```json
{
  "reason": "Not aligned with product roadmap"
}
```

**Response (200):** Updated Feature object

---

#### GET /features/:id/tasks
**Description:** Get tasks linked to feature

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Implement OAuth flow",
      "status": "in_progress",
      "type": "backend",
      "estimatedHours": 8
    }
  ]
}
```

---

#### GET /features/:id/comments
**Description:** Get feature comments

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "Jane Doe",
      "userAvatar": "https://...",
      "content": "Looking good!",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

#### POST /features/:id/comments
**Description:** Add comment to feature

**Request:**
```json
{
  "content": "This is my comment with **markdown** support"
}
```

**Response (201):** Comment object

---

## 4. Tasks Module

### Data Types

```typescript
type TaskStatus = 
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'testing'
  | 'done'
  | 'blocked';

type TaskType = 
  | 'frontend'
  | 'backend'
  | 'mobile_android'
  | 'mobile_ios'
  | 'api'
  | 'design'
  | 'qa'
  | 'devops'
  | 'documentation'
  | 'other';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  type: TaskType;
  priority: Priority;
  featureId?: string;
  featureTitle?: string;
  sprintId?: string;
  sprintName?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  estimatedHours?: number;
  loggedHours: number;
  dueDate?: string;
  completedAt?: string;
  subtasks: Subtask[];
  dependencies: TaskDependency[];
  attachments: Attachment[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

interface TaskDependency {
  taskId: string;
  taskTitle: string;
  type: 'blocks' | 'blocked_by';
}

interface TimeLog {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  hours: number;
  date: string;
  description?: string;
  createdAt: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}
```

### Endpoints

#### GET /tasks
**Description:** Get all tasks with filters

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | Filter by status (comma-separated) |
| type | string | Filter by type (comma-separated) |
| priority | string | Filter by priority |
| featureId | string | Filter by feature |
| sprintId | string | Filter by sprint |
| assigneeId | string | Filter by assignee |
| search | string | Search in title, description |

**Response (200):** PaginatedResponse<Task>

---

#### GET /tasks/:id
**Description:** Get task by ID

**Response (200):** Task object with all nested data

---

#### POST /tasks
**Description:** Create a new task

**Request:**
```json
{
  "title": "Implement login form",
  "description": "Create responsive login form with validation",
  "type": "frontend",
  "priority": "high",
  "featureId": "uuid",
  "sprintId": "uuid",
  "assigneeId": "uuid",
  "estimatedHours": 8,
  "dueDate": "2024-02-01",
  "labels": ["auth", "ui"]
}
```

**Validation:**
- `title`: Required, min 3 chars, max 200 chars
- `description`: Optional, max 5000 chars
- `type`: Required, valid TaskType
- `priority`: Required, valid Priority
- `estimatedHours`: Optional, positive number, max 999

**Response (201):** Task object

---

#### PATCH /tasks/:id
**Description:** Update task

**Response (200):** Updated Task object

---

#### DELETE /tasks/:id
**Description:** Delete task

**Response (204):** No content

---

#### PATCH /tasks/:id/status
**Description:** Update task status

**Request:**
```json
{
  "status": "in_progress"
}
```

**Response (200):** Updated Task object

---

#### POST /tasks/:id/assign
**Description:** Assign task to user

**Request:**
```json
{
  "assigneeId": "uuid"
}
```

**Response (200):** Updated Task object

---

#### DELETE /tasks/:id/assign
**Description:** Unassign task

**Response (200):** Updated Task object

---

#### POST /tasks/:id/time-logs
**Description:** Log time on task

**Request:**
```json
{
  "hours": 2.5,
  "date": "2024-01-20",
  "description": "Implemented form validation"
}
```

**Validation:**
- `hours`: Required, positive number, max 24
- `date`: Required, valid date format, not future
- `description`: Optional, max 500 chars

**Response (201):** TimeLog object

---

#### GET /tasks/:id/time-logs
**Description:** Get time logs for task

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "taskId": "uuid",
      "userId": "uuid",
      "userName": "John Doe",
      "hours": 2.5,
      "date": "2024-01-20",
      "description": "Implemented validation",
      "createdAt": "2024-01-20T15:00:00Z"
    }
  ]
}
```

---

#### POST /tasks/:id/subtasks
**Description:** Add subtask

**Request:**
```json
{
  "title": "Create form layout"
}
```

**Response (201):** Subtask object

---

#### PATCH /tasks/:id/subtasks/:subtaskId
**Description:** Update subtask

**Request:**
```json
{
  "title": "Updated title",
  "completed": true
}
```

**Response (200):** Updated Subtask object

---

#### DELETE /tasks/:id/subtasks/:subtaskId
**Description:** Delete subtask

**Response (204):** No content

---

#### POST /tasks/:id/subtasks/:subtaskId/toggle
**Description:** Toggle subtask completion

**Response (200):** Updated Subtask object

---

#### GET /tasks/:id/comments
**Description:** Get task comments

**Response (200):** Array of Comment objects

---

#### POST /tasks/:id/comments
**Description:** Add comment to task

**Request:**
```json
{
  "content": "Comment with **markdown**"
}
```

**Response (201):** Comment object

---

#### PATCH /tasks/:id/comments/:commentId
**Description:** Update comment

**Request:**
```json
{
  "content": "Updated comment"
}
```

**Response (200):** Updated Comment object

---

#### DELETE /tasks/:id/comments/:commentId
**Description:** Delete comment

**Response (204):** No content

---

#### POST /tasks/:id/dependencies
**Description:** Add task dependency

**Request:**
```json
{
  "dependsOnTaskId": "uuid",
  "type": "blocked_by"
}
```

**Response (201):** TaskDependency object

---

#### DELETE /tasks/:id/dependencies/:dependencyTaskId
**Description:** Remove task dependency

**Response (204):** No content

---

#### POST /tasks/:id/attachments
**Description:** Upload attachment

**Request:** multipart/form-data with file

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "filename": "screenshot.png",
    "url": "https://storage.../screenshot.png",
    "size": 245678,
    "mimeType": "image/png",
    "uploadedAt": "2024-01-20T10:00:00Z"
  }
}
```

---

#### DELETE /tasks/:id/attachments/:attachmentId
**Description:** Delete attachment

**Response (204):** No content

---

## 5. Bugs Module

### Data Types

```typescript
type BugStatus = 
  | 'new'
  | 'confirmed'
  | 'in_progress'
  | 'fixed'
  | 'verified'
  | 'closed'
  | 'reopened'
  | 'wont_fix'
  | 'duplicate';

type BugSeverity = 'low' | 'medium' | 'high' | 'critical';

interface Bug {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  status: BugStatus;
  severity: BugSeverity;
  priority: Priority;
  productId: string;
  productName: string;
  platform: Platform;
  featureId?: string;
  featureTitle?: string;
  sprintId?: string;
  sprintName?: string;
  reporterId: string;
  reporterName: string;
  assigneeId?: string;
  assigneeName?: string;
  environment: string;
  version?: string;
  browserInfo?: string;
  attachments: Attachment[];
  retestResults: BugRetestResult[];
  comments: Comment[];
  duplicateOf?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface BugRetestResult {
  id: string;
  status: 'passed' | 'failed';
  testedBy: string;
  testedByName: string;
  notes?: string;
  environment: string;
  testedAt: string;
}

interface BugStatistics {
  total: number;
  byStatus: Record<BugStatus, number>;
  bySeverity: Record<BugSeverity, number>;
  openBugs: number;
  closedBugs: number;
  averageResolutionTime: number; // in hours
  criticalOpen: number;
  resolutionRate: number; // percentage
}
```

### Endpoints

#### GET /bugs
**Description:** Get all bugs with filters

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | Filter by status (comma-separated) |
| severity | string | Filter by severity |
| priority | string | Filter by priority |
| productId | string | Filter by product |
| platform | string | Filter by platform |
| assigneeId | string | Filter by assignee |
| reporterId | string | Filter by reporter |
| sprintId | string | Filter by sprint |
| search | string | Search in title, description |

**Response (200):** PaginatedResponse<Bug>

---

#### GET /bugs/:id
**Description:** Get bug by ID

**Response (200):** Full Bug object

---

#### POST /bugs
**Description:** Report a new bug

**Request:**
```json
{
  "title": "Login button not working on mobile",
  "description": "Detailed bug description",
  "stepsToReproduce": "1. Open app\n2. Click login\n3. Button does nothing",
  "expectedBehavior": "Should navigate to login form",
  "actualBehavior": "Nothing happens",
  "severity": "high",
  "priority": "high",
  "productId": "uuid",
  "platform": "android",
  "environment": "production",
  "version": "2.1.0",
  "browserInfo": "Chrome Mobile 120"
}
```

**Validation:**
- `title`: Required, min 10 chars, max 200 chars
- `description`: Required, min 20 chars, max 5000 chars
- `stepsToReproduce`: Required, min 10 chars
- `severity`: Required, valid BugSeverity
- `productId`: Required, valid UUID

**Response (201):** Bug object

---

#### PATCH /bugs/:id
**Description:** Update bug

**Response (200):** Updated Bug object

---

#### DELETE /bugs/:id
**Description:** Delete bug

**Response (204):** No content

---

#### PATCH /bugs/:id/status
**Description:** Update bug status

**Request:**
```json
{
  "status": "in_progress"
}
```

**Response (200):** Updated Bug object

---

#### POST /bugs/:id/assign
**Description:** Assign bug to developer

**Request:**
```json
{
  "assigneeId": "uuid"
}
```

**Response (200):** Updated Bug object

---

#### DELETE /bugs/:id/assign
**Description:** Unassign bug

**Response (200):** Updated Bug object

---

#### POST /bugs/:id/link-feature
**Description:** Link bug to feature

**Request:**
```json
{
  "featureId": "uuid"
}
```

**Response (200):** Updated Bug object

---

#### DELETE /bugs/:id/link-feature
**Description:** Unlink bug from feature

**Response (200):** Updated Bug object

---

#### POST /bugs/:id/add-to-sprint
**Description:** Add bug to sprint

**Request:**
```json
{
  "sprintId": "uuid"
}
```

**Response (200):** Updated Bug object

---

#### DELETE /bugs/:id/remove-from-sprint
**Description:** Remove bug from sprint

**Response (200):** Updated Bug object

---

#### POST /bugs/:id/retest
**Description:** Add retest result

**Request:**
```json
{
  "status": "passed",
  "notes": "Tested on latest build, issue resolved",
  "environment": "staging"
}
```

**Response (201):** BugRetestResult object

---

#### GET /bugs/:id/retest
**Description:** Get retest history

**Response (200):** Array of BugRetestResult

---

#### GET /bugs/:id/comments
**Description:** Get bug comments

**Response (200):** Array of Comment

---

#### POST /bugs/:id/comments
**Description:** Add comment

**Request:**
```json
{
  "content": "Investigating this issue"
}
```

**Response (201):** Comment object

---

#### PATCH /bugs/:id/comments/:commentId
**Description:** Update comment

**Response (200):** Updated Comment

---

#### DELETE /bugs/:id/comments/:commentId
**Description:** Delete comment

**Response (204):** No content

---

#### POST /bugs/:id/attachments
**Description:** Upload attachment (multipart/form-data)

**Response (201):** Attachment object

---

#### DELETE /bugs/:id/attachments/:attachmentId
**Description:** Delete attachment

**Response (204):** No content

---

#### GET /bugs/statistics
**Description:** Get bug statistics

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| productId | string | Filter by product |
| dateFrom | string | Start date |
| dateTo | string | End date |

**Response (200):** BugStatistics object

---

## 6. Sprints Module

### Data Types

```typescript
type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';

interface Sprint {
  id: string;
  name: string;
  goal: string;
  productId: string;
  productName: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  taskIds: string[];
  bugIds: string[];
  capacity: number; // total estimated hours
  velocity?: number; // points/hours completed
  createdAt: string;
  updatedAt: string;
}

interface SprintMetrics {
  totalTasks: number;
  completedTasks: number;
  totalBugs: number;
  fixedBugs: number;
  totalPoints: number;
  completedPoints: number;
  burndownData: BurndownPoint[];
  velocityTrend: number[];
  blockedItems: number;
}

interface BurndownPoint {
  date: string;
  remaining: number;
  ideal: number;
}

interface SprintRetrospective {
  wentWell: string[];
  needsImprovement: string[];
  actionItems: string[];
  savedAt?: string;
  savedBy?: string;
}
```

### Endpoints

#### GET /sprints
**Description:** Get all sprints

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | Filter by status |
| productId | string | Filter by product |

**Response (200):** PaginatedResponse<Sprint>

---

#### GET /sprints/:id
**Description:** Get sprint by ID

**Response (200):** Sprint object

---

#### POST /sprints
**Description:** Create sprint

**Request:**
```json
{
  "name": "Sprint 10",
  "goal": "Complete authentication module",
  "productId": "uuid",
  "startDate": "2024-02-01",
  "endDate": "2024-02-14",
  "capacity": 160
}
```

**Validation:**
- `name`: Required, min 2 chars, max 100 chars
- `goal`: Required, min 10 chars, max 500 chars
- `startDate`: Required, valid date
- `endDate`: Required, must be after startDate
- `capacity`: Required, positive number

**Response (201):** Sprint object

---

#### PATCH /sprints/:id
**Description:** Update sprint

**Response (200):** Updated Sprint

---

#### DELETE /sprints/:id
**Description:** Delete sprint

**Response (204):** No content

---

#### POST /sprints/:id/start
**Description:** Start sprint

**Response (200):** Updated Sprint with status: active

---

#### POST /sprints/:id/complete
**Description:** Complete sprint

**Response (200):** Updated Sprint with status: completed

---

#### GET /sprints/:id/tasks
**Description:** Get tasks in sprint

**Response (200):** Array of Task

---

#### POST /sprints/:id/tasks
**Description:** Add task to sprint

**Request:**
```json
{
  "taskId": "uuid"
}
```

**Response (200):** Updated Sprint

---

#### DELETE /sprints/:id/tasks/:taskId
**Description:** Remove task from sprint

**Response (200):** Updated Sprint

---

#### GET /sprints/:id/bugs
**Description:** Get bugs in sprint

**Response (200):** Array of Bug

---

#### POST /sprints/:id/bugs
**Description:** Add bug to sprint

**Request:**
```json
{
  "bugId": "uuid"
}
```

**Response (200):** Updated Sprint

---

#### DELETE /sprints/:id/bugs/:bugId
**Description:** Remove bug from sprint

**Response (200):** Updated Sprint

---

#### GET /sprints/:id/metrics
**Description:** Get sprint metrics

**Response (200):** SprintMetrics object

---

#### GET /sprints/:id/retrospective
**Description:** Get sprint retrospective

**Response (200):** SprintRetrospective object

---

#### POST /sprints/:id/retrospective
**Description:** Save sprint retrospective

**Request:**
```json
{
  "wentWell": ["Good team communication", "Met sprint goal"],
  "needsImprovement": ["Code review process", "Testing coverage"],
  "actionItems": ["Set up automated testing", "Daily standups"]
}
```

**Response (200):** SprintRetrospective object

---

## 7. Releases Module

### Data Types

```typescript
type ReleaseStatus = 
  | 'planning'
  | 'in_development'
  | 'testing'
  | 'staged'
  | 'released'
  | 'rolled_back';

type PipelineStage = 
  | 'build'
  | 'unit_tests'
  | 'integration_tests'
  | 'security_scan'
  | 'staging_deploy'
  | 'production_deploy';

type PipelineStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

interface ExtendedRelease {
  id: string;
  version: string;
  buildId: string;
  productId: string;
  productName: string;
  platform: Platform;
  status: ReleaseStatus;
  releaseDate?: string;
  plannedDate?: string;
  features: LinkedFeature[];
  bugFixes: LinkedBugFix[];
  testCoverage: number;
  pipeline: PipelineStep[];
  rollbackLogs: RollbackLog[];
  releaseNotes: string;
  approvalStatus?: ApprovalStatus;
  approvers?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PipelineStep {
  stage: PipelineStage;
  status: PipelineStatus;
  startedAt?: string;
  completedAt?: string;
  logs?: string;
}

interface RollbackLog {
  id: string;
  version: string;
  reason: string;
  rolledBackAt: string;
  rolledBackBy: string;
  notes?: string;
}
```

### Endpoints

#### GET /releases
**Description:** Get all releases

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | Filter by status |
| productId | string | Filter by product |
| platform | string | Filter by platform |

**Response (200):** PaginatedResponse<ExtendedRelease>

---

#### GET /releases/:id
**Description:** Get release by ID

**Response (200):** ExtendedRelease object

---

#### POST /releases
**Description:** Create release

**Request:**
```json
{
  "version": "2.1.0",
  "buildId": "build-123",
  "productId": "uuid",
  "platform": "web",
  "plannedDate": "2024-02-15",
  "releaseNotes": "## New Features\n- OAuth login\n- Dark mode"
}
```

**Validation:**
- `version`: Required, semver format (x.y.z)
- `buildId`: Required, alphanumeric with dashes
- `productId`: Required, valid UUID
- `platform`: Required, valid Platform

**Response (201):** ExtendedRelease object

---

#### PATCH /releases/:id
**Description:** Update release

**Response (200):** Updated ExtendedRelease

---

#### DELETE /releases/:id
**Description:** Delete release

**Response (204):** No content

---

#### PATCH /releases/:id/status
**Description:** Update release status

**Request:**
```json
{
  "status": "testing"
}
```

**Response (200):** Updated ExtendedRelease

---

#### GET /releases/:id/pipeline
**Description:** Get pipeline status

**Response (200):** Array of PipelineStep

---

#### POST /releases/:id/pipeline/:stage/start
**Description:** Start pipeline stage

**Response (200):** Updated PipelineStep

---

#### POST /releases/:id/pipeline/:stage/complete
**Description:** Complete pipeline stage

**Request:**
```json
{
  "success": true,
  "notes": "All tests passed"
}
```

**Response (200):** Updated PipelineStep

---

#### POST /releases/:id/pipeline/:stage/retry
**Description:** Retry failed pipeline stage

**Response (200):** Updated PipelineStep

---

#### POST /releases/:id/deploy
**Description:** Deploy release

**Request:**
```json
{
  "environment": "production"
}
```

**Response (200):** Updated ExtendedRelease

---

#### POST /releases/:id/rollback
**Description:** Rollback release

**Request:**
```json
{
  "reason": "Critical bug discovered",
  "targetVersion": "2.0.5"
}
```

**Response (200):** Updated ExtendedRelease with rollback log

---

#### GET /releases/:id/rollbacks
**Description:** Get rollback history

**Response (200):** Array of RollbackLog

---

#### PATCH /releases/:id/notes
**Description:** Update release notes

**Request:**
```json
{
  "notes": "## Updated Release Notes\n..."
}
```

**Response (200):** Updated ExtendedRelease

---

#### POST /releases/:id/notes/generate
**Description:** Auto-generate release notes from linked features/bugs

**Response (200):**
```json
{
  "data": {
    "notes": "## Features\n- Feature 1\n- Feature 2\n\n## Bug Fixes\n- Bug 1"
  }
}
```

---

#### GET /releases/:id/notes/export
**Description:** Export release notes

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| format | string | markdown, html, or pdf |

**Response (200):**
```json
{
  "data": {
    "downloadUrl": "https://storage.../release-notes.pdf",
    "expiresAt": "2024-01-21T00:00:00Z"
  }
}
```

---

#### POST /releases/:id/features
**Description:** Link feature to release

**Request:**
```json
{
  "featureId": "uuid"
}
```

**Response (200):** Updated ExtendedRelease

---

#### DELETE /releases/:id/features/:featureId
**Description:** Unlink feature from release

**Response (200):** Updated ExtendedRelease

---

#### POST /releases/:id/bugs
**Description:** Link bug fix to release

**Request:**
```json
{
  "bugId": "uuid"
}
```

**Response (200):** Updated ExtendedRelease

---

#### DELETE /releases/:id/bugs/:bugId
**Description:** Unlink bug fix from release

**Response (200):** Updated ExtendedRelease

---

#### POST /releases/:id/approval/request
**Description:** Request release approval

**Request:**
```json
{
  "approvers": ["uuid1", "uuid2"]
}
```

**Response (200):** Updated ExtendedRelease

---

#### POST /releases/:id/approval/approve
**Description:** Approve release

**Request:**
```json
{
  "comment": "Looks good to ship"
}
```

**Response (200):** Updated ExtendedRelease

---

#### POST /releases/:id/approval/reject
**Description:** Reject release

**Request:**
```json
{
  "reason": "Missing test coverage"
}
```

**Response (200):** Updated ExtendedRelease

---

#### GET /releases/:id/approval
**Description:** Get approval status

**Response (200):**
```json
{
  "data": {
    "status": "pending",
    "approvers": [
      {
        "userId": "uuid",
        "userName": "John Manager",
        "status": "approved",
        "comment": "LGTM",
        "approvedAt": "2024-01-20T10:00:00Z"
      },
      {
        "userId": "uuid2",
        "userName": "Jane Lead",
        "status": "pending"
      }
    ]
  }
}
```

---

## 8. Team Module

### Data Types

```typescript
type TeamRole = 
  | 'business_owner'
  | 'product_owner'
  | 'technical_leader'
  | 'ui_ux_designer'
  | 'frontend_dev'
  | 'backend_dev'
  | 'mobile_android'
  | 'mobile_ios'
  | 'qa_tester'
  | 'project_manager';

type Permission = 
  | 'view_only'
  | 'edit'
  | 'approve'
  | 'delete'
  | 'manage_users';

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamRole;
  permissions: Permission[];
  skills: string[];
  workload: WorkloadItem[];
  availability: AvailabilitySlot[];
  status: 'active' | 'invited' | 'inactive';
  joinedAt: string;
  lastActive: string;
}

interface WorkloadItem {
  id: string;
  taskId: string;
  taskTitle: string;
  estimatedHours: number;
  dueDate: string;
  status: string;
}

interface AvailabilitySlot {
  id: string;
  date: string;
  status: 'available' | 'busy' | 'out_of_office';
  notes?: string;
}

interface TimeOffRequest {
  id: string;
  memberId: string;
  memberName: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  createdAt: string;
}

interface CalendarEvent {
  id: string;
  type: 'sprint' | 'release' | 'meeting' | 'timeoff';
  title: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  memberId?: string;
}
```

### Endpoints

#### GET /team
**Description:** Get all team members

**Response (200):** Array of TeamMember

---

#### GET /team/:id
**Description:** Get team member by ID

**Response (200):** TeamMember object

---

#### POST /team/invite
**Description:** Invite new team member

**Request:**
```json
{
  "email": "newmember@example.com",
  "name": "New Member",
  "role": "frontend_dev"
}
```

**Response (201):** TeamMember with status: invited

---

#### PATCH /team/:id
**Description:** Update team member

**Request:**
```json
{
  "role": "technical_leader",
  "skills": ["React", "TypeScript", "Node.js"]
}
```

**Response (200):** Updated TeamMember

---

#### DELETE /team/:id
**Description:** Remove team member

**Response (204):** No content

---

#### POST /team/invites/:id/resend
**Description:** Resend invitation email

**Response (200):**
```json
{
  "message": "Invitation resent"
}
```

---

#### DELETE /team/invites/:id
**Description:** Cancel pending invitation

**Response (204):** No content

---

#### GET /team/invites
**Description:** Get pending invitations

**Response (200):** Array of pending TeamMember

---

#### GET /team/:id/roles
**Description:** Get member's assigned roles

**Response (200):** Array of TeamRole

---

#### POST /team/:id/roles
**Description:** Assign role to member

**Request:**
```json
{
  "role": "qa_tester"
}
```

**Response (200):** Updated TeamMember

---

#### DELETE /team/:id/roles/:role
**Description:** Remove role from member

**Response (200):** Updated TeamMember

---

#### PATCH /team/:id/availability
**Description:** Update member availability

**Request:**
```json
{
  "availability": [
    {
      "date": "2024-02-01",
      "status": "available"
    },
    {
      "date": "2024-02-02",
      "status": "busy",
      "notes": "Training session"
    }
  ]
}
```

**Response (200):** Updated TeamMember

---

#### GET /team/:id/tasks
**Description:** Get tasks assigned to member

**Response (200):** Array of Task

---

#### GET /team/:id/bugs
**Description:** Get bugs assigned to member

**Response (200):** Array of Bug

---

#### GET /team/workload
**Description:** Get team workload distribution

**Response (200):**
```json
{
  "data": [
    {
      "memberId": "uuid",
      "memberName": "John Doe",
      "totalHours": 32,
      "capacity": 40,
      "utilizationPercent": 80,
      "taskCount": 5,
      "bugCount": 2
    }
  ]
}
```

---

#### GET /team/calendar
**Description:** Get team calendar events

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Start of date range |
| endDate | string | End of date range |

**Response (200):** Array of CalendarEvent

---

#### POST /team/:id/timeoff
**Description:** Request time off

**Request:**
```json
{
  "startDate": "2024-02-15",
  "endDate": "2024-02-20",
  "type": "vacation",
  "reason": "Family vacation"
}
```

**Response (201):** TimeOffRequest object

---

#### GET /team/timeoff
**Description:** Get all time off requests

**Response (200):** Array of TimeOffRequest

---

#### PATCH /team/:id/skills
**Description:** Update member skills

**Request:**
```json
{
  "skills": ["React", "TypeScript", "GraphQL", "AWS"]
}
```

**Response (200):** Updated TeamMember

---

#### GET /team/search
**Description:** Search team members by skills

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| skills | string | Comma-separated skill names |

**Response (200):** Array of matching TeamMember

---

## 9. Analytics Module

### Data Types

```typescript
interface AnalyticsOverview {
  totalFeatures: number;
  completedFeatures: number;
  totalBugs: number;
  resolvedBugs: number;
  totalTasks: number;
  completedTasks: number;
  activeSprintsCount: number;
  teamMembersCount: number;
  averageVelocity: number;
  averageBugResolutionTime: number;
}

interface VelocityDataPoint {
  sprintId: string;
  sprintName: string;
  planned: number;
  completed: number;
  date: string;
}

interface BurndownDataPoint {
  date: string;
  remaining: number;
  ideal: number;
  completed: number;
}

interface BugResolutionData {
  period: string;
  opened: number;
  resolved: number;
  averageTime: number;
}

interface FeatureCompletionData {
  period: string;
  completed: number;
  planned: number;
  completionRate: number;
}

interface ReleaseFrequencyData {
  period: string;
  releases: number;
  rollbacks: number;
}

interface TeamWorkloadData {
  memberId: string;
  memberName: string;
  tasksCount: number;
  bugsCount: number;
  hoursLogged: number;
  utilizationPercent: number;
}

interface TimeTrackingData {
  period: string;
  totalHours: number;
  billableHours: number;
  byProject: Record<string, number>;
}

interface ProductHealthData {
  productId: string;
  productName: string;
  healthScore: number;
  openBugs: number;
  criticalBugs: number;
  featuresInProgress: number;
  lastReleaseDate?: string;
}

interface TeamPerformanceData {
  memberId: string;
  memberName: string;
  tasksCompleted: number;
  bugsFixed: number;
  codeReviews: number;
  hoursLogged: number;
  onTimeDelivery: number;
}

interface ExportRequest {
  type: 'velocity' | 'burndown' | 'bugs' | 'features' | 'time' | 'team';
  format: 'csv' | 'xlsx' | 'pdf';
  startDate?: string;
  endDate?: string;
  filters?: Record<string, string>;
}
```

### Endpoints

#### GET /analytics/overview
**Description:** Get analytics overview

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Start date |
| endDate | string | End date |

**Response (200):** AnalyticsOverview object

---

#### GET /analytics/velocity
**Description:** Get velocity data

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Number of sprints |

**Response (200):** Array of VelocityDataPoint

---

#### GET /analytics/burndown/:sprintId
**Description:** Get sprint burndown data

**Response (200):** Array of BurndownDataPoint

---

#### GET /analytics/bugs/resolution
**Description:** Get bug resolution trends

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Start date |
| endDate | string | End date |
| productId | string | Filter by product |

**Response (200):** Array of BugResolutionData

---

#### GET /analytics/features/completion
**Description:** Get feature completion data

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Start date |
| endDate | string | End date |

**Response (200):** Array of FeatureCompletionData

---

#### GET /analytics/releases/frequency
**Description:** Get release frequency data

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Start date |
| endDate | string | End date |

**Response (200):** Array of ReleaseFrequencyData

---

#### GET /analytics/team/workload
**Description:** Get team workload distribution

**Response (200):** Array of TeamWorkloadData

---

#### GET /analytics/time-tracking
**Description:** Get time tracking data

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Start date |
| endDate | string | End date |
| userId | string | Filter by user |

**Response (200):** Array of TimeTrackingData

---

#### GET /analytics/products/health
**Description:** Get product health metrics

**Response (200):** Array of ProductHealthData

---

#### GET /analytics/team/performance
**Description:** Get team performance metrics

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | Filter by user |
| startDate | string | Start date |
| endDate | string | End date |

**Response (200):** Array of TeamPerformanceData

---

#### POST /analytics/export
**Description:** Export analytics data

**Request:**
```json
{
  "type": "velocity",
  "format": "xlsx",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response (200):**
```json
{
  "data": {
    "downloadUrl": "https://storage.../export.xlsx",
    "expiresAt": "2024-01-21T00:00:00Z"
  }
}
```

---

## 10. Settings Module

### Data Types

```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  weekStartsOn: 0 | 1 | 6;
  emailNotifications: boolean;
  pushNotifications: boolean;
  compactMode: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  title?: string;
  bio?: string;
}

interface NotificationPreferences {
  taskAssigned: boolean;
  taskCompleted: boolean;
  bugReported: boolean;
  bugResolved: boolean;
  featureApproved: boolean;
  releaseDeployed: boolean;
  sprintStarted: boolean;
  sprintCompleted: boolean;
  mentionedInComment: boolean;
  weeklyDigest: boolean;
}

interface TwoFactorSetup {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}
```

### Endpoints

#### GET /users/me/settings
**Description:** Get user settings

**Response (200):** UserSettings object

---

#### PATCH /users/me/settings
**Description:** Update user settings

**Request:**
```json
{
  "theme": "dark",
  "language": "en",
  "timezone": "America/New_York"
}
```

**Response (200):** Updated UserSettings

---

#### GET /users/me/profile
**Description:** Get user profile

**Response (200):** UserProfile object

---

#### PATCH /users/me/profile
**Description:** Update user profile

**Request:**
```json
{
  "name": "Updated Name",
  "title": "Senior Developer",
  "bio": "Passionate about clean code"
}
```

**Response (200):** Updated UserProfile

---

#### GET /users/me/notifications
**Description:** Get notification preferences

**Response (200):** NotificationPreferences object

---

#### PATCH /users/me/notifications
**Description:** Update notification preferences

**Request:**
```json
{
  "taskAssigned": true,
  "weeklyDigest": false
}
```

**Response (200):** Updated NotificationPreferences

---

#### POST /users/me/password
**Description:** Change password

**Request:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

#### POST /users/me/2fa/enable
**Description:** Enable 2FA

**Response (200):** TwoFactorSetup object

---

#### POST /users/me/2fa/verify
**Description:** Verify and complete 2FA setup

**Request:**
```json
{
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "2FA enabled successfully"
}
```

---

#### POST /users/me/2fa/disable
**Description:** Disable 2FA

**Request:**
```json
{
  "password": "currentPassword"
}
```

**Response (200):**
```json
{
  "message": "2FA disabled"
}
```

---

## 11. Dashboard Module

### Data Types

```typescript
interface DashboardStats {
  activeSprints: number;
  pendingTasks: number;
  openBugs: number;
  upcomingReleases: number;
  teamAvailability: {
    available: number;
    busy: number;
    away: number;
    offline: number;
  };
  recentActivity: {
    tasksCompletedToday: number;
    bugsFixedToday: number;
    featuresApprovedToday: number;
  };
}

interface ActivityItem {
  id: string;
  type: string;
  userId: string;
  userName: string;
  userAvatar: string;
  entityType: 'task' | 'bug' | 'feature' | 'sprint' | 'release';
  entityId: string;
  entityTitle: string;
  action: string;
  timestamp: string;
}

interface SprintSummary {
  id: string;
  name: string;
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
  daysRemaining: number;
  velocity: number;
  teamMembers: number;
}
```

### Endpoints

#### GET /dashboard/stats
**Description:** Get dashboard statistics

**Response (200):** DashboardStats object

---

#### GET /dashboard/activity
**Description:** Get recent activity feed

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page (default: 20) |
| type | string | Filter by entity type |

**Response (200):** PaginatedResponse<ActivityItem>

---

#### GET /dashboard/sprint-summary
**Description:** Get active sprint summaries

**Response (200):**
```json
{
  "data": {
    "activeSprints": [
      {
        "id": "uuid",
        "name": "Sprint 10",
        "progress": 65,
        "tasksTotal": 20,
        "tasksCompleted": 13,
        "daysRemaining": 5,
        "velocity": 42,
        "teamMembers": 6
      }
    ]
  }
}
```

---

## 12. Billing Module

### Data Types

```typescript
type PlanId = 'free' | 'pro' | 'team' | 'enterprise';
type BillingInterval = 'monthly' | 'yearly';
type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';
type PaymentStatus = 'paid' | 'pending' | 'failed';

interface Plan {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: PlanLimits;
  popular?: boolean;
}

interface PlanLimits {
  products: number;
  teamMembers: number;
  featuresPerMonth: number;
  storage: string;
  advancedAnalytics: boolean;
  customWorkflows: boolean;
  prioritySupport: boolean;
  sso: boolean;
  apiAccess: boolean;
}

interface Subscription {
  id: string;
  userId: string;
  workspaceId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: string;
}

interface Usage {
  products: number;
  teamMembers: number;
  features: number;
  storage: number;
}

interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string;
  invoiceUrl?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}
```

### Endpoints

#### GET /billing/plans
**Description:** Get available plans

**Response (200):** Array of Plan

---

#### GET /billing/subscription
**Description:** Get current subscription

**Response (200):** Subscription object

---

#### POST /billing/subscription
**Description:** Create/upgrade subscription

**Request:**
```json
{
  "planId": "pro",
  "interval": "yearly"
}
```

**Response (200):** Subscription object

---

#### PATCH /billing/subscription
**Description:** Update subscription

**Request:**
```json
{
  "planId": "team"
}
```

**Response (200):** Updated Subscription

---

#### DELETE /billing/subscription
**Description:** Cancel subscription

**Response (200):**
```json
{
  "message": "Subscription will be cancelled at period end"
}
```

---

#### GET /billing/usage
**Description:** Get current usage

**Response (200):** Usage object

---

#### GET /billing/invoices
**Description:** Get invoice history

**Response (200):** Array of Invoice

---

#### GET /billing/invoices/:id
**Description:** Get invoice details

**Response (200):** Invoice object

---

#### GET /billing/payment-methods
**Description:** Get saved payment methods

**Response (200):** Array of PaymentMethod

---

#### POST /billing/payment-methods
**Description:** Add payment method

**Request:**
```json
{
  "token": "stripe_payment_token"
}
```

**Response (201):** PaymentMethod object

---

#### DELETE /billing/payment-methods/:id
**Description:** Remove payment method

**Response (204):** No content

---

#### POST /billing/payment-methods/:id/default
**Description:** Set default payment method

**Response (200):** Updated PaymentMethod

---

## Common Types & Enums

### Platform
```typescript
type Platform = 'web' | 'android' | 'ios' | 'api' | 'desktop';
```

### Priority
```typescript
type Priority = 'low' | 'medium' | 'high' | 'critical';
```

### Attachment
```typescript
interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
}
```

### Pagination
```typescript
interface PaginationParams {
  page?: number;      // Default: 1
  limit?: number;     // Default: 20, Max: 100
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_INVALID_CREDENTIALS | 401 | Invalid email or password |
| AUTH_TOKEN_EXPIRED | 401 | Access token expired |
| AUTH_TOKEN_INVALID | 401 | Invalid or malformed token |
| AUTH_UNAUTHORIZED | 403 | Insufficient permissions |
| RESOURCE_NOT_FOUND | 404 | Resource does not exist |
| VALIDATION_ERROR | 400 | Request validation failed |
| DUPLICATE_RESOURCE | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Internal server error |

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "title": ["Title must be at least 5 characters"],
      "priority": ["Invalid priority value"]
    },
    "requestId": "req_abc123"
  }
}
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Users     │──────<│  Workspaces │>──────│  Products   │
└─────────────┘       └─────────────┘       └─────────────┘
      │                                           │
      │                                           │
      ▼                                           ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ TeamMembers │──────<│  Features   │>──────│   Sprints   │
└─────────────┘       └─────────────┘       └─────────────┘
                            │                     │
                            ▼                     │
                      ┌─────────────┐             │
                      │    Tasks    │<────────────┘
                      └─────────────┘
                            │
                            ▼
                      ┌─────────────┐
                      │    Bugs     │
                      └─────────────┘
                            │
                            ▼
                      ┌─────────────┐
                      │  Releases   │
                      └─────────────┘
```

### Core Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspaces
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  platforms VARCHAR(20)[] NOT NULL,
  owner_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Features
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  sprint_id UUID REFERENCES sprints(id),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'idea',
  priority VARCHAR(20) NOT NULL,
  platform VARCHAR(20) NOT NULL,
  requested_by UUID REFERENCES users(id),
  assignee_id UUID REFERENCES users(id),
  votes INTEGER DEFAULT 0,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- (Additional tables follow similar patterns)
```

---

## Rate Limiting

| Endpoint Category | Rate Limit |
|-------------------|------------|
| Authentication | 10 req/min |
| Read Operations | 1000 req/min |
| Write Operations | 100 req/min |
| File Uploads | 20 req/min |
| Exports | 10 req/hour |

---

## Changelog

### v1.0.0 (2024-12-08)
- Initial API specification
- Complete endpoint documentation for all 12 modules
- Data types and validation rules
- Error handling standards
- Database schema guidelines

---

**Document Owner:** DevCycle Backend Team  
**Review Cycle:** Monthly  
**Next Review:** 2025-01-08
