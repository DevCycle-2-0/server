import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';

interface WorkspaceSettings {
  timezone: string;
  dateFormat: string;
  weekStartsOn: number;
  defaultSprintDuration: number;
}

interface WorkspaceProps {
  name: string;
  slug: string;
  ownerId: string;
  settings: WorkspaceSettings;
}

export class Workspace extends BaseEntity<WorkspaceProps> {
  private constructor(
    id: string,
    private props: WorkspaceProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(name: string, ownerId: string, id?: string): Workspace {
    if (!name || name.trim().length < 3) {
      throw new ValidationError('Workspace name must be at least 3 characters long');
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return new Workspace(id || crypto.randomUUID(), {
      name: name.trim(),
      slug,
      ownerId,
      settings: {
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        weekStartsOn: 1,
        defaultSprintDuration: 14,
      },
    });
  }

  static reconstitute(
    id: string,
    name: string,
    slug: string,
    ownerId: string,
    settings: WorkspaceSettings,
    createdAt: Date,
    updatedAt: Date
  ): Workspace {
    return new Workspace(id, { name, slug, ownerId, settings }, createdAt, updatedAt);
  }

  updateName(name: string): void {
    if (!name || name.trim().length < 3) {
      throw new ValidationError('Workspace name must be at least 3 characters long');
    }
    this.props.name = name.trim();
    this.touch();
  }

  updateSettings(settings: Partial<WorkspaceSettings>): void {
    this.props.settings = { ...this.props.settings, ...settings };
    this.touch();
  }

  // Getters
  get name(): string {
    return this.props.name;
  }
  get slug(): string {
    return this.props.slug;
  }
  get ownerId(): string {
    return this.props.ownerId;
  }
  get settings(): WorkspaceSettings {
    return { ...this.props.settings };
  }
}
