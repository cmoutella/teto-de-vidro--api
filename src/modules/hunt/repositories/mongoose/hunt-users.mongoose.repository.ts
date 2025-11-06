import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DEFAULT_LIMIT } from 'src/shared/const/pagination'
import { LeanDoc } from 'src/shared/types/mongoose'
import { PaginatedData } from 'src/shared/types/response'

import { HuntUser } from '../../schemas/hunt-user.schema'
import { HuntUserInterface } from '../../schemas/models/hunt-user.interface'
import { HuntUsersRepository } from '../hunt-users.repository'

export class HuntUsersMongooseRepository implements HuntUsersRepository {
  constructor(
    @InjectModel(HuntUser.name) private huntUserModel: Model<HuntUser>
  ) {}

  async createRelationship(
    huntId: string,
    userId: string
  ): Promise<HuntUserInterface | null> {
    const now = new Date().toISOString()
    const createHunt = new this.huntUserModel({
      huntId: huntId,
      userId: userId,
      createdAt: now
    })

    await createHunt.save()

    const created = await this.huntUserModel
      .findById(createHunt._id)
      .lean<LeanDoc<HuntUserInterface>>()
      .exec()

    const { _id, __v, ...data } = created

    return { id: _id.toString(), ...data } as HuntUserInterface
  }

  async findRelationship(huntId: string, userId: string) {
    const relationship = await this.huntUserModel
      .findOne({ huntId: huntId, userId: userId })
      .exec()

    const { _id, __v, ...data } = relationship

    return { id: _id.toString(), ...data }
  }

  async getRelationshipsByHunt(huntId: string): Promise<HuntUserInterface[]> {
    const foundRelationships = await this.huntUserModel
      .find({ huntId: huntId })
      .lean<LeanDoc<HuntUserInterface>[]>()
      .exec()

    const result: HuntUserInterface[] = foundRelationships.map((hunt) => {
      const { _id, __v, ...otherData } = hunt

      return { id: _id.toString(), ...otherData }
    })

    return result
  }

  async getRelationshipsByHuntPaginated(
    huntId: string,
    page = 1,
    limit = DEFAULT_LIMIT
  ): Promise<PaginatedData<HuntUserInterface>> {
    const offset = (page - 1) * limit

    const foundRelationships = await this.huntUserModel
      .find({ huntId: huntId })
      .skip(offset)
      .limit(limit)
      .lean<LeanDoc<HuntUserInterface>[]>()
      .exec()

    const totalItems = await this.huntUserModel.countDocuments({
      huntId: huntId
    })

    const totalPages = Math.ceil(totalItems / limit)

    const result: PaginatedData<HuntUserInterface> = {
      list: foundRelationships.map((hunt) => {
        const { _id, __v, ...otherData } = hunt

        return { id: _id.toString(), ...otherData }
      }),
      totalItems,
      totalPages,
      currentPage: page,
      perPage: limit
    }

    return result
  }

  async getRelationshipsByUser(userId: string): Promise<HuntUserInterface[]> {
    const foundRelationships = await this.huntUserModel
      .find({ userId: userId })
      .lean<LeanDoc<HuntUserInterface>[]>()
      .exec()

    return foundRelationships.map((hunt) => {
      const { _id, __v, ...otherData } = hunt

      return { id: _id.toString(), ...otherData }
    })
  }

  async getRelationshipsByUserPaginated(
    userId: string,
    page = 1,
    limit = DEFAULT_LIMIT
  ): Promise<PaginatedData<HuntUserInterface>> {
    const offset = (page - 1) * limit

    const foundRelationships = await this.huntUserModel
      .find({ userId: userId })
      .skip(offset)
      .limit(limit)
      .lean<LeanDoc<HuntUserInterface>[]>()
      .exec()

    const totalItems = await this.huntUserModel.countDocuments({
      userId: userId
    })

    const totalPages = Math.ceil(totalItems / limit)

    const result: PaginatedData<HuntUserInterface> = {
      list: foundRelationships.map((hunt) => {
        const { _id, __v, ...otherData } = hunt

        return { id: _id.toString(), ...otherData }
      }),
      totalItems,
      totalPages,
      currentPage: page,
      perPage: limit
    }

    return result
  }

  async deleteRelationship(huntId: string, userId: string): Promise<boolean> {
    const deletion = await this.huntUserModel
      .deleteOne({ huntId, userId })
      .exec()

    return deletion.deletedCount >= 1
  }
}
