import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

import { UserRole } from '../../models/user.interface'
import { GenderAsEnum, PublicUserSchema, RoleAsEnum } from '../../user.schema'

@Schema()
export class AdminCreateUserData {
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

@Schema()
export class CreateUserSuccess {
  @ApiProperty({ default: 201 })
  @Prop()
  status: number
  @ApiProperty()
  @Prop()
  data: PublicUserSchema
}

@Schema()
export class CreateUserFailureException {
  @ApiProperty()
  @Prop()
  status: number
  @ApiProperty()
  @Prop()
  timestamp: string
  @ApiProperty()
  @Prop()
  message: string
  @ApiProperty()
  @Prop()
  path: string
}
