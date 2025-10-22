import {
  BadRequestException,
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
  UnauthorizedException,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { AmenityOf } from '@src/modules/amenity/schemas/models/amenity.interface'
import { AmenityService } from '@src/modules/amenity/services/amenity.service'
import { CurrentUser } from '@src/modules/auth/decorators/current-user.decorator'
import { AuthenticatedUser } from '@src/modules/auth/schemas/models/auth.interface'
import { Comment } from '@src/modules/comments/schemas/comment.schema'
import { CreateCommentData } from '@src/modules/comments/schemas/zod-validation/create'
import { CommentService } from '@src/modules/comments/services/comments.service'
import { AuthGuard } from 'src/shared/guards/auth.guard'

import { LoggingInterceptor } from '../../../shared/interceptors/logging.interceptor'
import { ZodValidationPipe } from '../../../shared/pipe/zod-validation.pipe'
import { HuntService } from '../../hunt/services/hunt-collection.service'
import { CreateTargetPropertySuccess } from '../schemas/endpoints/create'
import { DeleteTargetPropertySuccess } from '../schemas/endpoints/delete'
import {
  GetOneTargetPropertySuccess,
  GetTargetPropertiesByHuntSuccess
} from '../schemas/endpoints/get'
import {
  addressRelatedFields,
  InterfaceTargetProperty,
  TargetAmenity
} from '../schemas/models/target-property.interface'
import { TargetProperty } from '../schemas/target-property.schema'
import {
  CreateTargetProperty,
  createTargetPropertySchema
} from '../schemas/zod-validation/create-target-property.zod-validation'
import {
  targetUpdateRelatedComment,
  CommentPayload,
  UpdateTargetProperty,
  updateTargetPropertySchema
} from '../schemas/zod-validation/update-target-property.zod-validation'
import { TargetPropertyService } from '../services/target-property.service'

@ApiTags('targetProperty')
@UseInterceptors(LoggingInterceptor)
@Controller('target-property')
export class TargetPropertyController {
  constructor(
    private readonly targetPropertyService: TargetPropertyService,
    private readonly huntService: HuntService,
    private readonly amenityService: AmenityService,
    private readonly commentService: CommentService
  ) {}

  @ApiOperation({ summary: 'Cria um novo imóvel target na caçada' })
  @ApiBody({
    type: TargetProperty
  })
  @ApiResponse({
    type: CreateTargetPropertySuccess,
    status: 201,
    description: 'Sucesso ao criar Imóvel de interesse'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  async createTargetProperty(
    @Body(new ZodValidationPipe(createTargetPropertySchema))
    body: CreateTargetProperty,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const {
      huntId,
      adURL,
      sellPrice,
      rentPrice,
      iptu,
      nickname,
      contactName,
      contactWhatzap,
      lotName,
      street,
      noLotNumber,
      lotNumber,
      postalCode,
      neighborhood,
      city,
      uf,
      country,
      targetAmenities,
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
    } = body

    if (!huntId) {
      throw new BadRequestException('É necessário vincular a uma huntId')
    }

    const hunt = await this.huntService.getOneHuntById(huntId)

    if (!hunt) {
      throw new NotFoundException('A hunt informada não existe')
    }

    const hasAccessToHunt = await this.huntService.validateUserAccess(
      user.id,
      hunt.id
    )

    if (!hasAccessToHunt) {
      throw new UnauthorizedException('Usuário sem permissão nesta hunt')
    }

    const targetData = {
      huntId,
      adURL,
      sellPrice,
      rentPrice,
      iptu,
      nickname,
      contactName,
      contactWhatzap,
      huntingStage: 'new',
      lotName,
      street,
      noLotNumber,
      lotNumber,
      postalCode,
      neighborhood,
      city,
      uf,
      country,
      targetAmenities,
      noComplement,
      block,
      propertyNumber,
      size,
      rooms,
      bathrooms,
      parking,
      is_front,
      sun,
      condoPricing,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await this.targetPropertyService.preventDuplicity(targetData as never)

    if (targetAmenities && targetAmenities.length >= 1) {
      this.amenityService.createManyAmenities(
        targetAmenities.map((amenity) => {
          return { identifier: amenity.identifier }
        })
      )
    }

    const createdTargetProperty =
      await this.targetPropertyService.createTargetProperty(targetData as never)

    if (!createdTargetProperty) {
      throw new InternalServerErrorException()
    }

    await this.huntService.addTargetToHunt(huntId, createdTargetProperty.id)

    let amenitiesFullData: TargetAmenity[]
    if (
      createdTargetProperty.targetAmenities &&
      createdTargetProperty.targetAmenities.length >= 1
    ) {
      amenitiesFullData = (await this.amenityService.getCompleteAmenitiesData(
        createdTargetProperty.targetAmenities as never
      )) as never
    }

    return { ...createdTargetProperty, targetAmenities: amenitiesFullData }
  }

  @ApiOperation({ summary: 'Atualiza um imóvel target' })
  @ApiBody({
    type: TargetProperty
  })
  @ApiResponse({ type: CreateTargetPropertySuccess, status: 200 })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  async updateTargetProperty(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTargetPropertySchema))
    body: UpdateTargetProperty
  ) {
    if (!id) {
      throw new BadRequestException('Necessário informar id do target')
    }

    const currentData = await this.targetPropertyService.getOneTargetById(id)

    if (!currentData) {
      throw new NotFoundException('Target não encontrado')
    }

    const changedData: Partial<InterfaceTargetProperty> = {}

    const { target: targetNewData, comment } = body

    for (const key in targetNewData) {
      if (
        targetNewData[key] !== currentData[key] &&
        targetNewData[key] != null &&
        targetNewData[key] != undefined
      ) {
        changedData[key] = targetNewData[key]
      }
    }

    const finalData: InterfaceTargetProperty = {
      ...currentData,
      ...targetNewData,
      updatedAt: new Date().toISOString()
    }

    const hasAddressUpdate = Object.keys(changedData).some((key) =>
      addressRelatedFields.includes(key as never)
    )

    if (hasAddressUpdate) {
      // TODO 1: se o endereço atualizar buscar/criar o novo endereço e atualizar lotId/propertyId no finalData
      // TODO 3: se o lotId/propertyId atualizar, é preciso atualizar a referencia nos comentários
      // TODO 2: fazer uma função no service de comentários para atualizar manyTargetComments
      await this.targetPropertyService.preventDuplicity(finalData)
    }

    if (comment && comment.comment) {
      const commentRelationship = await this.commentService.mountRelationship(
        comment.topic,
        finalData.lotId,
        finalData.propertyId
      )

      const commentData: CreateCommentData = {
        comment: comment.comment,
        author: comment.author,
        authorPrivacy: comment.authorPrivacy ?? 'allowed',
        topic: comment.topic,
        relationship: commentRelationship,
        target: {
          targetId: id,
          stage: finalData.huntingStage
        }
      }

      // TODO: lidar com a falha aqui, o que fazer pra não perder o comentário?
      await this.commentService.createComment(commentData)
    }

    const updatedTargetProperty =
      await this.targetPropertyService.updateTargetProperty(id, finalData)

    if (!updatedTargetProperty) {
      return undefined
    }

    let amenitiesFullData: TargetAmenity[]
    if (
      updatedTargetProperty.targetAmenities &&
      updatedTargetProperty.targetAmenities.length >= 1
    ) {
      amenitiesFullData = (await this.amenityService.getCompleteAmenitiesData(
        updatedTargetProperty.targetAmenities as never
      )) as never
    }

    return {
      ...updatedTargetProperty,
      targetAmenities: amenitiesFullData
    } as InterfaceTargetProperty
  }

  @ApiOperation({ summary: 'Busca um imóvel target por id' })
  @ApiResponse({
    type: GetOneTargetPropertySuccess,
    status: 200
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  async getOneTargetProperty(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Necessário informar id')
    }

    const target = await this.targetPropertyService.getOneTargetById(id)

    if (!target) {
      return undefined
    }

    let amenitiesFullData: TargetAmenity[]
    if (target.targetAmenities && target.targetAmenities.length >= 1) {
      amenitiesFullData = (await this.amenityService.getCompleteAmenitiesData(
        target.targetAmenities as never
      )) as never
    }

    return { ...target, targetAmenities: amenitiesFullData }
  }

  @ApiOperation({ summary: 'Busca os comentários de uma target property' })
  @ApiResponse({ type: Comment, status: 200 })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/:id/comments')
  async getTargetComments(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    if (!id) {
      throw new BadRequestException('Necessário informar id')
    }

    const target = await this.targetPropertyService.getOneTargetById(id)

    if (!target) {
      throw new BadRequestException('Esse target não existe')
    }

    return await this.commentService.getCommentsByTarget(id, page, limit)
  }

  @ApiOperation({ summary: 'Adiciona um comentário à target property' })
  @ApiResponse({ type: Comment, status: 200 })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('/:id/comment')
  async addTargetComment(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(targetUpdateRelatedComment))
    body: CommentPayload
  ) {
    if (!id) {
      throw new BadRequestException('Necessário informar id')
    }

    const target = await this.targetPropertyService.getOneTargetById(id)

    if (!target) {
      throw new BadRequestException('Esse target não existe')
    }

    const commentRelationship = await this.commentService.mountRelationship(
      body.topic,
      target.lotId,
      target.propertyId
    )

    const commentData: CreateCommentData = {
      ...body,
      target: {
        targetId: id,
        stage: target.huntingStage
      },
      relationship: commentRelationship
    }

    return await this.commentService.createComment(commentData)
  }

  @ApiOperation({
    summary: 'Busca todos os imóvel targets de uma caçada'
  })
  @ApiResponse({ type: GetTargetPropertiesByHuntSuccess, status: 200 })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/search/:huntId')
  async getAllTargetsByHunt(
    @Param('huntId') huntId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    if (!huntId) {
      throw new BadRequestException('Necessário informar huntId')
    }

    const { list, ...otherData } =
      await this.targetPropertyService.getAllTargetsByHunt(huntId, page, limit)

    let fixedList = []
    if (list && list.length >= 1) {
      fixedList = await Promise.all(
        list.map(async (listItem: InterfaceTargetProperty) => {
          if (
            listItem.targetAmenities &&
            listItem.targetAmenities.length >= 1
          ) {
            const amenitiesFullData =
              (await this.amenityService.getCompleteAmenitiesData(
                listItem.targetAmenities as never
              )) as never

            return { ...listItem, targetAmenities: amenitiesFullData }
          }

          return listItem
        })
      )
    }

    const response = { ...otherData, list: fixedList }

    return response
  }

  @ApiOperation({ summary: 'Adicionar amenidade a um target' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id/amenity')
  async addAmenityToTarget(
    @Param('id') id: string,
    @Body()
    amenity: TargetAmenity & { label?: string; amenityOf?: AmenityOf }
  ) {
    if (!id) {
      throw new BadRequestException('Necessário informar id do target')
    }

    const toBeUpdated = await this.targetPropertyService.getOneTargetById(id)

    if (!toBeUpdated) {
      throw new NotFoundException('Target não encontrado')
    }

    let toBeAdded
    toBeAdded = await this.amenityService.getOneAmenityById(amenity.identifier)

    if (!toBeAdded) {
      toBeAdded = await this.amenityService.createAmenity({
        identifier: amenity.identifier,
        amenityOf: amenity.amenityOf ?? undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        label: amenity.label ?? undefined
      })
    }

    if (toBeAdded) {
      const added = await this.targetPropertyService.addAmenityToTarget(id, {
        identifier: amenity.identifier,
        reportedBy: amenity.reportedBy,
        userId: amenity.userId
      })

      return { success: added }
    }

    return { success: false }
  }

  @ApiOperation({ summary: 'TODO | Remover amenidade de um target' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id/amenity/:amenity')
  async removeAmenityfromTarget(
    @Param('id') id: string,
    @Param('amenity')
    amenity: string
  ) {
    if (!id) {
      throw new BadRequestException('Necessário informar id do target')
    }

    const toBeUpdated = await this.targetPropertyService.getOneTargetById(id)

    if (!toBeUpdated) {
      throw new NotFoundException('Target não encontrado')
    }

    const removed = await this.targetPropertyService.removeAmenityFromTarget(
      id,
      amenity
    )

    return { success: removed }
  }

  @ApiOperation({ summary: 'Deleção de um imóvel target' })
  @ApiResponse({
    type: DeleteTargetPropertySuccess,
    status: 200
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteTargetProperty(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Necessário informar id do target')
    }

    const toDelete = await this.targetPropertyService.getOneTargetById(id)

    if (!toDelete) {
      throw new NotFoundException('Target não encontrado')
    }

    const deleted = await this.targetPropertyService.deleteTargetProperty(id)

    if (deleted) {
      await this.huntService.removeTargetFromHunt(toDelete.huntId, id)
    }
  }
}
