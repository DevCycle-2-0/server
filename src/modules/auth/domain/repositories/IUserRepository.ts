import { User } from "../entities/User";
import { Email } from "../value-objects/Email";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}

// src/modules/auth/domain/repositories/IWorkspaceRepository.ts
import { Workspace } from "../entities/Workspace";

export interface IWorkspaceRepository {
  findById(id: string): Promise<Workspace | null>;
  findBySlug(slug: string): Promise<Workspace | null>;
  save(workspace: Workspace): Promise<Workspace>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
