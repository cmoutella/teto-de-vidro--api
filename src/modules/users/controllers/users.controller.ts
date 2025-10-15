import {
  BadGatewayException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UnauthorizedException,
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
import { CurrentUser } from '@src/modules/auth/decorators/current-user.decorator'
import { AuthenticatedUser } from '@src/modules/auth/schemas/models/auth.interface'
import { AuthGuard } from 'src/shared/guards/auth.guard'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'
import { ZodValidationPipe } from 'src/shared/pipe/zod-validation.pipe'

import { EncryptPasswordPipe } from '../pipe/password.pipe'
import {
  CreateUserFailureException,
  CreateUserSuccess
} from '../schemas/endpoints/public/create-user.public.schema'
import { GetOneUserSuccess } from '../schemas/endpoints/public/get-users.public.schema'
import { InviteUserSchema } from '../schemas/endpoints/public/invite-user.public.schema'
import {
  InitialUpdateUserData,
  UpdateUserData,
  UpdateUserPassword
} from '../schemas/endpoints/public/update-user.public.schema'
import {
  InviteUser,
  inviteUserSchema
} from '../schemas/endpoints/public/zod-validation/invite-user.public.zod-validation'
import {
  ChangePassword,
  changePasswordSchema,
  InitialUpdateUser,
  initialUpdateUserSchema,
  UpdateUser,
  updateUserSchema
} from '../schemas/endpoints/public/zod-validation/update-user.public.zod-validation'
import { UserPublicService } from '../services/user.public.service'

@ApiTags('user')
@UseInterceptors(LoggingInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserPublicService) {}

  @UseGuards(AuthGuard)
  @UsePipes()
  @ApiOperation({ summary: 'Atualiza dados do usuário' })
  @ApiBody({
    type: UpdateUserData,
    description: 'Data needed to create new user'
  })
  @Put('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserSchema))
    newData: UpdateUser
  ) {
    try {
      const data = await this.userService.updateUser(id, newData)

      if (!data) {
        throw new BadGatewayException()
      }

      return data
    } catch (_err) {
      console.error('ERROR @ User Controler | data update')
    }
  }

  @UseGuards(AuthGuard)
  @UsePipes()
  @ApiOperation({
    summary: 'Update dos dados do usuario no fluxo de boas vindas'
  })
  @ApiBody({
    type: InitialUpdateUserData,
    description: 'Data needed to create new user'
  })
  @Put('/:id/initial-update')
  async updateUserInitialSetup(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(initialUpdateUserSchema))
    { cpf, birthDate }: InitialUpdateUser
  ) {
    try {
      const data = await this.userService.initialUserDataUpdate(id, {
        cpf,
        birthDate
      })

      if (!data) {
        throw new BadGatewayException()
      }

      return data
    } catch (_err) {
      console.error('ERROR @ User Controler | initial update')
    }
  }

  @UseGuards(AuthGuard)
  @UsePipes()
  @ApiOperation({ summary: 'Atualização de senha do usuário' })
  @ApiBody({
    type: UpdateUserPassword,
    description: 'Data needed to create new user'
  })
  @Put('/:id/new-password')
  async updateUserPassword(
    @Param('id') id: string,
    @Body(
      new ZodValidationPipe(changePasswordSchema),
      new EncryptPasswordPipe()
    )
    { password }: ChangePassword
  ) {
    try {
      const data = await this.userService.updateUserPassword(id, {
        password
      })

      if (!data) {
        throw new BadGatewayException()
      }

      return data
    } catch (_err) {
      console.error('ERROR @ User Controler | password update')
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes()
  @ApiOperation({ summary: 'Retorna as permissões do usuário' })
  @Get(':id/permissions')
  async getUserPermissions(@CurrentUser() user: AuthenticatedUser) {
    const permissions = await this.userService.getUserPermissions(user.id)

    return permissions
  }

  // TODO: update email

  @ApiOperation({ summary: 'Busca usuários por id' })
  @ApiResponse({
    type: GetOneUserSuccess,
    status: 200,
    description: 'Usuário encontrado com sucesso'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/:id')
  async getById(@Param('id') id: string) {
    try {
      const foundUser = await this.userService.getById(id)

      if (!foundUser) {
        throw new NotFoundException('Usuário não encontrado')
      }

      return foundUser
    } catch (err) {
      console.log('Problem @ User Controller | get by id')

      if (err instanceof Error) {
        throw err
      }
    }
  }

  // INVITATIONS
  @ApiBody({
    type: InviteUserSchema,
    description: 'Data needed to invite new user'
  })
  @ApiResponse({
    type: CreateUserSuccess,
    status: 201,
    description: 'Usuário convidado criado com sucesso'
  })
  @ApiResponse({
    type: CreateUserFailureException,
    status: 409,
    description: 'Email já cadastrado'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes()
  @ApiOperation({ summary: 'Convida um novo usuário' })
  @Post('/invite')
  async inviteUser(
    @Body(new ZodValidationPipe(inviteUserSchema))
    invitedUser: InviteUser,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (
      user.role !== 'admin' &&
      user.role !== 'master' &&
      user.role !== 'tester' &&
      // user.role !== 'beta' &&
      user.accessLevel === 0
    ) {
      throw new UnauthorizedException('Sem autorização para convidar usuários')
    }

    const host = await this.getById(user.id)

    if (!host) {
      throw new UnauthorizedException('Host não encontrado')
    }

    const hostLevelPermissions = await this.userService.getUserPermissions(
      user.id
    )

    if (hostLevelPermissions.invitationsLimit <= 0) {
      throw new UnauthorizedException('Host sem convites disponíveis')
    }

    const existingUserEmail = await this.userService.getByEmail(user.email)
    if (existingUserEmail) {
      throw new ConflictException('Email já cadastrado')
    }

    return await this.userService.inviteUser(invitedUser, user.id)
  }

  @ApiOperation({ summary: 'Valida um convite' })
  @Get('/validate-invite/:invitation')
  async validateUserInvitation(@Param('invitation') invitation: string) {
    const invitationData = await this.userService.validateInvitation(invitation)

    if (!invitationData) {
      throw new NotFoundException()
    }

    const data = {
      invitationId: invitationData.invite.id,
      welcomeCompleted: invitationData.invitedUser.welcomeCompleted,
      user: {
        name: invitationData.invitedUser.name,
        id: invitationData.invitedUser.id
      }
    }

    return data
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes()
  @ApiOperation({
    summary:
      'Busca quantos usuários foram convidados por um determinado usuário'
  })
  @Get('/:id/invites')
  async countInvitesSent(@Param('id') id: string) {
    const invites = await this.userService.countInvitations(id)

    return { invitesSent: invites }
  }
}
