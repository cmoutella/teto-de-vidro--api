import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef,
  UnauthorizedException
} from '@nestjs/common'
import { AccessLevelPoliciesInterface } from '@src/modules/accessLevelPolicies/schema/model/access-policies.interface'
import { UserLimitService } from '@src/modules/accessLevelPolicies/services/user-limit.service'
import { InvitationService } from '@src/modules/invitation/service/invitation.service'
import { MailService } from '@src/services/mail/mail.service'

import { UserRepository } from '../repositories/user.repository'
import { InviteUser } from '../schemas/endpoints/public/zod-validation/invite-user.public.zod-validation'
import {
  InterfaceUser,
  SafeInterfaceUser
} from '../schemas/models/user.interface'

@Injectable()
export class UserPublicService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => InvitationService))
    private readonly invitationService: InvitationService,
    @Inject(forwardRef(() => UserLimitService))
    private readonly userLimitService: UserLimitService,
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

  async getByEmail(email: string): Promise<
    SafeInterfaceUser & {
      permissions: Omit<
        AccessLevelPoliciesInterface,
        'level' | 'createdAt' | 'updatedAt'
      >
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
      permissions: Omit<
        AccessLevelPoliciesInterface,
        'level' | 'createdAt' | 'updatedAt'
      >
    }
  > {
    const user = await this.userRepository.getById(id)

    if (!user) throw new NotFoundException()

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
    const host = await this.getById(invitationHostId)

    if (!host) {
      throw new UnauthorizedException('Host não encontrado')
    }

    const hostLevelPermissions = await this.getUserPermissions(invitationHostId)

    if (hostLevelPermissions.invitationsLimit <= 0) {
      throw new UnauthorizedException('Host sem convites disponíveis')
    }

    const existingUserEmail = await this.userRepository.getByEmail(user.email)
    if (existingUserEmail) {
      throw new ConflictException('Email já cadastrado')
    }

    const createUser = {
      ...user,
      accessLevel: 0,
      role: 'guest'
    } as Pick<InterfaceUser, 'name' | 'email' | 'accessLevel' | 'role'>

    try {
      const invited = await this.userRepository.inviteUser(createUser)

      const invitation = await this.invitationService.addInvitation(
        invitationHostId,
        invited.id
      )

      if (!invitation) {
        throw new Error('Não foi possível enviar convite')
      }

      await this.mailService.welcome(invited, invitation.invitationToken)

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
