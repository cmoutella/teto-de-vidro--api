import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

import { AccessLevelPolicies } from '../../schema/accessLevelPolicies.schema'
import { AccessLevelPoliciesInterface } from '../../schema/model/access-policies.interface'
import { AccessLevelPoliciesRepository } from '../access-level-policies.repository'

export class AccessLevelPoliciesMongooseRepository
  implements AccessLevelPoliciesRepository
{
  constructor(
    @InjectModel(AccessLevelPolicies.name)
    private accessLevelPoliciesModel: Model<AccessLevelPolicies>
  ) {}

  async createAccessLevelPolicies(
    newAccessLevelPolicies: AccessLevelPoliciesInterface
  ): Promise<AccessLevelPoliciesInterface | null> {
    const createAccessLevelPolicies = new this.accessLevelPoliciesModel(
      newAccessLevelPolicies
    )

    await createAccessLevelPolicies.save()

    return this.getPoliciesByLevel(newAccessLevelPolicies.level)
  }

  async getPoliciesByLevel(
    level: number
  ): Promise<AccessLevelPoliciesInterface & { _id: Types.ObjectId }> {
    const policies = await this.accessLevelPoliciesModel
      .findOne({ level: level })
      .exec()

    if (!policies) return

    return policies.toObject()
  }

  async updateAccessLevelPolicies(
    level: number,
    data: Partial<AccessLevelPoliciesInterface>
  ): Promise<AccessLevelPoliciesInterface> {
    const foundAccessLevelPolicies = await this.getPoliciesByLevel(level)

    if (!foundAccessLevelPolicies) return

    await this.accessLevelPoliciesModel
      .updateOne(
        { _id: foundAccessLevelPolicies._id },
        {
          ...foundAccessLevelPolicies,
          ...data,
          updatedAt: new Date().toISOString()
        }
      )
      .exec()

    const updated = await this.getPoliciesByLevel(level)

    return updated
  }

  async deleteAccessLevelPolicies(level: number): Promise<boolean> {
    try {
      await this.accessLevelPoliciesModel.deleteOne({ level: level }).exec()
      return true
    } catch {
      return false
    }
  }
}
