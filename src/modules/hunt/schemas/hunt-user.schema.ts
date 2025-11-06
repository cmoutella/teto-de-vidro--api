import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import mongoose, { HydratedDocument } from 'mongoose'

import { HuntUserInterface } from './models/hunt-user.interface'
export type HuntDocument = HydratedDocument<HuntUser>

@Schema()
export class HuntUser implements HuntUserInterface {
  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  id?: string

  @ApiProperty({ required: true })
  @Prop()
  huntId: string
  @ApiProperty({ required: true })
  @Prop()
  userId: string

  @ApiProperty()
  @Prop()
  createdAt: string
}

export const HuntUserSchema = SchemaFactory.createForClass(HuntUser)
