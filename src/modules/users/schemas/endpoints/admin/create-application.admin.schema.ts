import { Prop, Schema } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

@Schema()
export class ApplicationCredentials {
  @ApiProperty()
  @Prop()
  client: string
  @ApiProperty()
  @Prop()
  role: string
  @ApiProperty()
  @Prop()
  key: string
}

@Schema()
export class CreateApplicationSuccess {
  @ApiProperty({ default: 201 })
  @Prop()
  status: number
  @ApiProperty()
  @Prop()
  data: ApplicationCredentials
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
