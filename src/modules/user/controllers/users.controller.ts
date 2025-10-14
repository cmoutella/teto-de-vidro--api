import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
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
import { DeleteUserSuccess } from '../schemas/endpoints/admin/delete-user.admin.schema'
import {
  CreateUserFailureException,
  CreateUserSuccess
} from '../schemas/endpoints/public/create-user.public.schema'
import {
  GetAllUsersSuccess,
  GetOneUserSuccess
} from '../schemas/endpoints/public/get-users.public.schema'
import { InviteUserSchema } from '../schemas/endpoints/public/invite-user.public.schema'
import {
  InitialUpdateUserData,
  UpdateUserData,
  UpdateUserPassword
} from '../schemas/endpoints/public/update-user.public.schema'
import {
  CreateUser,
  createUserSchema
} from '../schemas/endpoints/public/zod-validation/create-user.public.zod-validation'
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
import { InterfaceUser } from '../schemas/models/user.interface'
import { User } from '../schemas/user.schema'
import { UserService } from '../services/user.service'

@ApiTags('user')
@UseInterceptors(LoggingInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiBody({
    type: User,
    description: 'Data needed to create new user'
  })
  @ApiResponse({
    type: CreateUserSuccess,
    status: 201,
    description: 'Usuário criado com sucesso'
  })
  @ApiResponse({
    type: CreateUserFailureException,
    status: 409,
    description: 'Email ou CPF já cadastrado'
  })
  @Post('/')
  async createUser(
    @Body(new ZodValidationPipe(createUserSchema), new EncryptPasswordPipe())
    {
      email,
      name,
      familyName,
      cpf,
      accessLevel,
      role,
      password,
      profession,
      gender,
      birthDate
    }: CreateUser,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const createdUser = await this.userService.createUser(
      {
        email,
        name,
        familyName,
        cpf,
        accessLevel,
        role,
        password,
        profession,
        gender,
        birthDate
      },
      user.id
    )

    return createdUser
  }

  @UseGuards(AuthGuard)
  @UsePipes()
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
  @ApiBody({
    type: UpdateUserPassword,
    description: 'Data needed to create new user'
  })
  @Put('/:id/new-password')
  async updateUserPassword(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(changePasswordSchema))
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
  @Get(':id/permissions')
  async getUserPermissions(@CurrentUser() user: AuthenticatedUser) {
    const permissions = await this.userService.getUserPermissions(user.id)

    return permissions
  }

  // TODO: update email

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Busca por todos os usuários' })
  @ApiResponse({
    type: GetAllUsersSuccess,
    status: 200,
    description: 'Usuários encontrados com sucesso'
  })
  @Get()
  async getAllUsers() {
    return await this.userService.getAllUsers()
  }

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
    const { password, ...data } = await this.userService.getById(id)

    const user: Omit<InterfaceUser, 'password'> = {
      ...data
    }
    return user
  }

  @ApiOperation({ summary: 'Deleta um usuário por id' })
  @ApiResponse({
    type: DeleteUserSuccess,
    status: 200,
    description: 'Usuário deletado com sucesso'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id)
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

    return await this.userService.inviteUser(invitedUser, user.id)
  }

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
