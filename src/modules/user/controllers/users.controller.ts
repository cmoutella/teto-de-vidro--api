import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
} from '../schemas/endpoints/createUser'
import { DeleteUserSuccess } from '../schemas/endpoints/deleteUser'
import {
  GetAllUsersSuccess,
  GetOneUserSuccess
} from '../schemas/endpoints/getUsers'
import { InviteUserSchema } from '../schemas/endpoints/inviteUser'
import { InterfaceUser } from '../schemas/models/user.interface'
import { User } from '../schemas/user.schema'
import {
  CreateUser,
  createUserSchema
} from '../schemas/zod-validation/create-user.zod-validation'
import {
  InviteUser,
  inviteUserSchema
} from '../schemas/zod-validation/invite-user.zod-validation'
import { UserService } from '../services/user.service'

@ApiTags('user')
@UseInterceptors(LoggingInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes(new EncryptPasswordPipe())
  @UsePipes(new ZodValidationPipe(createUserSchema))
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
  @Post()
  async createUser(
    @Body()
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
    }: CreateUser
  ) {
    const createdUser = await this.userService.createUser({
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
    })

    return createdUser
  }

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
  @Post('invite')
  async inviteUser(
    @Body(new ZodValidationPipe(inviteUserSchema))
    invitedUser: InviteUser,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (
      user.role !== 'admin' &&
      user.role !== 'master' &&
      user.role !== 'tester' &&
      user.role !== 'beta' &&
      user.accessLevel === 0
    ) {
      throw new UnauthorizedException('Sem autorização para convidar usuários')
    }

    return await this.userService.inviteUser(invitedUser, user.id)
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes()
  @ApiOperation({
    summary:
      'Busca quantos usuários foram convidados por um determinado usuário'
  })
  @Get(':id/invites')
  async countInvitesSent(@CurrentUser() user: AuthenticatedUser) {
    const invites = await this.userService.countInvitations(user.id)

    return { invitesSent: invites }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UsePipes()
  @Get(':id/permissions')
  async getUserPermissions(@CurrentUser() user: AuthenticatedUser) {
    const permissions = await this.userService.getUserPermissions(user.id)

    return permissions
  }

  // TODO: update user

  // TODO: update email

  // TODO: update password

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
}
