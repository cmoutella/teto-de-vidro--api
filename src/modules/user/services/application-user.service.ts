import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common'
import { PasswordGenerator } from '@src/shared/utils/password-generator.util'
import { hash } from 'bcryptjs'

import { UserRepository } from '../repositories/user.repository'
import {
  InterfaceUser,
  PublicInterfaceUser
} from '../schemas/models/user.interface'
import { CreateUser } from '../schemas/zod-validation/create-user.zod-validation'

@Injectable()
export class ApplicationUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createApplication(newApp: CreateUser) {
    if (!newApp.name) {
      throw new BadRequestException('Identification missing')
    }

    const nameString = newApp.name.trim().replace(' ', '-').toLowerCase()
    const appName = `application:${nameString}`

    const alreadyExists = await this.userRepository.getAppByName(appName)

    if (alreadyExists) {
      throw new ConflictException('Aplicação já cadastrado')
    }

    const strongPassword = PasswordGenerator.generateComplexPassword()
    const password = await hash(strongPassword, 8)

    if (!strongPassword) {
      throw new InternalServerErrorException()
    }

    const createdApplication = await this.userRepository.createUser({
      email: newApp.email,
      name: appName,
      accessLevel: 1,
      role: 'app',
      password
    })

    return {
      client: createdApplication.name,
      role: createdApplication.role,
      key: strongPassword
    }
  }

  async listApplications(): Promise<PublicInterfaceUser[]> {
    return await this.userRepository.getApplications()
  }

  async getByName(name: string): Promise<InterfaceUser> {
    const app = await this.userRepository.getAppByName(name)

    if (!app) return

    return app
  }

  async getByEmail(email: string): Promise<InterfaceUser> {
    const user = await this.userRepository.getByEmail(email)

    if (!user) return

    return user
  }

  async getById(id: string): Promise<InterfaceUser> {
    const user = await this.userRepository.getById(id)

    if (!user) throw new NotFoundException()

    return user
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.getById(id)
    if (!user) throw new NotFoundException()
    await this.userRepository.deleteUser(id)
  }
}
