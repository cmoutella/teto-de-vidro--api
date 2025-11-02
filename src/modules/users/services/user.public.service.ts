import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { LimitPolicies } from '@src/modules/accessLevelPolicies/schema/model/access-policies.interface'
import { AccessLevelPoliciesService } from '@src/modules/accessLevelPolicies/services/access-level-policies.service'
import { InvitationService } from '@src/modules/invitation/service/invitation.service'
import { MailService } from '@src/services/mail/mail.service'

import { UserRepository } from '../repositories/user.repository'
import { InviteUser } from '../schemas/endpoints/public/zod-validation/invite-user.public.zod-validation'
import {
  InterfaceUser,
  SafeInterfaceUser
} from '../schemas/models/user.interface'
import { UserLimitsService } from './user-limits.service'

@Injectable()
export class UserPublicService {
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

  async initialUserDataUpdate(
    userId: string,
    { cpf, birthDate }: Pick<InterfaceUser, 'cpf' | 'birthDate'>
  ) {
    try {
      const updated = await this.userRepository.updateUser(userId, {
        cpf,
        birthDate
      })

      if (!updated) {
        return
      }

      const updatedUser = await this.getById(userId)

      return updatedUser
    } catch (err) {
      console.error('error', (err as Error).message)
    }
  }

  async updateUserPassword(
    userId: string,
    { password }: Pick<InterfaceUser, 'password'>
  ) {
    try {
      const updatedUser = await this.userRepository.updateUser(userId, {
        password
      })

      if (!updatedUser) {
        throw new Error('Error updating user password')
      }

      return updatedUser
    } catch (err) {
      if (err instanceof Error) {
        throw err
      }
    }
  }

  async updateUser(userId, newData: Partial<InterfaceUser>) {
    try {
      const {
        id: _id,
        password: _password,
        cpf: _cpf,
        role: _role,
        accessLevel: _accessLevel,
        ...data
      } = newData

      const updatedUser = await this.userRepository.updateUser(userId, data)

      if (!updatedUser) {
        throw new Error('Error updating user password')
      }

      if (newData.welcomeCompleted === true) {
        await this.invitationService.updateInvitation(userId, {
          status: 'accepted'
        })
      }

      return updatedUser
    } catch (err) {
      if (err instanceof Error) {
        throw err
      }
    }
  }

  async getUserPermissions(userId: string): Promise<LimitPolicies> {
    try {
      const currentLimits = await this.userLimitService.getByUser(userId)

      return currentLimits
    } catch {
      console.error('ERROR @ user.public.service - getUserPermissions', userId)
    }
  }

  async getByEmail(email: string): Promise<
    SafeInterfaceUser & {
      permissions: LimitPolicies
    }
  > {
    const user = await this.userRepository.getByEmail(email)

    if (!user) return

    const {
      password: _password,
      cpf: _cpf,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      lastLogin: _lastLogin,
      ...userData
    } = user

    const permissions = await this.getUserPermissions(user.id)

    return { ...userData, permissions }
  }

  async getById(id: string): Promise<
    SafeInterfaceUser & {
      permissions: LimitPolicies
    }
  > {
    const user = await this.userRepository.getById(id)

    if (!user) return

    const {
      password: _password,
      cpf: _cpf,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      lastLogin: _lastLogin,
      ...userData
    } = user

    const permissions = await this.getUserPermissions(user.id)

    return { ...userData, permissions }
  }

  // INVITES
  async inviteUser(
    user: InviteUser,
    invitationHostId: string
  ): Promise<SafeInterfaceUser> {
    const createUser = {
      ...user,
      accessLevel: 0,
      role: 'guest'
    } as Pick<InterfaceUser, 'name' | 'email' | 'accessLevel' | 'role'>

    try {
      const invited = await this.userRepository.inviteUser(createUser)

      if (!invited) {
        return
      }

      const levelLimits = await this.accessPoliciesService.getByLevel(
        invited.accessLevel
      )

      if (!levelLimits) {
        console.error(
          '# error @ UserLimitService - access policy level not found',
          invited.accessLevel
        )
        return
      }

      await this.userLimitService.createUserLimits(invited.id, {
        activeHuntsLimit: levelLimits.activeHuntsLimit,
        targetsPerHuntLimit: levelLimits.targetsPerHuntLimit,
        invitationsLimit: levelLimits.invitationsLimit
      })

      const invitation = await this.invitationService.addInvitation(
        invitationHostId,
        invited.id
      )

      if (invitation) {
        await this.mailService.welcome(invited, invitation.invitationToken)

        await this.userLimitService.minusOneInvitation(invitationHostId)
      } else {
        console.error('# Error @ UserPublicService | could create invite')
      }

      return invited
    } catch (err) {
      if (err instanceof Error) {
        throw err
      }
    }
  }

  async validateInvitation(invitationToken: string) {
    const invite =
      await this.invitationService.validateInvitation(invitationToken)

    if (!invite) {
      return
    }

    const invitedUser = await this.getById(invite.invitedUserId)

    return { invite, invitedUser }
  }

  async countInvitations(userId: string) {
    await this.invitationService.countInvitationsSent(userId)
  }
}
