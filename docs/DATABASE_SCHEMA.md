# TaskFlow Database Schema

**Database**: PostgreSQL 15+  
**Extensions**: `uuid-ossp`, `pgcrypto`

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │───────│   workspaces    │───────│    products     │
└─────────────────┘       └─────────────────┘       └─────────────────┘
        │                         │                         │
        │                         │                         │
        ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   user_roles    │       │ workspace_members│       │    features     │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                                            │
                                  ┌─────────────────────────┼─────────────────────────┐
                                  │                         │                         │
                                  ▼                         ▼                         ▼
                          ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
                          │     sprints     │       │      tasks      │       │      bugs       │
                          └─────────────────┘       └─────────────────┘       └─────────────────┘
                                  │                         │
                                  │                         │
                                  ▼                         ▼
                          ┌─────────────────┐       ┌─────────────────┐
                          │    releases     │       │    time_logs    │
                          └─────────────────┘       └─────────────────┘
```

---

## Enums

```sql
-- User roles for RBAC
CREATE TYPE app_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer');

-- Feature lifecycle stages
CREATE TYPE feature_stage AS ENUM (
  'idea', 'discovery', 'planning', 'design', 
  'development', 'testing', 'release', 'live'
);

-- Priority levels
CREATE TYPE priority_level AS ENUM ('critical', 'high', 'medium', 'low');

-- Task/Bug status
CREATE TYPE item_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done', 'cancelled');

-- Sprint status
CREATE TYPE sprint_status AS ENUM ('planning', 'active', 'completed', 'cancelled');

-- Release status
CREATE TYPE release_status AS ENUM ('draft', 'planned', 'in_progress', 'staged', 'released', 'rolled_back');

-- Bug severity
CREATE TYPE bug_severity AS ENUM ('critical', 'major', 'minor', 'trivial');

-- Subscription plans
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'professional', 'enterprise');

-- Invite status
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
```

---

## Core Tables

### users

Extends Supabase `auth.users`. Stores user profile information.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### user_roles

Stores user roles separately for security (prevents privilege escalation).

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
```

---

## Workspaces

### workspaces

Multi-tenant workspace container.

```sql
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  subscription_plan subscription_plan DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);

-- RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view workspace" ON workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = id AND user_id = auth.uid()
    )
  );
```

### workspace_members

Join table for workspace membership.

```sql
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Indexes
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- RLS
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view other members" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_id AND wm.user_id = auth.uid()
    )
  );
```

### workspace_invites

Pending invitations to workspaces.

```sql
CREATE TABLE public.workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status invite_status DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, email)
);

-- Indexes
CREATE INDEX idx_workspace_invites_token ON workspace_invites(token);
CREATE INDEX idx_workspace_invites_email ON workspace_invites(email);
```

---

## Products

### products

Product container for features, sprints, and releases.

```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  color TEXT DEFAULT '#6366F1',
  status TEXT DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_workspace ON products(workspace_id);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view products" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = products.workspace_id AND user_id = auth.uid()
    )
  );
```

---

## Features

### features

Feature requests with lifecycle tracking.

```sql
CREATE TABLE public.features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  stage feature_stage DEFAULT 'idea',
  priority priority_level DEFAULT 'medium',
  status item_status DEFAULT 'backlog',
  votes INTEGER DEFAULT 0,
  story_points INTEGER,
  target_release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_features_workspace ON features(workspace_id);
CREATE INDEX idx_features_product ON features(product_id);
CREATE INDEX idx_features_sprint ON features(sprint_id);
CREATE INDEX idx_features_stage ON features(stage);
CREATE INDEX idx_features_assignee ON features(assignee_id);

-- RLS
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can manage features" ON features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = features.workspace_id AND user_id = auth.uid()
    )
  );
```

### feature_votes

Track user votes on features.

```sql
CREATE TABLE public.feature_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feature_id, user_id)
);

-- Indexes
CREATE INDEX idx_feature_votes_feature ON feature_votes(feature_id);
```

---

## Sprints

### sprints

Sprint planning and tracking.

```sql
CREATE TABLE public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  goal TEXT,
  status sprint_status DEFAULT 'planning',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  capacity_points INTEGER,
  completed_points INTEGER DEFAULT 0,
  velocity DECIMAL(5,2),
  retrospective JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Indexes
CREATE INDEX idx_sprints_workspace ON sprints(workspace_id);
CREATE INDEX idx_sprints_product ON sprints(product_id);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_sprints_dates ON sprints(start_date, end_date);

-- RLS
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can manage sprints" ON sprints
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = sprints.workspace_id AND user_id = auth.uid()
    )
  );
```

---

## Tasks

### tasks

Individual work items.

```sql
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  feature_id UUID REFERENCES features(id) ON DELETE SET NULL,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'task', -- task, subtask, story, epic
  status item_status DEFAULT 'todo',
  priority priority_level DEFAULT 'medium',
  story_points INTEGER,
  estimated_hours DECIMAL(5,2),
  logged_hours DECIMAL(5,2) DEFAULT 0,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_feature ON tasks(feature_id);
CREATE INDEX idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can manage tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = tasks.workspace_id AND user_id = auth.uid()
    )
  );
```

### time_logs

Time tracking for tasks.

```sql
CREATE TABLE public.time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hours DECIMAL(5,2) NOT NULL,
  description TEXT,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_time_logs_task ON time_logs(task_id);
CREATE INDEX idx_time_logs_user ON time_logs(user_id);
CREATE INDEX idx_time_logs_date ON time_logs(logged_date);

-- Trigger to update task logged_hours
CREATE OR REPLACE FUNCTION update_task_logged_hours()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tasks 
  SET logged_hours = (
    SELECT COALESCE(SUM(hours), 0) 
    FROM time_logs 
    WHERE task_id = NEW.task_id
  )
  WHERE id = NEW.task_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER time_log_update_task
  AFTER INSERT OR UPDATE OR DELETE ON time_logs
  FOR EACH ROW EXECUTE FUNCTION update_task_logged_hours();
```

---

## Bugs

### bugs

Bug tracking and resolution.

```sql
CREATE TABLE public.bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  feature_id UUID REFERENCES features(id) ON DELETE SET NULL,
  sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  environment JSONB, -- { browser, os, version, etc. }
  severity bug_severity DEFAULT 'minor',
  priority priority_level DEFAULT 'medium',
  status item_status DEFAULT 'todo',
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bugs_workspace ON bugs(workspace_id);
CREATE INDEX idx_bugs_product ON bugs(product_id);
CREATE INDEX idx_bugs_status ON bugs(status);
CREATE INDEX idx_bugs_severity ON bugs(severity);
CREATE INDEX idx_bugs_assignee ON bugs(assignee_id);

-- RLS
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can manage bugs" ON bugs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = bugs.workspace_id AND user_id = auth.uid()
    )
  );
```

---

## Releases

### releases

Release management and deployment tracking.

```sql
CREATE TABLE public.releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  version TEXT NOT NULL,
  name TEXT,
  description TEXT,
  release_notes TEXT,
  status release_status DEFAULT 'draft',
  release_type TEXT DEFAULT 'minor', -- major, minor, patch, hotfix
  target_date DATE,
  released_at TIMESTAMPTZ,
  released_by UUID REFERENCES auth.users(id),
  rollback_reason TEXT,
  rolled_back_at TIMESTAMPTZ,
  pipeline_config JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_releases_workspace ON releases(workspace_id);
CREATE INDEX idx_releases_product ON releases(product_id);
CREATE INDEX idx_releases_status ON releases(status);

-- RLS
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can manage releases" ON releases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = releases.workspace_id AND user_id = auth.uid()
    )
  );
```

### release_features

Features included in a release.

```sql
CREATE TABLE public.release_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(release_id, feature_id)
);
```

---

## Comments

### comments

Unified comments for features, tasks, bugs.

```sql
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'feature', 'task', 'bug', 'release'
  entity_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can manage comments" ON comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = comments.workspace_id AND user_id = auth.uid()
    )
  );
```

---

## Activity & Notifications

### activity_logs

Audit trail for all changes.

```sql
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- created, updated, deleted, status_changed, etc.
  changes JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_workspace ON activity_logs(workspace_id);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);
```

### notifications

User notifications.

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  entity_type TEXT,
  entity_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;
```

---

## User Settings

### user_settings

User preferences and settings.

```sql
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'system', -- light, dark, system
  language TEXT DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "push": true,
    "desktop": true,
    "digest": "daily"
  }',
  display_preferences JSONB DEFAULT '{
    "compactMode": false,
    "showAvatars": true,
    "dateFormat": "MMM dd, yyyy"
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);
```

---

## Billing

### invoices

Billing history.

```sql
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- paid, pending, failed
  period_start DATE,
  period_end DATE,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoices_workspace ON invoices(workspace_id);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);
```

---

## Triggers & Functions

### Auto-update timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_features_updated_at
  BEFORE UPDATE ON features FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bugs_updated_at
  BEFORE UPDATE ON bugs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_releases_updated_at
  BEFORE UPDATE ON releases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Create profile on signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default member role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
