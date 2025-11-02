import { InjectModel } from '@nestjs/mongoose'
import { LimitPolicies } from '@src/modules/accessLevelPolicies/schema/model/access-policies.interface'
import { Model } from 'mongoose'
import { LeanDoc } from 'src/shared/types/mongoose'

import { InterfaceUserLimits } from '../../schemas/models/user-limits.interface'
import {
  UserLimits,
  UserLimitsDocument
} from '../../schemas/user-limits.schema'
import { UserLimitsRepository } from '../user-limits.repository'

export class UserLimitsMongooseRepository implements UserLimitsRepository {
  constructor(
    @InjectModel(UserLimits.name)
    private userLimitsModel: Model<UserLimitsDocument>
  ) {}

  async createUserLimits(
    userId: string,
    limits: LimitPolicies
  ): Promise<InterfaceUserLimits> {
    const createdAt = new Date().toISOString()

    const createUserLimits = new this.userLimitsModel({
      userId: userId,
      ...limits,
      createdAt: createdAt,
      updatedAt: createdAt
    })
    await createUserLimits.save()

    const created = await this.userLimitsModel
      .findById(createUserLimits._id)
      .lean<LeanDoc<InterfaceUserLimits>>()
      .exec()

    const { _id, __v, ...otherData } = created

    return { ...otherData }
  }

  async updateByUserId(userId: string, newData: Partial<InterfaceUserLimits>) {
    const user = await this.userLimitsModel
      .updateOne({ userId: userId }, { ...newData })
      .exec()

    if (!user) return

    const updated = await this.getByUser(userId)

    return updated
  }

  async deleteUserLimits(userId: string): Promise<boolean> {
    try {
      await this.userLimitsModel.deleteOne({ userId: userId }).exec()
      return true
    } catch {
      return false
    }
  }

  async getByUser(userId: string): Promise<InterfaceUserLimits> {
    const foundUserLimits = await this.userLimitsModel
      .findOne({ userId: userId })
      .lean<LeanDoc<InterfaceUserLimits>>()
      .exec()

    if (!foundUserLimits) {
      return
    }

    const { _id, __v, ...userLimitsData } = foundUserLimits

    return userLimitsData
  }
}
