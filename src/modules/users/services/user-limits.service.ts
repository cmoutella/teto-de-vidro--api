import { Injectable } from '@nestjs/common'
import { LimitPolicies } from '@src/modules/accessLevelPolicies/schema/model/access-policies.interface'

import { UserLimitsRepository } from '../repositories/user-limits.repository'

@Injectable()
export class UserLimitsService {
  constructor(private readonly userLimitsRepository: UserLimitsRepository) {}

  async createUserLimits(userId: string, limits: LimitPolicies) {
    try {
      const createdLimits = await this.userLimitsRepository.createUserLimits(
        userId,
        limits
      )

      return createdLimits
    } catch {
      console.error('ERROR creating user limits', userId)
    }
  }

  async updateUserLimits(userId, newData: Partial<LimitPolicies>) {
    try {
      const updatedUser = await this.userLimitsRepository.updateByUserId(
        userId,
        newData
      )

      return updatedUser
    } catch {
      console.error('ERROR updating user limits', userId)
    }
  }

  async minusOneInvitation(userId: string) {
    try {
      const currentLimits = await this.userLimitsRepository.getByUser(userId)

      if (!currentLimits) return

      const newLimits = await this.updateUserLimits(userId, {
        invitationsLimit: currentLimits.invitationsLimit - 1
      })

      return newLimits
    } catch {
      console.error('ERROR updating user limits', userId)
    }
  }

  async getByUser(userId: string) {
    try {
      const foundLimits = await this.userLimitsRepository.getByUser(userId)

      if (!foundLimits) {
        return
      }

      const {
        userId: _userId,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...limits
      } = foundLimits

      return limits
    } catch {
      console.error('ERROR searching by user limits', userId)
    }
  }

  async deleteUserLimits(userId: string) {
    try {
      const deleted = await this.userLimitsRepository.deleteUserLimits(userId)

      return deleted
    } catch {
      console.error('ERROR deleting user limits', userId)
    }
  }
}
