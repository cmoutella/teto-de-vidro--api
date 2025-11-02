import type { LimitPolicies } from '@src/modules/accessLevelPolicies/schema/model/access-policies.interface'

import type { InterfaceUserLimits } from '../schemas/models/user-limits.interface'

export abstract class UserLimitsRepository {
  abstract createUserLimits(
    userId: string,
    limits: LimitPolicies
  ): Promise<InterfaceUserLimits>

  abstract getByUser(id: string): Promise<InterfaceUserLimits>

  abstract updateByUserId(
    userId: string,
    updateData: Partial<LimitPolicies>
  ): Promise<InterfaceUserLimits>

  abstract deleteUserLimits(userId: string): Promise<boolean>
}
