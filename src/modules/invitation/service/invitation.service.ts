import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AppService } from '@src/services/app.service'
import { validateExpiration } from '@src/shared/utils/date/validate-expiration'

import { InvitationRepository } from '../repositories/invitation.repository'
import { InvitationInterface } from '../schema/model/invitation.interface'

interface InviteTokenPayload {
  type: 'invitation'
  invitationId: string
}

@Injectable()
export class InvitationService {
  constructor(
    private readonly appService: AppService,
    private readonly invitationRepository: InvitationRepository,
    private readonly jwtService: JwtService
  ) {}

  generateInvitationToken(payload: InviteTokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.appService.envVars().JWT_INVITATION_SECRET,
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

  async validateInvitation(invitationToken: string) {
    try {
      const invitation: InviteTokenPayload = await this.jwtService.verifyAsync(
        invitationToken,
        {
          secret: this.appService.envVars().JWT_INVITATION_SECRET
        }
      )

      if (!invitation || !invitation.invitationId) {
        throw new Error('Token de convite inválido')
      }

      const invite = await this.invitationRepository.getInvitationById(
        invitation.invitationId
      )

      if (!invite) {
        throw new Error('Convite não encontrado')
      }

      const isValid = validateExpiration(invite.expiresAt)

      if (!isValid) {
        throw new Error('Convite expirado')
      }

      return invite
    } catch (err) {
      console.error('Erro ao validar convite', (err as Error).message)
      return
    }
  }

  async updateInvitation(
    invitedUserId: string,
    data: Partial<InvitationInterface>
  ) {
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
