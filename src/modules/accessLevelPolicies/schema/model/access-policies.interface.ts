export interface LimitPolicies {
  invitationsLimit: number
  activeHuntsLimit: number
  targetsPerHuntLimit: number
}

export interface AccessLevelPoliciesInterface extends LimitPolicies {
  level: number

  createdAt: string
  updatedAt: string
}
