import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

import { PublicUserSchema } from '../../user.schema'

@Schema()
export class InviteUserSchema {
  @ApiProperty({ default: 201 })
  @Prop({ required: true, type: String })
  name: number
  @ApiProperty({ required: true, type: String })
  @Prop()
  email: PublicUserSchema
}
