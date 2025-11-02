import { InjectModel } from '@nestjs/mongoose'
import { LeanDoc } from '@src/shared/types/mongoose'
import { addDays } from 'date-fns'
import { Model } from 'mongoose'

import { Invitation } from '../../schema/invitation.schema'
import { InvitationInterface } from '../../schema/model/invitation.interface'
import { InvitationRepository } from '../invitation.repository'

export class InvitationMongooseRepository implements InvitationRepository {
  constructor(
    @InjectModel(Invitation.name) private invitationModel: Model<Invitation>
  ) {}

  async addInvitation(
    userId: string,
    invitedUserId?: string
  ): Promise<InvitationInterface> {
    const now = new Date().toISOString()
    const newInvitation = new this.invitationModel({
      userId,
      invitedUserId,
      status: 'pending',
      expiresAt: addDays(now, 7).toISOString(),
      createdAt: now,
      updatedAt: now
    })

    await newInvitation.save()

    const created = await this.invitationModel
      .findById(newInvitation._id)
      .lean<LeanDoc<InvitationInterface>>()
      .exec()

    const { _id, __v, ...data } = created

    return { id: _id, ...data } as InvitationInterface
  }

  async getInvitationById(id: string): Promise<InvitationInterface> {
    const foundInvite = await this.invitationModel.findById(id).exec()

    if (!foundInvite) {
      return
    }

    const { _id, ...data } = foundInvite.toObject()

    return { ...data, id: _id.toString() }
  }

  async getInvitationByInvitedUser(
    userId: string
  ): Promise<InvitationInterface> {
    try {
      const invitation = await this.invitationModel
        .findOne({
          invitedUserId: userId
        })
        .exec()

      const { __v, ...invite } = invitation

      return invite
    } catch {
      console.error('ERROR @ invitation repository - get by invited user')
    }
  }

  async listUserAcceptedInvitations(
    userId: string
  ): Promise<InvitationInterface[]> {
    const acceptedInvites = await this.invitationModel
      .find({
        userId: userId,
        status: 'accepted'
      })
      .exec()

    return acceptedInvites as InvitationInterface[]
  }

  async listUserSentInvitations(
    userId: string
  ): Promise<InvitationInterface[]> {
    const acceptedInvites = await this.invitationModel
      .find({
        userId: userId
      })
      .exec()

    return acceptedInvites as InvitationInterface[]
  }

  async updateInvitation(
    invitedUserId: string,
    data: Partial<InvitationInterface>
  ): Promise<boolean> {
    const invitation = await this.getInvitationByInvitedUser(invitedUserId)

    if (!invitation) {
      return
    }

    const updated = await this.invitationModel
      .updateOne(
        { invitedUserId: invitedUserId },
        { status: data.status, updatedAt: new Date().toISOString() }
      )
      .exec()

    return updated.acknowledged && updated.modifiedCount >= 1
  }

  async deleteInvitation(id: string): Promise<void> {
    await this.invitationModel.deleteOne({ _id: id }).exec()
  }
}
