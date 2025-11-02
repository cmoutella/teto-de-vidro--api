import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef
} from '@nestjs/common'
import { LimitPolicies } from '@src/modules/accessLevelPolicies/schema/model/access-policies.interface'
import { AccessLevelPoliciesService } from '@src/modules/accessLevelPolicies/services/access-level-policies.service'
import { InvitationService } from '@src/modules/invitation/service/invitation.service'
import { MailService } from '@src/services/mail/mail.service'

import { UserRepository } from '../repositories/user.repository'
import { AdminCreateUser } from '../schemas/endpoints/admin/zod-validation/create-user.admin.zod-validation'
import { AdminUpdateUser } from '../schemas/endpoints/admin/zod-validation/update-user.admin.zod-validation'
import {
  InterfaceUser,
  PublicInterfaceUser
} from '../schemas/models/user.interface'
import { UserLimitsService } from './user-limits.service'

@Injectable()
export class UserAdminService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => InvitationService))
    private readonly invitationService: InvitationService,

    @Inject(forwardRef(() => AccessLevelPoliciesService))
    private readonly accessPoliciesService: AccessLevelPoliciesService,
    @Inject(forwardRef(() => UserLimitsService))
    private readonly userLimitService: UserLimitsService,

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

      const levelLimits = await this.accessPoliciesService.getByLevel(
        newUser.accessLevel
      )

      if (!levelLimits) {
        console.error(
          '# error @ UserLimitService - access policy level not found',
          newUser.accessLevel
        )
        return
      }

      await this.userLimitService.createUserLimits(newUser.id, {
        activeHuntsLimit: levelLimits.activeHuntsLimit,
        targetsPerHuntLimit: levelLimits.targetsPerHuntLimit,
        invitationsLimit: levelLimits.invitationsLimit
      })

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

  async getUserPermissions(userId: string): Promise<LimitPolicies> {
    try {
      const availableLimits = await this.userLimitService.getByUser(userId)

      if (!availableLimits) {
        return {
          activeHuntsLimit: 0,
          invitationsLimit: 0,
          targetsPerHuntLimit: 0
        }
      }

      return availableLimits
    } catch {
      console.error('ERROR on geting user permissions')
    }
  }

  async getAllUsers(): Promise<PublicInterfaceUser[]> {
    return await this.userRepository.getAllUsers()
  }

  async getById(id: string): Promise<
    PublicInterfaceUser & {
      permissions: LimitPolicies
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
      permissions: LimitPolicies
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
      permissions: LimitPolicies
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
