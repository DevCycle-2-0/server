import { ValueObject } from "@shared/domain/ValueObject";
import { Result } from "@shared/application/Result";

export type AppRoleType = "admin" | "moderator" | "user";

interface AppRoleProps {
  value: AppRoleType;
}

export class AppRole extends ValueObject<AppRoleProps> {
  private constructor(props: AppRoleProps) {
    super(props);
  }

  get value(): AppRoleType {
    return this.props.value;
  }

  private static validRoles: AppRoleType[] = ["admin", "moderator", "user"];

  public static create(role: string): Result<AppRole> {
    if (!this.validRoles.includes(role as AppRoleType)) {
      return Result.fail<AppRole>("Invalid app role");
    }
    return Result.ok<AppRole>(new AppRole({ value: role as AppRoleType }));
  }

  public isAdmin(): boolean {
    return this.props.value === "admin";
  }

  public isModerator(): boolean {
    return this.props.value === "moderator";
  }

  public isUser(): boolean {
    return this.props.value === "user";
  }

  public canManageUsers(): boolean {
    return this.isAdmin();
  }

  public canManageProducts(): boolean {
    return this.isAdmin() || this.isModerator();
  }

  public canDeleteProducts(): boolean {
    return this.isAdmin();
  }
}
