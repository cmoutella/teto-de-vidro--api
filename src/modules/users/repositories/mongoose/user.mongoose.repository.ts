import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { LeanDoc } from 'src/shared/types/mongoose'

import { CreateUser } from '../../schemas/endpoints/public/zod-validation/create-user.public.zod-validation'
import {
  InterfaceUser,
  PublicInterfaceUser
} from '../../schemas/models/user.interface'
import { User, UserDocument } from '../../schemas/user.schema'
import { UserRepository } from '../user.repository'

export class UserMongooseRepository implements UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(newUser: CreateUser): Promise<PublicInterfaceUser> {
    const createdAt = new Date().toISOString()
    const createUser = new this.userModel({
      ...newUser,
      welcomeCompleted: false,
      createdAt: createdAt,
      updatedAt: createdAt
    })
    await createUser.save()

    const created = await this.userModel
      .findById(createUser._id)
      .lean<LeanDoc<InterfaceUser>>()
      .exec()

    const { _id: id, __v, ...otherData } = created

    return { id: id.toString(), ...otherData }
  }

  async inviteUser(
    newUser: Pick<InterfaceUser, 'name' | 'email' | 'accessLevel' | 'role'>
  ): Promise<PublicInterfaceUser> {
    const createdAt = new Date().toISOString()
    const createUser = new this.userModel({
      ...newUser,
      welcomeCompleted: false,
      createdAt: createdAt,
      updatedAt: createdAt
    })
    await createUser.save()

    const created = await this.userModel
      .findById(createUser._id)
      .lean<LeanDoc<InterfaceUser>>()
      .exec()

    const { _id: id, __v, ...otherData } = created

    return { id: id.toString(), ...otherData }
  }

  async getAllUsers(): Promise<Omit<InterfaceUser, 'password'>[]> {
    const users = await this.userModel
      .find()
      .lean<LeanDoc<InterfaceUser>[]>()
      .exec()
      .then((res) =>
        res.map((user) => {
          const { password, _id, ...userData } = user
          return { id: _id.toString(), ...userData }
        })
      )

    return users
  }

  async getApplications(): Promise<PublicInterfaceUser[]> {
    const apps = await this.userModel
      .find({ role: 'app' })
      .lean<LeanDoc<InterfaceUser>[]>()
      .exec()
      .then((res) =>
        res.map((user) => {
          const { password, _id, ...userData } = user
          return { id: _id.toString(), ...userData }
        })
      )

    return apps
  }

  async getAppByName(name: string): Promise<InterfaceUser> {
    const app = await this.userModel
      .findOne({ role: 'app', name: name })
      .lean<LeanDoc<InterfaceUser>>()
      .exec()

    if (!app) return

    const { _id, ...otherData } = app

    return { ...otherData, id: _id.toString() }
  }

  async getById(id: string): Promise<InterfaceUser | null> {
    const { _id, ...userData } = await this.userModel
      .findById({ _id: id })
      .lean<LeanDoc<InterfaceUser>>()
      .exec()

    const data = {
      id: _id.toString(),
      ...userData
    }

    return data
  }

  async getByEmail(email: string): Promise<InterfaceUser | null> {
    const user = await this.userModel
      .findOne({ email: email })
      .lean<LeanDoc<InterfaceUser>>()
      .exec()

    if (!user) return null

    const { _id, ...userData } = user
    const data = {
      id: _id.toString(),
      ...userData
    }

    return data
  }

  async getByCPF(cpf: string): Promise<InterfaceUser | null> {
    const user = await this.userModel
      .findOne({ cpf: cpf })
      .lean<LeanDoc<InterfaceUser>>()
      .exec()

    if (!user) return null

    const { _id, ...userData } = user
    const data = {
      id: _id.toString(),
      ...userData
    }

    return data
  }

  async updateUser(id: string, newData: Partial<InterfaceUser>) {
    const user = await this.userModel
      .updateOne({ _id: id }, { ...newData })
      .exec()

    if (!user) return

    const { password: _password, ...updated } = await this.getById(id)

    return updated
  }

  async deleteUser(id: string): Promise<void> {
    await this.userModel.deleteOne({ _id: id }).exec()
  }
}
