import { BaseEntity } from './BaseEntity';
import { ValidationError } from '@core/shared/errors/DomainError';

export enum ReleaseStatus {
  PLANNING = 'planning',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production',
  ROLLED_BACK = 'rolled_back',
}

interface ReleaseProps {
  workspaceId: string;
  productId: string;
  version: string;
  name: string;
  description?: string;
  status: ReleaseStatus;
  releaseNotes?: string;
  targetDate?: Date;
  releaseDate?: Date;
  createdBy: string;
}

export class Release extends BaseEntity<ReleaseProps> {
  private constructor(
    id: string,
    private props: ReleaseProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(
    workspaceId: string,
    productId: string,
    version: string,
    name: string,
    createdBy: string,
    description?: string,
    id?: string
  ): Release {
    if (!version || !this.isValidSemver(version)) {
      throw new ValidationError('Invalid semantic version format (e.g., 1.0.0)');
    }

    if (!name || name.trim().length < 2) {
      throw new ValidationError('Release name must be at least 2 characters long');
    }

    return new Release(id || crypto.randomUUID(), {
      workspaceId,
      productId,
      version: version.trim(),
      name: name.trim(),
      description: description?.trim(),
      status: ReleaseStatus.PLANNING,
      createdBy,
    });
  }

  static reconstitute(
    id: string,
    workspaceId: string,
    productId: string,
    version: string,
    name: string,
    description: string | null,
    status: ReleaseStatus,
    releaseNotes: string | null,
    targetDate: Date | null,
    releaseDate: Date | null,
    createdBy: string,
    createdAt: Date,
    updatedAt: Date
  ): Release {
    return new Release(
      id,
      {
        workspaceId,
        productId,
        version,
        name,
        description: description || undefined,
        status,
        releaseNotes: releaseNotes || undefined,
        targetDate: targetDate || undefined,
        releaseDate: releaseDate || undefined,
        createdBy,
      },
      createdAt,
      updatedAt
    );
  }

  private static isValidSemver(version: string): boolean {
    const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/;
    return semverRegex.test(version);
  }

  update(data: {
    name?: string;
    description?: string;
    releaseNotes?: string;
    targetDate?: Date;
  }): void {
    if (this.props.status === ReleaseStatus.PRODUCTION) {
      throw new ValidationError('Cannot update a released version');
    }

    if (data.name) {
      if (data.name.trim().length < 2) {
        throw new ValidationError('Release name must be at least 2 characters long');
      }
      this.props.name = data.name.trim();
    }

    if (data.description !== undefined) {
      this.props.description = data.description.trim() || undefined;
    }

    if (data.releaseNotes !== undefined) {
      this.props.releaseNotes = data.releaseNotes.trim() || undefined;
    }

    if (data.targetDate !== undefined) {
      this.props.targetDate = data.targetDate;
    }

    this.touch();
  }

  changeStatus(status: ReleaseStatus): void {
    if (!Object.values(ReleaseStatus).includes(status)) {
      throw new ValidationError(`Invalid release status: ${status}`);
    }

    // Validate status transitions
    if (this.props.status === ReleaseStatus.PRODUCTION && status !== ReleaseStatus.ROLLED_BACK) {
      throw new ValidationError('Production releases can only be rolled back');
    }

    this.props.status = status;

    if (status === ReleaseStatus.PRODUCTION) {
      this.props.releaseDate = new Date();
    }

    this.touch();
  }

  deploy(): void {
    if (this.props.status === ReleaseStatus.PRODUCTION) {
      throw new ValidationError('Release is already deployed');
    }

    this.props.status = ReleaseStatus.PRODUCTION;
    this.props.releaseDate = new Date();
    this.touch();
  }

  rollback(): void {
    if (this.props.status !== ReleaseStatus.PRODUCTION) {
      throw new ValidationError('Only production releases can be rolled back');
    }

    this.props.status = ReleaseStatus.ROLLED_BACK;
    this.touch();
  }

  // Getters
  get workspaceId(): string {
    return this.props.workspaceId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get version(): string {
    return this.props.version;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get status(): ReleaseStatus {
    return this.props.status;
  }

  get releaseNotes(): string | undefined {
    return this.props.releaseNotes;
  }

  get targetDate(): Date | undefined {
    return this.props.targetDate;
  }

  get releaseDate(): Date | undefined {
    return this.props.releaseDate;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  isReleased(): boolean {
    return this.props.status === ReleaseStatus.PRODUCTION;
  }

  isRolledBack(): boolean {
    return this.props.status === ReleaseStatus.ROLLED_BACK;
  }
}
