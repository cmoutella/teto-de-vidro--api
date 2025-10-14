import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

@Schema()
export class DeleteUserSuccess {
  @ApiProperty({ default: 200 })
  @Prop()
  status: number
}
