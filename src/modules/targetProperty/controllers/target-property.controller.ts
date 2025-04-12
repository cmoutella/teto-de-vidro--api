import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';

import { LoggingInterceptor } from '../../../shared/interceptors/logging.interceptor';
import { ZodValidationPipe } from '../../../shared/pipe/zod-validation.pipe';
import { TargetPropertyService } from '../services/target-property.service';
import { HuntService } from '../../hunt/services/hunt-collection.service';
import { PROPERTY_SUN_LIGHT } from 'src/shared/const';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TargetProperty } from '../schemas/target-property.schema';
import { CreateTargetPropertySuccess } from '../schemas/endpoints/create';
import {
  GetOneTargetPropertySuccess,
  GetTargetPropertiesByHuntSuccess,
} from '../schemas/endpoints/get';
import { DeleteTargetPropertySuccess } from '../schemas/endpoints/delete';
import { AuthGuard } from 'src/shared/guards/auth.guard';

const HUNTING_STAGE = [
  'new',
  'iniciated',
  'returned',
  'disappeared',
  'unavailable',
  'scheduled',
  'visited',
  'quit',
  'submitted',
  'approved',
  'denied',
] as const;

const createTargetPropertySchema = z.object({
  huntId: z.string(),
  adURL: z.string(),
  sellPrice: z.number(),
  rentPrice: z.number(),
  iptu: z.number().optional(),

  nickname: z.string().optional(),
  priority: z.number().optional(),
  realtor: z.string().optional(),
  realtorContact: z.string().optional(),

  city: z.string(),
  neighborhood: z.string(),
  uf: z.string(),
  country: z.string(),

  block: z.string().optional(),
  street: z.string(),
  lotName: z.string().optional(),
  lotNumber: z.string().optional(),
  postalCode: z.string().optional(),
  lotConvenience: z.string().optional(),
  propertyNumber: z.string().optional(),
  size: z.number().optional(),
  rooms: z.number().optional(),
  bathrooms: z.number().optional(),
  parking: z.number().optional(),
  is_front: z.boolean().optional(),
  sun: z.enum(PROPERTY_SUN_LIGHT).optional(),
  condoPricing: z.number().optional(),
  propertyConvenience: z.string().optional(),
});

type CreateTargetProperty = z.infer<typeof createTargetPropertySchema>;

const updateTargetPropertySchema = z.object({
  adURL: z.string().optional(),
  sellPrice: z.number().optional(),
  rentPrice: z.number().optional(),
  iptu: z.number().optional(),

  nickname: z.string().optional(),
  priority: z.number().optional(),
  huntingStage: z.enum(HUNTING_STAGE).optional(),
  isActive: z.boolean().optional(),
  realtor: z.string().optional(),
  realtorContact: z.string().optional(),
  visitDate: z.string().optional(),

  city: z.string().optional(),
  uf: z.string().optional(),
  neighborhood: z.string().optional(),

  block: z.string().optional(),
  street: z.string().optional(),
  lotName: z.string().optional(),
  lotNumber: z.string().optional(),
  postalCode: z.string().optional(),
  lotConvenience: z.string().optional(),
  propertyNumber: z.string().optional(),
  size: z.number().optional(),
  rooms: z.number().optional(),
  bathrooms: z.number().optional(),
  parking: z.number().optional(),
  is_front: z.boolean().optional(),
  sun: z.enum(PROPERTY_SUN_LIGHT).optional(),
  condoPricing: z.number().optional(),
  propertyConvenience: z.string().optional(),
});

type UpdateTargetProperty = z.infer<typeof updateTargetPropertySchema>;

@ApiTags('targetProperty')
@UseInterceptors(LoggingInterceptor)
@Controller('target-property')
export class TargetPropertyController {
  constructor(
    private readonly targetPropertyService: TargetPropertyService,
    private readonly huntService: HuntService,
  ) {}

  /**
   * CREATE
   * @returns InterfaceTargetProperty
   */
  @ApiOperation({ summary: 'Cria um novo imóvel target na caçada' })
  @ApiBody({
    type: TargetProperty,
  })
  @ApiResponse({
    type: CreateTargetPropertySuccess,
    status: 201,
    description: 'Sucesso ao criar Imóvel de interesse',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(createTargetPropertySchema))
  @Post()
  async createTargetProperty(
    @Body()
    {
      huntId,
      adURL,
      sellPrice,
      rentPrice,
      iptu,
      nickname,
      priority,
      realtor,
      realtorContact,
      lotName,
      street,
      lotNumber,
      postalCode,
      neighborhood,
      city,
      uf,
      country,
      lotConvenience,
      block,
      propertyNumber,
      size,
      rooms,
      bathrooms,
      parking,
      is_front,
      sun,
      condoPricing,
      propertyConvenience,
    }: CreateTargetProperty,
  ) {
    const hunt = await this.huntService.getOneHuntById(huntId);

    if (!hunt) {
      throw new NotFoundException();
    }

    const createdTargetProperty =
      await this.targetPropertyService.createTargetProperty({
        huntId,
        adURL,
        sellPrice,
        rentPrice,
        iptu,
        nickname,
        priority,
        realtor,
        realtorContact,
        huntingStage: 'new',
        lotName,
        street,
        lotNumber,
        postalCode,
        neighborhood,
        city,
        uf,
        country,
        lotConvenience,
        block,
        propertyNumber,
        size,
        rooms,
        bathrooms,
        parking,
        is_front,
        sun,
        condoPricing,
        propertyConvenience,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    if (!createdTargetProperty) {
      throw new InternalServerErrorException();
    }

    await this.huntService.addTargetToHunt(huntId, createdTargetProperty.id);

    return createdTargetProperty;
  }

  /**
   * GET
   * @param id
   * @returns InterfaceTargetProperty[]
   */
  @ApiOperation({ summary: 'Busca um imóvel target por id' })
  @ApiResponse({
    type: GetOneTargetPropertySuccess,
    status: 200,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  async getOneTargetProperty(@Param('id') id: string) {
    return await this.targetPropertyService.getOneTargetById(id);
  }

  /**
   * PUT
   * @param id
   * @returns InterfaceTargetProperty
   */
  @ApiOperation({ summary: 'Atualiza um imóvel target' })
  @ApiBody({
    type: TargetProperty,
  })
  @ApiResponse({ type: CreateTargetPropertySuccess, status: 200 })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  async updateTargetProperty(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTargetPropertySchema))
    updateData: UpdateTargetProperty,
  ) {
    return await this.targetPropertyService.updateTargetProperty(id, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * GET
   * @param huntId
   * @returns InterfaceTargetProperty[]
   */
  @ApiOperation({
    summary: 'Busca todos os imóvel targets de uma caçada',
  })
  @ApiResponse({ type: GetTargetPropertiesByHuntSuccess, status: 200 })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/search/:huntId')
  async getAllTargetsByHunt(
    @Param('huntId') huntId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.targetPropertyService.getAllTargetsByHunt(
      huntId,
      page,
      limit,
    );
  }

  /**
   * DELETE
   * @param id
   */
  @ApiOperation({ summary: 'Deleção de um imóvel target' })
  @ApiResponse({
    type: DeleteTargetPropertySuccess,
    status: 200,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteTargetProperty(@Param('id') id: string) {
    const toDelete = await this.targetPropertyService.getOneTargetById(id);
    const deleted = await this.targetPropertyService.deleteTargetProperty(id);

    if (deleted) {
      await this.huntService.removeTargetFromHunt(toDelete.huntId, id);
    }
  }
}
