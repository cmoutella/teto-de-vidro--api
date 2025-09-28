import { Prop, Schema } from '@nestjs/mongoose'
import { ApiPropertyOptional } from '@nestjs/swagger'

@Schema()
export class ScrapedAdData {
  @ApiPropertyOptional()
  @Prop({ required: false })
  rentPrice?: number
  @ApiPropertyOptional()
  @Prop({ required: false })
  condoPricing?: number
  @ApiPropertyOptional()
  @Prop({ required: false })
  iptu?: number
  @ApiPropertyOptional()
  @Prop({ required: false })
  size?: number
  @ApiPropertyOptional()
  @Prop({ required: false })
  rooms?: number
  @ApiPropertyOptional()
  @Prop({ required: false })
  bathrooms?: number
  @ApiPropertyOptional()
  @Prop({ required: false })
  parkingSpots?: number
  @ApiPropertyOptional()
  @Prop({ required: false })
  floorLevel?: number
  @ApiPropertyOptional()
  @Prop({ required: false })
  suites?: number
  @ApiPropertyOptional()
  @Prop({ required: false })
  street?: string
  @ApiPropertyOptional()
  @Prop({ required: false })
  lotNumber?: string
  @ApiPropertyOptional()
  @Prop({ required: false })
  neighborhood?: string
  @ApiPropertyOptional()
  @Prop({ required: false })
  city?: string
  @ApiPropertyOptional()
  @Prop({ required: false })
  uf?: string
  @ApiPropertyOptional()
  @Prop({
    type: Map,
    of: Boolean,
    required: false
  })
  amenities?: Record<string, boolean>
}
