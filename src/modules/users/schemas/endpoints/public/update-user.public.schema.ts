import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { HydratedDocument } from 'mongoose'

import { GenderAsEnum } from '../../user.schema'

export type UpdateUserDocument = HydratedDocument<UpdateUserData>

@Schema()
export class UpdateUserData {
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
  @Prop()
  welcomeCompleted: boolean
}

export const UpdateUserSchema = SchemaFactory.createForClass(UpdateUserData)

export class InitialUpdateUserData {
  @ApiProperty()
  @Prop()
  birthDate: string
  @ApiProperty()
  @Prop()
  cpf: string
}

export class UpdateUserPassword {
  @ApiProperty()
  @Prop()
  password: string
}
