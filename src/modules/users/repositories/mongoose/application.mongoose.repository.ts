import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { LeanDoc } from 'src/shared/types/mongoose'

import {
  ApplicationUser,
  ApplicationUserDocument
} from '../../schemas/application.schema'
import { CreateApplicationUser } from '../../schemas/endpoints/public/zod-validation/create-application-user.public.zod-validation'
import {
  InterfaceApplicationUser,
  PublicInterfaceApplicationUser
} from '../../schemas/models/application.interface'
import { UserApplicationRepository } from '../application.repository'

export class ApplicationMongooseRepository
  implements UserApplicationRepository
{
  constructor(
    @InjectModel(ApplicationUser.name)
    private applicationModel: Model<ApplicationUserDocument>
  ) {}

  async createApp(
    newUser: CreateApplicationUser
  ): Promise<PublicInterfaceApplicationUser> {
    const createdAt = new Date().toISOString()
    const createUser = new this.applicationModel({
      ...newUser,
      createdAt: createdAt,
      updatedAt: createdAt
    })
    await createUser.save()

    const created = await this.applicationModel
      .findById(createUser._id)
      .lean<LeanDoc<InterfaceApplicationUser>>()
      .exec()

    const { _id: id, __v, ...otherData } = created

    return { id: id.toString(), ...otherData }
  }

  async updateApp(id: string, newData: Partial<InterfaceApplicationUser>) {
    const app = await this.applicationModel
      .updateOne({ _id: id }, { ...newData })
      .exec()

    if (!app) return

    const updated = await this.getById(id)

    return updated
  }

  async deleteApp(id: string): Promise<void> {
    await this.applicationModel.deleteOne({ _id: id }).exec()
  }

  async getById(id: string): Promise<InterfaceApplicationUser> {
    const foundApp = await this.applicationModel
      .findById({ _id: id })
      .lean<LeanDoc<InterfaceApplicationUser>>()
      .exec()

    if (!foundApp) {
      return
    }

    const { _id, ...userData } = foundApp

    return {
      id: _id.toString(),
      ...userData
    }
  }

  async getByRepresentativeEmail(
    email: string
  ): Promise<InterfaceApplicationUser> {
    const app = await this.applicationModel
      .findOne({ email: email })
      .lean<LeanDoc<InterfaceApplicationUser>>()
      .exec()

    if (!app) return

    const { _id, ...userData } = app

    return {
      id: _id.toString(),
      ...userData
    }
  }

  /** APPLICATION USERS */
  async getApps(): Promise<PublicInterfaceApplicationUser[]> {
    const apps = await this.applicationModel
      .find({ role: 'app' })
      .lean<LeanDoc<InterfaceApplicationUser>[]>()
      .exec()
      .then((res) =>
        res.map((app) => {
          const { password, _id, ...userData } = app
          return { id: _id.toString(), ...userData }
        })
      )

    return apps
  }

  async getAppByName(name: string): Promise<InterfaceApplicationUser> {
    const app = await this.applicationModel
      .findOne({ role: 'app', name: name })
      .lean<LeanDoc<InterfaceApplicationUser>>()
      .exec()

    if (!app) return

    const { _id, ...otherData } = app

    return { ...otherData, id: _id.toString() }
  }
}
