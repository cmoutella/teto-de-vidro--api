import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common'
import { PasswordGenerator } from '@src/shared/utils/password-generator.util'
import { hash } from 'bcryptjs'

import { UserApplicationRepository } from '../repositories/application.repository'
import { CreateUser } from '../schemas/endpoints/public/zod-validation/create-user.public.zod-validation'
import {
  InterfaceApplicationUser,
  PublicInterfaceApplicationUser
} from '../schemas/models/application.interface'

@Injectable()
export class ApplicationUserService {
  constructor(private readonly userRepository: UserApplicationRepository) {}

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

    const createdApplication = await this.userRepository.createApp({
      email: newApp.email,
      name: appName,
      role: 'app',
      password
    })

    return {
      client: createdApplication.name,
      role: createdApplication.role,
      key: strongPassword
    }
  }

  async listApplications(): Promise<PublicInterfaceApplicationUser[]> {
    return await this.userRepository.getApps()
  }

  async getByName(name: string): Promise<InterfaceApplicationUser> {
    const app = await this.userRepository.getAppByName(name)

    if (!app) return

    return app
  }

  async getByEmail(email: string): Promise<InterfaceApplicationUser> {
    const user = await this.userRepository.getByRepresentativeEmail(email)

    if (!user) return

    return user
  }

  async getById(id: string): Promise<InterfaceApplicationUser> {
    const user = await this.userRepository.getById(id)

    if (!user) throw new NotFoundException()

    return user
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.getById(id)
    if (!user) throw new NotFoundException()
    await this.userRepository.deleteApp(id)
  }
}
