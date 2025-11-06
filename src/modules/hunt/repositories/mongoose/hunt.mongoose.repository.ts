import { InternalServerErrorException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { DEFAULT_LIMIT } from 'src/shared/const/pagination'
import { LeanDoc } from 'src/shared/types/mongoose'
import { PaginatedData } from 'src/shared/types/response'

import { Hunt } from '../../schemas/hunt.schema'
import {
  CreateHuntServiceDate,
  InterfaceHunt
} from '../../schemas/models/hunt.interface'
import { HuntRepository } from '../hunt.repository'

export class HuntMongooseRepository implements HuntRepository {
  constructor(@InjectModel(Hunt.name) private huntModel: Model<Hunt>) {}

  async createHunt(
    newHunt: CreateHuntServiceDate
  ): Promise<InterfaceHunt | null> {
    const now = new Date().toISOString()
    const createHunt = new this.huntModel({
      ...newHunt,
      createdAt: now,
      updatedAt: now
    })

    await createHunt.save()

    const created = await this.huntModel
      .findById(createHunt._id)
      .lean<LeanDoc<InterfaceHunt>>()
      .exec()

    const { _id, __v, ...data } = created

    return { id: _id, ...data } as InterfaceHunt
  }

  // TODO ordenar por mais recentemente alterado
  async getAllHuntsByUser(
    userId: string,
    page = 1,
    limit = DEFAULT_LIMIT
  ): Promise<PaginatedData<InterfaceHunt>> {
    const offset = (page - 1) * limit

    const foundHunts = await this.huntModel
      .find({ 'huntUsers.id': userId })
      .skip(offset)
      .limit(limit)
      .lean<LeanDoc<InterfaceHunt>[]>()
      .exec()

    const totalItems = await this.huntModel.countDocuments({
      'huntUsers.id': userId
    })

    const totalPages = Math.ceil(totalItems / limit)

    const result: PaginatedData<InterfaceHunt> = {
      list: foundHunts.map((hunt) => {
        const { _id: id, __v, ...otherData } = hunt

        return { id: id.toString(), ...otherData }
      }),
      totalItems,
      totalPages,
      currentPage: page,
      perPage: limit
    }

    return result
  }

  async getActiveHunts(
    ids: string[],
    page = 1,
    limit = DEFAULT_LIMIT
  ): Promise<PaginatedData<InterfaceHunt>> {
    const offset = (page - 1) * limit

    const foundHunts = await this.huntModel
      .find({ _id: { $in: ids }, isActive: true })
      .skip(offset)
      .limit(limit)
      .lean<LeanDoc<InterfaceHunt>[]>()
      .exec()

    const totalItems = await this.huntModel.countDocuments({
      _id: { $in: ids },
      isActive: true
    })

    const totalPages = Math.ceil(totalItems / limit)

    const result: PaginatedData<InterfaceHunt> = {
      list: foundHunts.map((hunt) => {
        const { _id: id, __v, ...otherData } = hunt

        return { id: id.toString(), ...otherData }
      }),
      totalItems,
      totalPages,
      currentPage: page,
      perPage: limit
    }

    return result
  }

  async addTargetToHunt(huntId: string, targetId: string): Promise<void> {
    const hunt = await this.getOneHuntById(huntId)

    if (!hunt) return

    const data = await this.huntModel
      .updateOne(
        { _id: huntId },
        {
          ...hunt,
          targets: [...hunt.targets, targetId],
          updatedAt: new Date().toISOString()
        }
      )
      .exec()

    if (!data) {
      throw new InternalServerErrorException()
    }
  }

  async removeTargetFromHunt(huntId: string, targetId: string): Promise<void> {
    const hunt = await this.huntModel.findById(huntId).exec()

    if (!hunt) return

    const removed = hunt.targets.filter((el) => el !== targetId)

    const data = await this.huntModel
      .updateOne(
        { _id: huntId },
        { targets: removed, updatedAt: new Date().toISOString() }
      )
      .exec()

    if (!data) {
      throw new InternalServerErrorException()
    }
  }

  async getOneHuntById(id: string): Promise<InterfaceHunt> {
    const found = await this.huntModel
      .findById(id)
      .lean<LeanDoc<InterfaceHunt>>()
      .exec()

    if (!found) {
      return null
    }

    const { _id, __v, ...otherData } = found

    return { id: _id.toString(), ...otherData }
  }

  async getActiveHuntById(id: string): Promise<InterfaceHunt> {
    const found = await this.huntModel
      .findOne({ _id: id, isActive: true })
      .lean<LeanDoc<InterfaceHunt>>()
      .exec()

    if (!found) {
      return
    }

    const { _id, __v, ...otherData } = found

    return { id: _id.toString(), ...otherData }
  }

  async updateHunt(
    id: string,
    data: Partial<InterfaceHunt>
  ): Promise<InterfaceHunt> {
    const foundHunt = await this.getOneHuntById(id)

    if (!foundHunt) {
      return null
    }

    await this.huntModel
      .updateOne(
        { _id: id },
        { ...foundHunt, ...data, updatedAt: new Date().toISOString() }
      )
      .exec()

    return await this.getOneHuntById(id)
  }

  async deleteHunt(id: string): Promise<void> {
    await this.huntModel.deleteOne({ _id: id }).exec()
  }
}
