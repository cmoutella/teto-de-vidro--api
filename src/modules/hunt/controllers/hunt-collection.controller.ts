import {
  Body,
  Controller,
  Delete,
  Get,
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
import { HuntService } from '../services/hunt-collection.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Hunt } from '../schemas/hunt.schema';
import { CreateHuntSuccess } from '../schemas/endpoints/createHunt';
import {
  FindHuntByIdSuccess,
  FindHuntsByIdUserSuccess,
} from '../schemas/endpoints/getHunts';
import { DeleteHuntSuccess } from '../schemas/endpoints/deleteHunt';
import {
  UpdateHuntBody,
  UpdateHuntSuccess,
} from '../schemas/endpoints/updateHunt';
import { AuthGuard } from 'src/shared/guards/auth.guard';

const CONTRACT_TYPE = ['buy', 'rent', 'either'] as const;

const createHuntSchema = z.object({
  creatorId: z.string(),
  invitedUsers: z.array(z.string()).optional(),
  title: z.string().optional(),
  movingExpected: z.string().optional(),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  livingPeople: z.number().optional(),
  livingPets: z.number().optional(),
  type: z.enum(CONTRACT_TYPE).optional(),
});

type CreateHunt = z.infer<typeof createHuntSchema>;

const updateHuntSchema = z.object({
  invitedUsers: z.array(z.string()).optional(),
  title: z.string().optional(),
  movingExpected: z.string().optional(),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  livingPeople: z.number().optional(),
  livingPets: z.number().optional(),
  type: z.enum(CONTRACT_TYPE).optional(),
});

type UpdateHunt = z.infer<typeof updateHuntSchema>;

@ApiTags('hunt')
@UseInterceptors(LoggingInterceptor)
@Controller('hunt')
export class HuntController {
  constructor(private readonly huntService: HuntService) {}

  /**
   * CREATE
   * @returns InterfaceHunt
   */
  @ApiOperation({ summary: 'Cria uma caça por imóvel' })
  @ApiBody({
    type: Hunt,
    description: 'Dados necessários para criação da hunt',
  })
  @ApiResponse({
    type: CreateHuntSuccess,
    status: 201,
    description: 'Hunt criada com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(createHuntSchema))
  @Post()
  async createHunt(
    @Body()
    {
      title,
      creatorId,
      invitedUsers,
      livingPeople,
      livingPets,
      movingExpected,
      type,
      minBudget,
      maxBudget,
    }: CreateHunt,
  ) {
    return await this.huntService.createHunt({
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title,
      creatorId,
      invitedUsers,
      livingPeople,
      livingPets,
      movingExpected,
      minBudget,
      maxBudget,
      type,
      targets: [],
    });
  }

  /**
   * GET
   * @params id
   * @returns InterfaceHunt
   */
  @ApiOperation({ summary: 'Busca de caçada por id' })
  @ApiResponse({
    type: FindHuntByIdSuccess,
    status: 200,
    description: 'Hunt encontrada com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  async getOneHuntById(@Param('id') id: string) {
    return await this.huntService.getOneHuntById(id);
  }

  /**
   * PUT
   * @params id
   * @returns InterfaceHunt
   */
  @ApiOperation({ summary: 'Atualização de uma caçada' })
  @ApiBody({
    type: UpdateHuntBody,
    description: 'Dados para atualização de uma caçada',
  })
  @ApiResponse({
    type: UpdateHuntSuccess,
    status: 200,
    description: 'Sucesso na atualização da Hunt',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  async updateHunt(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateHuntSchema))
    updateData: UpdateHunt,
  ) {
    return await this.huntService.updateHunt(id, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * GET
   * @params userId
   * @returns InterfaceHunt
   */
  @ApiOperation({ summary: 'Busca todas as caçadas de um usuário' })
  @ApiResponse({
    type: FindHuntsByIdUserSuccess,
    status: 200,
    description: 'Hunts do usuário encontradas com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('search/:userId')
  async getAllHuntsByUser(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.huntService.getAllHuntsByUser(userId, page, limit);
  }

  /**
   * DELETE
   * @params id
   */
  @ApiOperation({ summary: 'Deleção de uma caçada' })
  @ApiResponse({
    type: DeleteHuntSuccess,
    status: 200,
    description: 'Hunt deletada com sucesso',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteHunt(@Param('id') id: string) {
    await this.huntService.deleteHunt(id);
  }
}
