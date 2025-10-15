import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  UnauthorizedException
} from '@nestjs/common'
import { AccessLevelPoliciesInterface } from '@src/modules/accessLevelPolicies/schema/model/access-policies.interface'
import { UserLimitService } from '@src/modules/accessLevelPolicies/services/user-limit.service'
import { InvitationService } from '@src/modules/invitation/service/invitation.service'
import { MailService } from '@src/services/mail/mail.service'

import { UserRepository } from '../repositories/user.repository'
import { AdminCreateUser } from '../schemas/endpoints/admin/zod-validation/create-user.admin.zod-validation'
import { AdminUpdateUser } from '../schemas/endpoints/admin/zod-validation/update-user.admin.zod-validation'
import {
  InterfaceUser,
  PublicInterfaceUser
} from '../schemas/models/user.interface'

@Injectable()
export class UserAdminService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => InvitationService))
    private readonly invitationService: InvitationService,
    @Inject(forwardRef(() => UserLimitService))
    private readonly userLimitService: UserLimitService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService
  ) {}

  async createUser(
    user: AdminCreateUser,
    operatorId: string
  ): Promise<PublicInterfaceUser> {
    const createUser = {
      ...user,
      accessLevel: user.accessLevel ?? 0,
      status: user.role ?? 'regular',
      gender: user.gender ?? 'neutral'
    } as Omit<
      InterfaceUser,
      'createdAt' | 'updatedAt' | 'lastLogin' | 'welcomeCompleted'
    >

    if (!user.name || !user.email) {
      return
    }

    try {
      const newUser = await this.userRepository.createUser(createUser)

      if (!newUser) {
        console.error(`# error @ UserAdminService - user not created`)
        return
      }

      const invitation = await this.invitationService.addInvitation(
        operatorId,
        newUser.id
      )

      if (invitation) {
        await this.mailService.welcome(newUser, invitation.invitationToken)
      } else {
        console.error(`Invitation Not sent to user ${newUser.id}`)
      }

      return newUser
    } catch (err) {
      if (err instanceof Error) {
        throw err
      }
    }
  }

  async updateUser(userId, newData: AdminUpdateUser) {
    try {
      const updatedUser = await this.userRepository.updateUser(userId, newData)

      return updatedUser
    } catch (err) {
      if (err instanceof Error) {
        throw err
      }
    }
  }

  async getUserPermissions(
    userId: string
  ): Promise<
    Pick<
      AccessLevelPoliciesInterface,
      'activeHuntsLimit' | 'invitationsLimit' | 'targetsPerHuntLimit'
    >
  > {
    const host = await this.userRepository.getById(userId)
    if (!host) {
      throw new UnauthorizedException('Host não encontrado')
    }

    const currentLimits = await this.userLimitService.userAvailableLimits(host)

    return currentLimits
  }

  async getAllUsers(): Promise<PublicInterfaceUser[]> {
    return await this.userRepository.getAllUsers()
  }

  async getById(id: string): Promise<
    PublicInterfaceUser & {
      permissions: Omit<
        AccessLevelPoliciesInterface,
        'level' | 'createdAt' | 'updatedAt'
      >
    }
  > {
    const user = await this.userRepository.getById(id)

    if (!user) throw new NotFoundException()

    const { password: _password, ...userData } = user

    const permissions = await this.getUserPermissions(user.id)

    return { ...userData, permissions }
  }

  async getByEmail(email: string): Promise<
    InterfaceUser & {
      permissions: Omit<
        AccessLevelPoliciesInterface,
        'level' | 'createdAt' | 'updatedAt'
      >
    }
  > {
    const user = await this.userRepository.getByEmail(email)

    if (!user) return

    const { ...userData } = user

    const permissions = await this.getUserPermissions(user.id)

    return { ...userData, permissions }
  }

  async getByCPF(cpf: string): Promise<
    PublicInterfaceUser & {
      permissions: Omit<
        AccessLevelPoliciesInterface,
        'level' | 'createdAt' | 'updatedAt'
      >
    }
  > {
    const user = await this.userRepository.getByCPF(cpf)

    if (!user) return

    const { password: _password, ...userData } = user

    const permissions = await this.getUserPermissions(user.id)

    return { ...userData, permissions }
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.getById(id)

    if (!user) throw new NotFoundException()

    await this.userRepository.deleteUser(id)
  }
}
