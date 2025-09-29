import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
  UnauthorizedException
} from '@nestjs/common'
import { AccessLevelPoliciesInterface } from '@src/modules/accessLevelPolicies/schema/model/access-policies.interface'
import { UserLimitService } from '@src/modules/accessLevelPolicies/services/user-limit.service'
import { InvitationService } from '@src/modules/invitation/service/invitation.service'

import { UserRepository } from '../repositories/user.repository'
import {
  InterfaceUser,
  PublicInterfaceUser
} from '../schemas/models/user.interface'
import { CreateUser } from '../schemas/zod-validation/create-user.zod-validation'
import { InviteUser } from '../schemas/zod-validation/invite-user.zod-validation'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => InvitationService))
    private readonly invitationService: InvitationService,
    @Inject(forwardRef(() => UserLimitService))
    private readonly userLimitService: UserLimitService
  ) {}

  async createUser(user: CreateUser): Promise<PublicInterfaceUser> {
    if (!user.password || !user.email) {
      throw new BadRequestException('Username or password missing')
    }

    if (!user.name || !user.familyName || !user.cpf) {
      throw new BadRequestException('Identification missing')
    }

    const existingUserEmail = await this.userRepository.getByEmail(user.email)

    if (existingUserEmail) {
      throw new ConflictException('Email já cadastrado')
    }

    const existingUserCPF = await this.userRepository.getByCPF(user.cpf)

    if (existingUserCPF) {
      throw new ConflictException('CPF já cadastrado')
    }

    const { password: _password, ...userData } = user

    const createUser = {
      ...userData,
      accessLevel: user.accessLevel ?? 0,
      status: user.role ?? 'regular',
      gender: user.gender ?? 'neutral'
    } as Omit<InterfaceUser, 'createdAt' | 'updatedAt' | 'lastLogin'>

    return await this.userRepository.createUser(createUser)
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

  async inviteUser(
    user: InviteUser,
    invitationHostId: string
  ): Promise<PublicInterfaceUser> {
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

    const invited = await this.userRepository.inviteUser(createUser)

    await this.invitationService.addInvitation(invitationHostId, invited.id)

    return invited
  }

  async countInvitations(userId: string) {
    await this.invitationService.countInvitationsSent(userId)
  }

  async getAllUsers(): Promise<PublicInterfaceUser[]> {
    return await this.userRepository.getAllUsers()
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

    const permissions = await this.getUserPermissions(user.id)

    return { ...user, permissions }
  }

  async getById(id: string): Promise<
    InterfaceUser & {
      permissions: Omit<
        AccessLevelPoliciesInterface,
        'level' | 'createdAt' | 'updatedAt'
      >
    }
  > {
    const user = await this.userRepository.getById(id)

    if (!user) throw new NotFoundException()

    const permissions = await this.getUserPermissions(user.id)

    return { ...user, permissions }
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.getById(id)
    if (!user) throw new NotFoundException()
    await this.userRepository.deleteUser(id)
  }
}
