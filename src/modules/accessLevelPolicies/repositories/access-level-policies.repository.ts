import type { AccessLevelPoliciesInterface } from '../schema/model/access-policies.interface'

export abstract class AccessLevelPoliciesRepository {
  abstract createAccessLevelPolicies(
    newAccessLevelPolicies: AccessLevelPoliciesInterface
  ): Promise<AccessLevelPoliciesInterface>

  abstract getPoliciesByLevel(
    level: number
  ): Promise<AccessLevelPoliciesInterface>

  abstract updateAccessLevelPolicies(
    level: number,
    data: Partial<AccessLevelPoliciesInterface>
  ): Promise<AccessLevelPoliciesInterface>

  abstract deleteAccessLevelPolicies(level: number): Promise<boolean>
}
