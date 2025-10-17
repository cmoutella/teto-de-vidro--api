import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UsePipes
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { AuthGuard } from '@src/shared/guards/auth.guard'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'
import { ZodValidationPipe } from 'src/shared/pipe/zod-validation.pipe'

import { Address } from '../schemas/address.schema'
import { CreateLotSuccess } from '../schemas/endpoints/createLot'
import { CreatePropertySuccess } from '../schemas/endpoints/createProperty'
import {
  GetLotsByCEPSuccess,
  GetLotsByIdSuccess
} from '../schemas/endpoints/getLot'
import {
  GetPropertyByIdSuccess,
  GetPropertyByLotSuccess
} from '../schemas/endpoints/getProperty'
import { Lot } from '../schemas/lot.schema'
import { Property } from '../schemas/property.schema'
import { AddressService } from '../services/address.service'
import { LotService } from '../services/lot-collection.service'
import { PropertyService } from '../services/property-collection.service'
import {
  CreateAddress,
  createAddressSchema,
  SearchAddress,
  searchAddressSchema
} from '../validation/schemas/address'
import {
  CreateLot,
  createLotSchema,
  SearchLots,
  searchLotsSchema,
  UpdateLot,
  updateLotSchema
} from '../validation/schemas/lot'
import {
  CreateProperty,
  createPropertySchema,
  UpdateProperty,
  updatePropertySchema
} from '../validation/schemas/property'

@UseInterceptors(LoggingInterceptor)
@Controller('address')
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly lotService: LotService,
    private readonly propertyService: PropertyService
  ) {}

  /**
   *
   * #####################
   * # Address Endpoints #
   * #####################
   */

  /**
   * CREATE | dev endpoint
   * Endpoint para testar o retorno do service chamado no target
   */
  @ApiTags('address')
  @ApiOperation({
    summary: 'Tenta criar lot e property',
    description:
      'A partir das propriedades enviadas busca-se identificar informações mínimas para criar lot e/ou property, caso não estejam criados ainda'
  })
  @ApiBody({
    type: Address,
    description:
      'Todas as possibilidades de dados possíveis para lot ou property'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(createAddressSchema))
  @Post()
  async createAddress(
    @Body()
    {
      lotName,
      street,
      lotNumber,
      noLotNumber,
      postalCode,
      neighborhood,
      city,
      uf,
      country = 'Brasil',
      noComplement,
      block,
      propertyNumber,
      size,
      rooms,
      bathrooms,
      parking,
      is_front,
      sun,
      condoPricing
    }: CreateAddress
  ) {
    return await this.addressService.createAddress({
      lotName,
      street,
      lotNumber,
      noLotNumber,
      postalCode,
      neighborhood,
      city,
      uf,
      country,
      noComplement,
      block: noComplement ? '0' : block,
      propertyNumber: noComplement ? '0' : propertyNumber,
      size,
      rooms,
      bathrooms,
      parking,
      is_front,
      sun,
      condoPricing
    })
  }

  /**
   * BUSCA DE ENDEREÇOS
   */
  /**
   * TODO
   * - swagger documentation
   * - corrigir a busca
   */
  @ApiTags('address')
  @ApiOperation({ summary: 'TODO | Busca por um endereço' })
  @UsePipes(new ZodValidationPipe(searchAddressSchema))
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('/search')
  async searchByAddress(
    @Body()
    {
      lotName,
      street,
      lotNumber,
      postalCode,
      neighborhood,
      city,
      uf,
      country,
      block,
      propertyNumber
    }: SearchAddress
  ) {
    return await this.addressService.findByAddress({
      lotName,
      street,
      lotNumber,
      postalCode,
      neighborhood,
      city,
      uf,
      country,
      block,
      propertyNumber
    })
  }

  /**
   *
   * #####################
   * # Lots Endpoints #
   * #####################
   */

  /**
   * CREATE
   */

  /**
   * TODO
   * - tratar duplicidade
   * - dados minimos: rua, numero, bairro, cidade, estado, país
   */
  @ApiTags('lot')
  @ApiOperation({
    summary: 'Criação de lotes',
    description:
      'Endpoint para criação de um lote. Será verificado na API de ceps pelo endereço correto e validado se o lote já está cadastrado'
  })
  @ApiBody({
    type: Lot
  })
  @ApiResponse({
    type: CreateLotSuccess,
    status: 201
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(createLotSchema))
  @Post('/lot')
  async createLot(
    @Body()
    {
      lotName,
      street,
      lotNumber,
      noLotNumber,
      postalCode,
      neighborhood,
      city,
      uf,
      country = 'Brasil'
    }: CreateLot
  ) {
    if (!postalCode) {
      throw new BadRequestException('CEP é obrigatório')
    }

    return await this.lotService.createLot({
      lotName,
      street,
      lotNumber,
      noLotNumber,
      postalCode,
      neighborhood,
      city,
      uf,
      country,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  /**
   * GET by ID
   */
  @ApiTags('lot')
  @ApiOperation({ summary: 'Buscar por lote por id' })
  @ApiResponse({
    type: GetLotsByIdSuccess,
    status: 200
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/lot/:id')
  async getLotById(@Param('id') id: string) {
    return await this.lotService.getOneLot(id)
  }

  /**
   * BUSCA DE LOTES | wip
   */
  /**
   * TODO
   * - swagger documentation
   * - corrigir a busca
   */
  @ApiTags('lot')
  @ApiOperation({ summary: 'TODO | Buscar por lotes a partir de um endereço' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(searchLotsSchema))
  @Post('/lots')
  async findLotsByAddress(
    @Body()
    {
      street,
      lotNumber,
      noLotNumber,
      postalCode,
      neighborhood,
      city,
      uf,
      country,
      block
    }: SearchLots
  ) {
    return await this.lotService.getAllLotsByAddress({
      street,
      lotNumber,
      noLotNumber,
      postalCode,
      neighborhood,
      city,
      uf,
      country,
      block
    })
  }

  /**
   * BUSCA DE LOTES por CEP
   */
  @ApiOperation({ summary: 'Buscar por lotes a partir do CEP' })
  @ApiResponse({
    type: GetLotsByCEPSuccess,
    status: 200
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiTags('lot')
  @Get('/lot/cep/:cep')
  async findLotsByCEP(
    @Param('cep')
    cep: string
  ) {
    return await this.lotService.getAllLotsByCEP(cep)
  }

  /**
   * UPDATE
   */
  @ApiTags('lot')
  @ApiOperation({ summary: 'Atualizar um lote' })
  @ApiResponse({
    type: CreateLotSuccess,
    status: 200
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put('/lot/:id')
  async updateLot(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLotSchema))
    updateData: UpdateLot
  ) {
    return await this.lotService.updateLot(id, updateData)
  }

  /**
   * DELETE
   */
  @ApiTags('lot')
  @Delete('/lot/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Deleção de lote' })
  async deleteLot(@Param('id') id: string) {
    await this.lotService.deleteLot(id)
  }

  /**
   *
   * #####################
   * # Property Endpoints #
   * #####################
   */

  /**
   * CREATE
   */
  @ApiTags('property')
  @ApiOperation({ summary: 'Cria uma propriedade' })
  @ApiBody({
    type: Property
  })
  @ApiResponse({
    type: CreatePropertySuccess,
    status: 201
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(createPropertySchema))
  @Post('/property')
  async createProperty(
    @Body()
    {
      lotId,
      noComplement,
      block,
      propertyNumber,
      size,
      rooms,
      bathrooms,
      parking,
      is_front,
      sun,
      condoPricing
    }: CreateProperty
  ) {
    return await this.propertyService.createProperty({
      lotId,
      noComplement,
      block: noComplement ? '0' : block,
      propertyNumber: noComplement ? '0' : propertyNumber,
      size,
      rooms,
      bathrooms,
      parking,
      is_front,
      sun,
      condoPricing,
      /**
       * TODO: Implementar conveniências de propriedade
       */
      propertyAmenities: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  /**
   * GET
   */
  @ApiOperation({ summary: 'Busca uma propriedade por id' })
  @ApiResponse({
    type: GetPropertyByIdSuccess,
    status: 200
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiTags('property')
  @Get('/property/:id')
  async getOnePropertyById(@Param('id') id: string) {
    return await this.propertyService.getOneProperty(id)
  }

  /**
   * GET ALL PROPERTIES by LOT
   */
  @ApiTags('property')
  @ApiOperation({
    summary: 'Busca todas as propriedades de um lote'
  })
  @ApiResponse({
    type: GetPropertyByLotSuccess,
    status: 200
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/lot/:lotId/properties')
  async getPropertiesByMainAddress(@Param('lotId') lotId: string) {
    return await this.propertyService.getAllPropertiesByLotId(lotId)
  }

  /**
   * UDPATE
   */
  @ApiTags('property')
  @ApiOperation({ summary: 'Atualiza uma pripridade' })
  @ApiResponse({ type: CreatePropertySuccess, status: 200 })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put('/property/:id')
  async updateProperty(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePropertySchema))
    updateData: UpdateProperty
  ) {
    return await this.propertyService.updateProperty(id, updateData)
  }

  /**
   * DELETE
   */
  @ApiTags('property')
  @Delete('/property/:id')
  @ApiOperation({ summary: 'Deleta uma pripridade' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async deleteProperty(@Param('id') id: string) {
    await this.propertyService.deleteProperty(id)
  }
}
