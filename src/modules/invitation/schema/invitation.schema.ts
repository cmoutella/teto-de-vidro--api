import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import mongoose, { HydratedDocument } from 'mongoose'

import { InvitationInterface } from './model/invitation.interface'

export type InvitationDocument = HydratedDocument<Invitation>

export enum InvitationStatusEnum {
  pending = 'pending',
  accepted = 'accepted',
  declined = 'declined'
}

@Schema()
export class Invitation implements InvitationInterface {
  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  id: string

  @ApiProperty()
  @Prop({ type: String, enum: Object.values(InvitationStatusEnum) })
  status: InvitationStatusEnum
  @ApiProperty()
  @Prop()
  userId: string
  @ApiProperty()
  @Prop()
  invitedUserId: string

  @ApiProperty()
  @Prop()
  expiresAt: string
  @ApiProperty()
  @Prop()
  createdAt: string
  @ApiProperty()
  @Prop()
  updatedAt: string
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation)
