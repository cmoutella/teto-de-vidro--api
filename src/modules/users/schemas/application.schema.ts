import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import mongoose, { HydratedDocument } from 'mongoose'

import { InterfaceApplicationUser } from './models/application.interface'

export enum RoleAsEnum {
  app = 'app'
}

export type ApplicationUserDocument = HydratedDocument<ApplicationUser>

@Schema()
export class ApplicationUser implements InterfaceApplicationUser {
  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  id?: string

  // IDENTIFY USER
  @ApiProperty({ required: true })
  @Prop({ required: true })
  name: string
  @ApiProperty({ required: true })
  @Prop({ required: true })
  email: string

  // GENERATED
  @ApiProperty()
  @Prop()
  password: string
  @ApiProperty()
  @Prop()
  role: RoleAsEnum

  // HISTORY
  @ApiProperty()
  @Prop({ required: true })
  createdAt: string
  @ApiProperty()
  @Prop({ required: true })
  updatedAt: string
}

export const ApplicationUserSchema =
  SchemaFactory.createForClass(ApplicationUser)

export class PublicApplicationUserSchema {
  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  id?: string

  // IDENTIFY USER
  @ApiProperty({ required: true })
  @Prop({ required: true })
  name: string
}
