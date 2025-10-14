import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { HuntService } from '@src/modules/hunt/services/hunt-collection.service'
import { InvitationService } from '@src/modules/invitation/service/invitation.service'
import { InterfaceUser } from '@src/modules/users/schemas/models/user.interface'

import { AccessLevelPoliciesService } from './access-level-policies.service'

@Injectable()
export class UserLimitService {
  constructor(
    private readonly accessLevelPoliciesService: AccessLevelPoliciesService,
    @Inject(forwardRef(() => InvitationService))
    private readonly invitationService: InvitationService,
    @Inject(forwardRef(() => HuntService))
    private readonly huntService: HuntService
  ) {}

  async huntAvailableLimit(user: InterfaceUser): Promise<number> {
    const levelPermissions = await this.accessLevelPoliciesService.getByLevel(
      user.accessLevel
    )

    const currentActiveHunts = await this.huntService.getAllActiveHuntsByUser(
      user.id
    )

    return levelPermissions.activeHuntsLimit - currentActiveHunts.totalItems
  }

  async invitesAvailableLimit(user: InterfaceUser): Promise<number> {
    const levelPermissions = await this.accessLevelPoliciesService.getByLevel(
      user.accessLevel
    )

    const sentInvitations = await this.invitationService.countInvitationsSent(
      user.id
    )

    return levelPermissions.invitationsLimit - sentInvitations
  }

  async targetPerHuntLimit(user: InterfaceUser): Promise<number> {
    const levelPermissions = await this.accessLevelPoliciesService.getByLevel(
      user.accessLevel
    )

    return levelPermissions.targetsPerHuntLimit
  }

  async userAvailableLimits(user: InterfaceUser) {
    return {
      invitationsLimit: await this.invitesAvailableLimit(user),
      activeHuntsLimit: await this.huntAvailableLimit(user),
      targetsPerHuntLimit: await this.targetPerHuntLimit(user)
    }
  }
}
