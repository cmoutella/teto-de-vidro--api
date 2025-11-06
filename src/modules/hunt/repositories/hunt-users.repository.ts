import type { PaginatedData } from 'src/shared/types/response'

import type { HuntUserInterface } from '../schemas/models/hunt-user.interface'

export abstract class HuntUsersRepository {
  abstract createRelationship(
    userId: string,
    huntId: string
  ): Promise<HuntUserInterface>

  abstract findRelationship(
    userId: string,
    huntId: string
  ): Promise<HuntUserInterface>

  abstract getRelationshipsByHunt(huntId: string): Promise<HuntUserInterface[]>

  abstract getRelationshipsByHuntPaginated(
    huntId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedData<HuntUserInterface>>

  abstract getRelationshipsByUser(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedData<HuntUserInterface>>

  abstract deleteRelationship(huntId: string, userId: string): Promise<boolean>
}
