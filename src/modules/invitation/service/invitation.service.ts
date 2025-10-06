import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { InvitationRepository } from '../repositories/invitation.repository'

interface InviteTokenPayload {
  type: 'invitation'
  invitationId: string
}

@Injectable()
export class InvitationService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly jwtService: JwtService
  ) {}

  generateInvitationToken(payload: InviteTokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_INVITATION_SECRET,
      expiresIn: '7d'
    })
  }

  async addInvitation(userId: string, invitedUserId: string) {
    // TODO: verificar se tem um convite pendente válido para esse usuário
    try {
      const invited = await this.invitationRepository.addInvitation(
        userId,
        invitedUserId
      )

      const invitationToken = this.generateInvitationToken({
        invitationId: invited.id,
        type: 'invitation'
      })

      return { invitationToken }
    } catch {
      console.error('Não foi possível cadastrar convite')
    }
  }

  async updateInvitation(invitedUserId, data) {
    await this.invitationRepository.updateInvitation(invitedUserId, data)
  }

  async countInvitationsSent(userId: string) {
    const invitations =
      await this.invitationRepository.listUserSentInvitations(userId)
    return invitations.length
  }

  async countInvitationsAccepted(userId: string) {
    return await this.invitationRepository.listUserAcceptedInvitations(userId)
  }
}
