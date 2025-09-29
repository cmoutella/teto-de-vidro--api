import { Injectable } from '@nestjs/common'

import { AccessLevelPoliciesRepository } from '../repositories/access-level-policies.repository'
import { AccessLevelPoliciesInterface } from '../schema/model/access-policies.interface'

@Injectable()
export class AccessLevelPoliciesService {
  constructor(
    private readonly accessLevelPoliciesRepository: AccessLevelPoliciesRepository
  ) {}

  async createAccessLevelPolicies(
    newAccessLevelPolicies: AccessLevelPoliciesInterface
  ): Promise<AccessLevelPoliciesInterface> {
    const alreadyExists =
      await this.accessLevelPoliciesRepository.getPoliciesByLevel(
        newAccessLevelPolicies.level
      )

    if (alreadyExists) return alreadyExists

    const createdAccessLevelPolicies =
      await this.accessLevelPoliciesRepository.createAccessLevelPolicies(
        newAccessLevelPolicies
      )

    return createdAccessLevelPolicies
  }

  async getByLevel(level: number) {
    const result =
      await this.accessLevelPoliciesRepository.getPoliciesByLevel(level)

    return result
  }

  async updateAccessLevelPolicies(
    level: number,
    data: Partial<AccessLevelPoliciesInterface>
  ): Promise<AccessLevelPoliciesInterface> {
    return await this.accessLevelPoliciesRepository.updateAccessLevelPolicies(
      level,
      data
    )
  }

  async deleteAccessLevelPolicies(level: number): Promise<boolean> {
    try {
      const del =
        await this.accessLevelPoliciesRepository.deleteAccessLevelPolicies(
          level
        )

      return del
    } catch {
      return false
    }
  }
}
