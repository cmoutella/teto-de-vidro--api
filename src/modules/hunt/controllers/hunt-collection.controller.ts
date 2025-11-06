import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
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
import { CurrentUser } from '@src/modules/auth/decorators/current-user.decorator'
import { AuthenticatedUser } from '@src/modules/auth/schemas/models/auth.interface'
import { TargetPropertyService } from '@src/modules/targetProperty/services/target-property.service'
import { GetAllUsersSuccess } from '@src/modules/users/schemas/endpoints/public/get-users.public.schema'
import { UserPublicService } from '@src/modules/users/services/user.public.service'
import { AuthGuard } from '@src/shared/guards/auth.guard'

import { LoggingInterceptor } from '../../../shared/interceptors/logging.interceptor'
import { ZodValidationPipe } from '../../../shared/pipe/zod-validation.pipe'
import { CreateHuntSuccess } from '../schemas/endpoints/createHunt'
import { DeleteHuntSuccess } from '../schemas/endpoints/deleteHunt'
import {
  FindHuntByIdSuccess,
  FindHuntsByIdUserSuccess
} from '../schemas/endpoints/getHunts'
import {
  UpdateHuntBody,
  UpdateHuntSuccess
} from '../schemas/endpoints/updateHunt'
import { Hunt } from '../schemas/hunt.schema'
import { HuntInvitationResult } from '../schemas/models/hunt-user.interface'
import {
  CreateHunt,
  createHuntSchema
} from '../schemas/zod-validation/create-hunt.zod-validation'
import {
  UpdateHunt,
  updateHuntSchema,
  UsersInvited,
  usersInvited
} from '../schemas/zod-validation/update-hunt.zod-validation'
import { HuntService } from '../services/hunt-collection.service'

@ApiTags('hunt')
@UseInterceptors(LoggingInterceptor)
@Controller('hunt')
export class HuntController {
  constructor(
    private readonly huntService: HuntService,
    @Inject(forwardRef(() => TargetPropertyService))
    private readonly targetPropertyService: TargetPropertyService,
    @Inject(forwardRef(() => UserPublicService))
    private readonly userService: UserPublicService
  ) {}

  @ApiOperation({ summary: 'Cria uma caça por imóvel' })
  @ApiBody({
    type: Hunt,
    description: 'Dados necessários para criação da hunt'
  })
  @ApiResponse({
    type: CreateHuntSuccess,
    status: 201,
    description: 'Hunt criada com sucesso'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  async createHunt(
    @Body(new ZodValidationPipe(createHuntSchema))
    {
      title,
      livingPeople,
      livingPets,
      movingExpected,
      type,
      minBudget,
      maxBudget
    }: CreateHunt,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return await this.huntService.createHunt({
      title,
      creatorId: user.id,
      participants: 1,
      livingPeople,
      livingPets,
      movingExpected,
      minBudget,
      maxBudget,
      type,
      targets: []
    })
  }

  @ApiOperation({ summary: 'Cria uma caça por imóvel' })
  @ApiBody({
    // type: Hunt,
    description: 'Dados necessários para convidar pessoas para hunt'
  })
  @ApiResponse({
    type: CreateHuntSuccess,
    status: 201,
    description: 'Usuários convidados com sucesso'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post(':id/invite')
  async inviteToHunt(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(usersInvited))
    body: UsersInvited,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const foundHunt = await this.huntService.getOneHuntById(id)

    if (!foundHunt) {
      throw new NotFoundException('Hunt não encontrada')
    }

    const results = await Promise.all(
      body.usersInvited.map(async (invitee) => {
        try {
          // app users
          const alreadyUser = await this.userService.getByEmail(invitee.email)
          if (alreadyUser) {
            const inHunt = await this.huntService.findUserInHunt(
              foundHunt.id,
              alreadyUser.id
            )

            if (inHunt) {
              return {
                email: invitee.email,
                status: 'already-in-hunt',
                message: 'Usuário já faz parte da busca'
              } as HuntInvitationResult
            }

            const invitedToHunt = await this.huntService.addUserToHunt(
              foundHunt.id,
              alreadyUser.id
            )
            if (invitedToHunt) {
              return {
                email: invitee.email,
                status: 'added',
                message: 'Usuário adicionado à busca'
              } as HuntInvitationResult
            }
            return {
              email: invitee.email,
              status: 'error',
              message: 'Erro ao tentat adicionar à busca'
            } as HuntInvitationResult
          }

          // not app users yet
          const invitedToApp = await this.userService.inviteUser(
            invitee,
            user.id
          )
          if (invitedToApp?.id) {
            await this.huntService.addUserToHunt(foundHunt.id, invitedToApp.id)
            return {
              email: invitee.email,
              status: 'invited',
              message: 'Usuário convidado'
            } as HuntInvitationResult
          }

          return {
            email: invitee.email,
            status: 'error',
            message: 'Erro ao convidar usuário'
          } as HuntInvitationResult
        } catch (err) {
          return {
            email: invitee.email,
            status: 'error',
            message: (err as Error).message
          } as HuntInvitationResult
        }
      })
    )

    return results
  }

  @ApiOperation({ summary: 'Busca os participantes da hunt' })
  @ApiResponse({
    type: GetAllUsersSuccess,
    status: 201,
    description: 'Usuários da hunt encontrados com sucesso'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id/participants')
  async getParticipants(@Param('id') id: string) {
    const foundHunt = await this.huntService.getOneHuntById(id)

    if (!foundHunt) {
      throw new NotFoundException('Hunt não encontrada')
    }

    const participants = await this.huntService.getAllUsersInHunt(id)

    const users = await Promise.all(
      participants.map((p) => this.userService.getById(p.userId))
    )

    return users
      .filter((u) => !!u.welcomeCompleted)
      .map((u) => {
        return { name: u.name, familyName: u.familyName, id: u.id }
      })
  }

  @Delete(':id/participants')
  async removeParticipant(
    @Param('id') id: string,
    @Query('userId') userId: string
  ) {
    const removed = await this.huntService.removeUserFromHunt(userId, id)

    return removed
  }

  @ApiOperation({ summary: 'Busca de caçada por id' })
  @ApiResponse({
    type: FindHuntByIdSuccess,
    status: 200,
    description: 'Hunt encontrada com sucesso'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  async getOneHuntById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!id) {
      throw new BadRequestException('É necessário informar a id da hunt')
    }

    const found = await this.huntService.getOneHuntById(id)

    if (!found) {
      throw new NotFoundException('Hunt não encontrada')
    }

    if (user.role !== 'admin') {
      const validated = await this.huntService.validateUserAccess(user.id, id)

      if (!validated) {
        throw new UnauthorizedException('Usuário sem permissão nesta hunt')
      }
    }

    const participants = await this.huntService.getAllUsersInHunt(id)

    const users = await Promise.all(
      participants.map((p) => this.userService.getById(p.userId))
    )

    return {
      ...found,
      huntUsers: users
        .filter((u) => !!u.welcomeCompleted)
        .map((u) => {
          return { name: u.name, familyName: u.familyName, id: u.id }
        })
    }
  }

  @ApiOperation({ summary: 'Atualização de uma caçada' })
  @ApiBody({
    type: UpdateHuntBody,
    description: 'Dados para atualização de uma caçada'
  })
  @ApiResponse({
    type: UpdateHuntSuccess,
    status: 200,
    description: 'Sucesso na atualização da Hunt'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Put(':id')
  async updateHunt(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateHuntSchema))
    updateData: UpdateHunt,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!id) {
      throw new BadRequestException('É necessário informar a id da hunt')
    }

    const found = await this.huntService.getOneHuntById(id)

    if (!found) {
      throw new NotFoundException('A hunt não existe')
    }

    const validated = await this.huntService.validateUserAccess(user.id, id)

    if (!validated) {
      throw new UnauthorizedException('Usuário sem permissão nesta hunt')
    }

    return await this.huntService.updateHunt(id, {
      ...updateData,
      updatedAt: new Date().toISOString()
    })
  }

  @ApiOperation({ summary: 'Busca todas as caçadas de um usuário' })
  @ApiResponse({
    type: FindHuntsByIdUserSuccess,
    status: 200,
    description: 'Hunts do usuário encontradas com sucesso'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('search/user')
  async getAllHuntsByUser(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return await this.huntService.getAllHuntsByUser(user.id, page, limit)
  }

  @ApiOperation({ summary: 'Deleção de uma caçada' })
  @ApiResponse({
    type: DeleteHuntSuccess,
    status: 200,
    description: 'Hunt deletada com sucesso'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteHunt(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (!id) {
      throw new BadRequestException('É necessário informar a id da hunt')
    }

    const toDelete = await this.huntService.getOneHuntById(id)

    if (!toDelete) {
      throw new NotFoundException('Hunt não encontrada')
    }

    const validated = await this.huntService.validateUserAccess(user.id, id)

    if (!validated) {
      throw new UnauthorizedException('Usuário sem permissão nesta hunt')
    }

    const deleted = await this.huntService.deleteHunt(id)

    if (deleted) {
      toDelete.targets.forEach(async (target) => {
        await this.targetPropertyService.deleteTargetProperty(target)
      })
    }
  }
}
