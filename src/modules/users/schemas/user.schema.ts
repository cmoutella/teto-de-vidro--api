import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import mongoose, { HydratedDocument } from 'mongoose'

import { InterfaceUser, UserRole } from './models/user.interface'

export enum CommentRatedAsEnum {
  beta = 'beta',
  guest = 'guest',
  regular = 'regular',
  tester = 'tester'
}

export enum GenderAsEnum {
  male = 'male',
  female = 'female',
  neutral = 'neutral'
}

export enum RoleAsEnum {
  master = 'master',
  admin = 'admin',
  beta = 'beta',
  regular = 'regular',
  guest = 'guest',
  tester = 'tester',
  app = 'app'
}

export type UserDocument = HydratedDocument<User>

@Schema()
export class User implements InterfaceUser {
  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  id?: string

  // IDENTIFY USER
  @ApiProperty({ required: true })
  @Prop({ required: true })
  name: string
  @ApiProperty()
  @Prop()
  familyName: string
  @ApiProperty()
  @Prop()
  cpf: string
  @ApiProperty({ required: true })
  @Prop({ required: true })
  email: string

  // ACCESS
  @ApiProperty({ required: true })
  @Prop({ required: true })
  accessLevel: number
  @ApiProperty({ required: true })
  @Prop({ enum: RoleAsEnum, required: true })
  role: UserRole

  // PROFILING
  @ApiProperty()
  @Prop()
  profession: string
  @ApiProperty()
  @Prop({ enum: GenderAsEnum })
  gender: GenderAsEnum
  @ApiProperty()
  @Prop()
  birthDate: string

  // USER SETTINGS
  @ApiProperty()
  @Prop()
  password: string

  // HISTORY
  @ApiProperty()
  @Prop({ required: true })
  createdAt: string
  @ApiProperty()
  @Prop({ required: true })
  updatedAt: string
  @ApiProperty()
  @Prop()
  welcomeCompleted: boolean
  @ApiProperty()
  @Prop()
  lastLogin: string
}

export const UserSchema = SchemaFactory.createForClass(User)

export class PublicUserSchema {
  @ApiProperty()
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  id?: string

  // IDENTIFY USER
  @ApiProperty({ required: true })
  @Prop({ required: true })
  name: string
  @ApiProperty()
  @Prop()
  familyName: string
  @ApiProperty()
  @Prop()
  cpf: string
  @ApiProperty({ required: true })
  @Prop({ required: true })
  email: string

  // ACCESS
  @ApiProperty({ required: true })
  @Prop({ required: true })
  accessLevel: number
  @ApiProperty({ enum: CommentRatedAsEnum, required: true })
  @Prop({ enum: CommentRatedAsEnum, required: true })
  role: CommentRatedAsEnum

  // PROFILING
  @ApiProperty()
  @Prop()
  profession: string
  @ApiProperty()
  @Prop({ enum: GenderAsEnum })
  gender: GenderAsEnum
  @ApiProperty()
  @Prop()
  welcomeCompleted: boolean
  @ApiProperty()
  @Prop()
  birthDate: string
}
