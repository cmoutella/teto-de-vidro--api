import type { PaginatedData } from 'src/shared/types/response'

import type {
  CreateHuntServiceDate,
  InterfaceHunt
} from '../schemas/models/hunt.interface'

export abstract class HuntRepository {
  abstract getAllHuntsByUser(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedData<InterfaceHunt>>

  abstract getActiveHunts(
    ids: string[],
    page?: number,
    limit?: number
  ): Promise<PaginatedData<InterfaceHunt>>

  abstract getOneHuntById(id: string): Promise<InterfaceHunt>
  abstract getActiveHuntById(id: string): Promise<InterfaceHunt>

  abstract createHunt(
    newHunt: CreateHuntServiceDate
  ): Promise<InterfaceHunt | null>

  abstract updateHunt(
    id: string,
    data: Partial<InterfaceHunt>
  ): Promise<InterfaceHunt>

  abstract addTargetToHunt(huntId: string, targetId: string): Promise<void>

  abstract removeTargetFromHunt(huntId: string, targetId: string): Promise<void>

  abstract deleteHunt(id: string): Promise<void>
}
