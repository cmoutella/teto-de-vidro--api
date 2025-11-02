import type { LimitPolicies } from '@src/modules/accessLevelPolicies/schema/model/access-policies.interface'

export interface InterfaceUserLimits extends LimitPolicies {
  // identify user
  userId: string

  // history
  createdAt: string
  updatedAt: string
}
