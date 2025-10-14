import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { AdminGuard } from '@src/shared/guards/admin.guard'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'
import { ZodValidationPipe } from 'src/shared/pipe/zod-validation.pipe'

import {
  AdminCreateUserData,
  CreateUserSuccess
} from '../../schemas/endpoints/admin/create-user.admin.schema'
import { DeleteUserSuccess } from '../../schemas/endpoints/admin/delete-user.admin.schema'
import {
  AdminCreateUser,
  adminCreateUserSchema
} from '../../schemas/endpoints/admin/zod-validation/create-user.admin.zod-validation'
import {
  AdminUpdateUser,
  adminUpdateUserSchema
} from '../../schemas/endpoints/admin/zod-validation/update-user.admin.zod-validation'
import {
  GetAllUsersSuccess,
  GetOneUserSuccess
} from '../../schemas/endpoints/public/get-users.public.schema'
import { UpdateUserData } from '../../schemas/endpoints/public/update-user.public.schema'
import { InterfaceUser } from '../../schemas/models/user.interface'
import { UserService } from '../../services/user.service'

@ApiTags('admin/users')
@ApiBearerAuth()
@UseInterceptors(LoggingInterceptor)
@Controller('admin/users')
@UseGuards(AdminGuard)
export class UsersAdminController {
  constructor(private readonly userService: UserService) {}

  @UsePipes()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiBody({
    type: AdminCreateUserData,
    description: 'Data needed to create new user'
  })
  @ApiResponse({
    type: CreateUserSuccess,
    status: 201,
    description: 'Usuário criado com sucesso'
  })
  @Post('/')
  async createUser(
    @Body(new ZodValidationPipe(adminCreateUserSchema))
    {
      email,
      name,
      familyName,
      cpf,
      accessLevel,
      role,
      profession,
      gender,
      birthDate
    }: AdminCreateUser,
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
        profession,
        gender,
        birthDate
      },
      user.id
    )

    return createdUser
  }

  @UsePipes()
  @ApiBody({
    type: UpdateUserData,
    description: 'Data needed to create new user'
  })
  @Put('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateUserSchema))
    newData: AdminUpdateUser
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

  // TODO: reset password
  // @ApiBody({
  //   type: UpdateUserPassword,
  //   description: 'Data needed to create new user'
  // })
  // @Get('/:id/new-password')
  // async resetPassword(@Param('id') id: string) {
  // // send email to set new password
  // }

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

  @ApiOperation({ summary: 'Busca um usuário por id' })
  @ApiResponse({
    type: GetOneUserSuccess,
    status: 200,
    description: 'Usuário encontrado com sucesso'
  })
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
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id)
  }
}
