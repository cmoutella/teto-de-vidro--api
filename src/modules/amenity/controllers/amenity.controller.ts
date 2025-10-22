import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UsePipes
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AMENITY_FROM } from '@src/shared/const'
import { AuthGuard } from '@src/shared/guards/auth.guard'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'
import { ZodValidationPipe } from 'src/shared/pipe/zod-validation.pipe'
import { z } from 'zod'

import { Amenity } from '../schemas/amenity.schema'
import { AmenityService } from '../services/amenity.service'

const createAmenitySchema = z.object({
  identifier: z.string(),
  label: z.string().optional(),
  amenityOf: z.enum(AMENITY_FROM).optional()
})

type CreateAmenity = z.infer<typeof createAmenitySchema>

@ApiTags('amenity')
@UseInterceptors(LoggingInterceptor)
@Controller('amenity')
export class AmenitiesController {
  constructor(private readonly amenityService: AmenityService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(createAmenitySchema))
  @ApiOperation({ summary: 'Cria uma nova amenity' })
  @ApiBody({
    type: Amenity,
    description: 'Data needed to create new user'
  })
  // TODO:
  // @ApiResponse({
  //   type: CreateUserSuccess,
  //   status: 201,
  //   description: 'Usuário criado com sucesso'
  // })
  // @ApiResponse({
  //   type: CreateUserFailureException,
  //   status: 409,
  //   description: 'Nome de usuário já existe'
  // })
  @Post()
  async createAmenity(
    @Body()
    { identifier, label, amenityOf }: CreateAmenity
  ) {
    return await this.amenityService.createAmenity({
      identifier,
      label,
      amenityOf,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Atualiza uma amenity' })
  @ApiBody({
    type: Amenity,
    description: 'Data needed to create new user'
  })
  // TODO:
  // @ApiResponse({
  //   type: CreateUserSuccess,
  //   status: 201,
  //   description: 'Usuário criado com sucesso'
  // })
  // @ApiResponse({
  //   type: CreateUserFailureException,
  //   status: 409,
  //   description: 'Nome de usuário já existe'
  // })
  @Put(':id')
  async updateAmenity(
    @Param('id') id: string,
    @Body()
    body: Partial<Amenity>
  ) {
    const found = await this.amenityService.getOneAmenityById(id)

    if (!found) {
      throw new NotFoundException()
    }

    return await this.amenityService.updateAmenity(id, {
      ...body,
      updatedAt: new Date().toISOString()
    })
  }

  @ApiOperation({ summary: 'Busca amenidades por id' })
  // TODO:
  // @ApiResponse({
  //   type: GetOneUserSuccess,
  //   status: 200,
  //   description: 'Usuário encontrado com sucesso'
  // })
  @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  @Get('/:id')
  async getById(@Param('id') id: string) {
    const found = await this.amenityService.getOneAmenityById(id)

    return found
  }

  @ApiOperation({ summary: 'Deleta uma amenity por id' })
  // TODO:
  // @ApiResponse({
  //   type: DeleteUserSuccess,
  //   status: 200,
  //   description: 'Usuário deletado com sucesso'
  // })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.amenityService.deleteAmenity(id)
  }
}
