import { Injectable } from '@nestjs/common'
import { PaginatedData } from 'src/shared/types/response'

import { HuntRepository } from '../repositories/hunt.repository'
import { HuntUserInterface } from '../schemas/models/hunt-user.interface'
import {
  CreateHuntServiceDate,
  InterfaceHunt
} from '../schemas/models/hunt.interface'
import { HuntUsersService } from './hunt-users-collection.service'

@Injectable()
export class HuntService {
  constructor(
    private readonly huntRepository: HuntRepository,
    private readonly huntUsersService: HuntUsersService
  ) {}

  async createHunt(
    newHunt: CreateHuntServiceDate
  ): Promise<InterfaceHunt | undefined> {
    if (!newHunt.creatorId) {
      return undefined
    }

    const created = await this.huntRepository.createHunt(newHunt)

    if (created) {
      await this.huntUsersService.createRelationship(
        newHunt.creatorId,
        created.id
      )
    }
  }

  async getOneHuntById(id: string): Promise<InterfaceHunt | undefined> {
    if (!id) return undefined

    const hunt = await this.huntRepository.getOneHuntById(id)

    if (!hunt) return undefined
    return hunt
  }

  async updateHunt(
    id: string,
    data: Partial<InterfaceHunt>
  ): Promise<InterfaceHunt | undefined> {
    if (!id) return undefined

    return await this.huntRepository.updateHunt(id, data)
  }

  async deleteHunt(id: string): Promise<boolean> {
    if (!id) {
      return undefined
    }

    try {
      await this.huntRepository.deleteHunt(id)

      return true
    } catch (_err) {
      return false
    }
  }

  // hunt users
  async addParticipant(huntId) {
    const currentHunt = await this.getOneHuntById(huntId)

    await this.updateHunt(huntId, {
      participants: (currentHunt.participants ?? 0) + 1
    })
  }

  async removeParticipant(huntId) {
    const currentHunt = await this.getOneHuntById(huntId)

    await this.updateHunt(huntId, {
      participants: (currentHunt.participants ?? 0) - 1
    })
  }

  async findUserInHunt(userId: string, huntId: string) {
    return await this.huntUsersService.findSpecificRelationship(userId, huntId)
  }

  async addUserToHunt(userId: string, huntId: string) {
    const added = await this.huntUsersService.createRelationship(userId, huntId)

    if (added) {
      await this.addParticipant(huntId)
    }

    return added
  }

  async removeUserFromHunt(userId: string, huntId: string) {
    const added = await this.huntUsersService.deleteRelationship(userId, huntId)

    if (added) {
      await this.removeParticipant(huntId)
    }

    return added
  }

  async validateUserAccess(userId: string, huntId: string): Promise<boolean> {
    const isHuntUser = await this.huntUsersService.findSpecificRelationship(
      userId,
      huntId
    )

    return !!isHuntUser
  }

  async getAllUsersInHunt(huntId: string): Promise<HuntUserInterface[]> {
    const participants =
      await this.huntUsersService.getAllRelationshipsByHunt(huntId)

    return participants
  }

  async getAllHuntsByUser(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedData<InterfaceHunt> | undefined> {
    if (!userId) return undefined

    const relationships =
      await this.huntUsersService.getAllRelationshipsByUserPaginated(
        userId,
        page,
        limit
      )

    const hunts = await Promise.all(
      relationships.list.map((relation) =>
        this.huntRepository.getOneHuntById(relation.huntId)
      )
    )

    return { ...relationships, list: hunts }
  }

  async getAllActiveHuntsByUser(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedData<InterfaceHunt> | undefined> {
    if (!userId) return undefined

    const relationships =
      await this.huntUsersService.getAllRelationshipsByUser(userId)

    const activeHunts = await this.huntRepository.getActiveHunts(
      relationships.map((r) => r.huntId),
      page,
      limit
    )

    return activeHunts
  }

  // target property
  async addTargetToHunt(huntId: string, targetId: string): Promise<boolean> {
    if (!huntId) return undefined
    if (!targetId) return undefined

    try {
      await this.huntRepository.addTargetToHunt(huntId, targetId)

      return true
    } catch (_err) {
      return false
    }
  }

  async removeTargetFromHunt(
    huntId: string,
    targetId: string
  ): Promise<boolean> {
    if (!huntId) return undefined
    if (!targetId) return undefined

    try {
      await this.huntRepository.removeTargetFromHunt(huntId, targetId)

      return true
    } catch (_err) {
      return false
    }
  }
}
