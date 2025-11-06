import { Injectable } from '@nestjs/common'
import { PaginatedData } from 'src/shared/types/response'

import { HuntUsersRepository } from '../repositories/hunt-users.repository'
import { HuntRepository } from '../repositories/hunt.repository'
import { HuntUserInterface } from '../schemas/models/hunt-user.interface'

@Injectable()
export class HuntUsersService {
  constructor(
    private readonly huntRepository: HuntRepository,
    private readonly huntUsersRepository: HuntUsersRepository
  ) {}

  async createRelationship(
    huntId: string,
    userId: string
  ): Promise<HuntUserInterface | undefined> {
    try {
      const alreadyInHunt = await this.huntUsersRepository.findRelationship(
        userId,
        huntId
      )

      if (alreadyInHunt) {
        return
      }

      const created = await this.huntUsersRepository.createRelationship(
        huntId,
        userId
      )

      return created
    } catch {
      console.log('ERROR @ hunt users service - creating relationship')
    }
  }

  async findSpecificRelationship(huntId: string, userId: string) {
    const found = await this.huntUsersRepository.findRelationship(
      userId,
      huntId
    )

    if (!found) {
      return
    }

    return found
  }

  async getAllRelationshipsByHunt(
    huntId: string
  ): Promise<HuntUserInterface[] | undefined> {
    if (!huntId) return undefined

    return await this.huntUsersRepository.getRelationshipsByHunt(huntId)
  }

  async getAllRelationshipsByHuntPaginated(
    huntId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedData<HuntUserInterface> | undefined> {
    if (!huntId) return undefined

    return await this.huntUsersRepository.getRelationshipsByHuntPaginated(
      huntId,
      page,
      limit
    )
  }

  async getAllRelationshipsByUser(
    userId: string
  ): Promise<HuntUserInterface[] | undefined> {
    if (!userId) return undefined

    return await this.huntUsersRepository.getRelationshipsByUser(userId)
  }

  async getAllRelationshipsByUserPaginated(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedData<HuntUserInterface> | undefined> {
    if (!userId) return undefined

    return await this.huntUsersRepository.getRelationshipsByUserPaginated(
      userId,
      page,
      limit
    )
  }

  async deleteRelationship(huntId: string, userId: string): Promise<boolean> {
    try {
      const deleted = await this.huntUsersRepository.deleteRelationship(
        huntId,
        userId
      )

      return deleted
    } catch (_err) {
      return false
    }
  }
}
