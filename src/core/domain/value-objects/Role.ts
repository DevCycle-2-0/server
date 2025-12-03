export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  PRODUCT_MANAGER = 'product_manager',
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  QA = 'qa',
  VIEWER = 'viewer',
}

export class Role {
  private constructor(private readonly value: UserRole) {}

  static create(role: string): Role {
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new ValidationError(`Invalid role: ${role}`);
    }
    return new Role(role as UserRole);
  }

  getValue(): UserRole {
    return this.value;
  }

  hasPermission(permission: string): boolean {
    const permissions: Record<UserRole, string[]> = {
      [UserRole.OWNER]: ['*'],
      [UserRole.ADMIN]: ['products:*', 'features:*', 'sprints:*', 'tasks:*', 'bugs:*', 'team:*'],
      [UserRole.PRODUCT_MANAGER]: [
        'features:read',
        'features:create',
        'features:update',
        'sprints:*',
        'products:read',
      ],
      [UserRole.DEVELOPER]: ['tasks:*', 'bugs:*', 'features:read'],
      [UserRole.DESIGNER]: ['features:read', 'tasks:read', 'tasks:update'],
      [UserRole.QA]: ['bugs:*', 'tasks:read'],
      [UserRole.VIEWER]: ['*:read'],
    };

    const rolePermissions = permissions[this.value];
    return (
      rolePermissions.includes('*') ||
      rolePermissions.includes(permission) ||
      rolePermissions.includes(permission.split(':')[0] + ':*')
    );
  }
}
