import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

import { PublicUserSchema } from '../../user.schema'

@Schema()
export class GetAllUsersSuccess {
  @ApiProperty({ default: 200 })
  @Prop()
  status: number
  @ApiProperty({ isArray: true })
  @Prop()
  data: PublicUserSchema
}

@Schema()
export class GetOneUserSuccess {
  @ApiProperty({ default: 200 })
  @Prop()
  status: number
  @ApiProperty()
  @Prop()
  data: PublicUserSchema
}
