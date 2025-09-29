import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
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
export class AccessLevelPoliciessController {
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
    const found = await this.accessPoliciesService.getByLevel(body.level)

    if (found) {
      throw new ConflictException('Level de acesso já cadastrado')
    }

    return await this.accessPoliciesService.createAccessLevelPolicies(
      body as AccessLevelPoliciesInterface
    )
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
  @Put(':level')
  async updateAccessLevelPolicies(
    @Param('level') level: number,
    @Body(new ZodValidationPipe(updateLevelPoliciesSchema))
    body: CreateLevelPoliciesData
  ) {
    const found = await this.accessPoliciesService.getByLevel(level)

    if (!found) {
      throw new NotFoundException()
    }

    return await this.accessPoliciesService.updateAccessLevelPolicies(
      level,
      body as Partial<AccessLevelPoliciesInterface>
    )
  }

  @ApiOperation({ summary: 'Busca policies por level de acesso' })
  @ApiResponse({
    type: PoliciesByLevelSuccess,
    status: 200,
    description: 'Políticas encontradas para o nível'
  })
  @Get('/:level')
  async getByLevel(@Param('level') level: number) {
    return await this.accessPoliciesService.getByLevel(level)
  }

  @ApiOperation({ summary: 'Deleta policies para o level de acesso' })
  @Delete(':level')
  async deleteAccessLevelPolicies(@Param('level') level: number) {
    await this.accessPoliciesService.deleteAccessLevelPolicies(level)
  }
}
