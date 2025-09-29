import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  UseInterceptors
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'
import { ZodValidationPipe } from 'src/shared/pipe/zod-validation.pipe'

import { AccessLevelPolicies } from '../schema/accessLevelPolicies.schema'
import { PoliciesByLevelSuccess } from '../schema/endpoints/getOne'
import { AccessLevelPoliciesInterface } from '../schema/model/access-policies.interface'
import {
  CreateLevelPoliciesData,
  createLevelPoliciesSchema
} from '../schema/zod-validation/create'
import { updateLevelPoliciesSchema } from '../schema/zod-validation/update'
import { AccessLevelPoliciesService } from '../services/access-level-policies.service'

@ApiTags('Level de Acesso: Policies')
@UseInterceptors(LoggingInterceptor)
// @UseGuards(AdminGuard)
@Controller('access-policies')
export class AccessLevelPoliciesController {
  constructor(
    private readonly accessPoliciesService: AccessLevelPoliciesService
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza um comentário' })
  @ApiBody({
    type: AccessLevelPolicies,
    description: 'Payload da atualização de policies'
  })
  @ApiResponse({
    type: PoliciesByLevelSuccess,
    status: 201,
    description: 'Usuário criado com sucesso'
  })
  @Post()
  async createAccessLevelPolicies(
    @Body(new ZodValidationPipe(createLevelPoliciesSchema))
    body: CreateLevelPoliciesData
  ) {
    try {
      const found = await this.accessPoliciesService.getByLevel(body.level)

      if (found) {
        throw new ConflictException('Level de acesso já cadastrado')
      }

      const created =
        await this.accessPoliciesService.createAccessLevelPolicies(
          body as AccessLevelPoliciesInterface
        )

      return created
    } catch (_err) {
      console.error('Erro ao cadastrar políticas de acesso')
    }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza um comentário' })
  @ApiBody({
    type: AccessLevelPolicies,
    description: 'Payload da atualização de policies'
  })
  @ApiResponse({
    type: PoliciesByLevelSuccess,
    status: 200,
    description: 'Políticas encontradas para o nível'
  })
  @Put('/:level')
  async updateAccessLevelPolicies(
    @Param('level') level: number,
    @Body(new ZodValidationPipe(updateLevelPoliciesSchema))
    body: CreateLevelPoliciesData
  ) {
    try {
      const found = await this.accessPoliciesService.getByLevel(level)

      if (!found) {
        throw new NotFoundException()
      }

      const updated =
        await this.accessPoliciesService.updateAccessLevelPolicies(
          level,
          body as Partial<AccessLevelPoliciesInterface>
        )

      return updated
    } catch (_err) {
      console.error('Erro atualizando políticas de acesso')
    }
  }

  @ApiOperation({ summary: 'Busca policies por level de acesso' })
  @ApiResponse({
    type: PoliciesByLevelSuccess,
    status: 200,
    description: 'Políticas encontradas para o nível'
  })
  @Get('/:level')
  async getByLevel(@Param('level') level: number) {
    try {
      const found = await this.accessPoliciesService.getByLevel(level)

      if (!found) {
        throw new NotFoundException('Level não encontrado')
      }

      return found
    } catch (err) {
      console.error('Erro buscando políticas de acesso')
      if (err instanceof NotFoundException) {
        throw err
      }

      throw new InternalServerErrorException('Erro interno do servidor')
    }
  }

  @ApiOperation({ summary: 'Deleta policies para o level de acesso' })
  @Delete('/:level')
  async deleteAccessLevelPolicies(@Param('level') level: number) {
    console.log('oxi')

    try {
      const deleted =
        await this.accessPoliciesService.deleteAccessLevelPolicies(level)

      return deleted
    } catch (_err) {
      console.error('Error deletando política de acesso')
    }
  }
}
