import { Subscription } from "../entities/Subscription";

export interface ISubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByUserId(userId: string): Promise<Subscription | null>;
  findByWorkspaceId(workspaceId: string): Promise<Subscription | null>;
  save(subscription: Subscription): Promise<Subscription>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
