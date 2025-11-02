import type { LimitPolicies } from '../../schema/model/access-policies.interface'

export const mockAccessLevelPolicy: LimitPolicies = {
  activeHuntsLimit: 3,
  targetsPerHuntLimit: 10,
  invitationsLimit: 3
}
