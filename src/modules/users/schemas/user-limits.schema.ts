import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { HydratedDocument } from 'mongoose'

import { InterfaceUserLimits } from './models/user-limits.interface'

export type UserLimitsDocument = HydratedDocument<UserLimits>

@Schema()
export class UserLimits implements InterfaceUserLimits {
  // IDENTIFY USER
  @ApiProperty({ required: true })
  @Prop({ required: true })
  userId: string

  // AVAILABLE LIMITS
  @ApiProperty({ required: true })
  @Prop({ required: true })
  activeHuntsLimit: number
  @ApiProperty({ required: true })
  @Prop({ required: true })
  targetsPerHuntLimit: number
  @ApiProperty({ required: true })
  @Prop({ required: true })
  invitationsLimit: number

  // HISTORY
  @ApiProperty()
  @Prop({ required: true })
  createdAt: string
  @ApiProperty()
  @Prop({ required: true })
  updatedAt: string
}

export const UserLimitsSchema = SchemaFactory.createForClass(UserLimits)
