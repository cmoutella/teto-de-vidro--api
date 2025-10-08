import type { InvitationInterface } from '../schema/model/invitation.interface'

export abstract class InvitationRepository {
  abstract addInvitation(
    userId: string,
    invitedUserId?: string
  ): Promise<InvitationInterface>

  abstract getInvitationById(id: string): Promise<InvitationInterface>

  abstract listUserAcceptedInvitations(
    userId: string
  ): Promise<InvitationInterface[]>

  abstract listUserSentInvitations(
    userId: string
  ): Promise<InvitationInterface[]>

  abstract updateInvitation(
    id: string,
    data: Partial<InvitationInterface>
  ): Promise<void>

  abstract deleteInvitation(id: string): Promise<void>
}
