import {
  BadGatewayException,
  BadRequestException,
  Body,
  ConflictException,
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
import { UserAdminService } from '../../services/user.admin.service'

@ApiTags('admin/users')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('admin/users')
export class UsersAdminController {
  constructor(private readonly userAdminService: UserAdminService) {}

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
    @CurrentUser() adminUser: AuthenticatedUser
  ) {
    if (!email) {
      throw new BadRequestException('Email or password missing')
    }

    if (!name) {
      throw new BadRequestException('Name is required')
    }

    const existingUserEmail = await this.userAdminService.getByEmail(email)

    if (existingUserEmail) {
      throw new ConflictException('Email já cadastrado')
    }

    const createdUser = await this.userAdminService.createUser(
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
      adminUser.id
    )

    return createdUser
  }

  @UsePipes()
  @ApiOperation({ summary: 'Atualiza dados de um usuário' })
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
      const existingUser = await this.userAdminService.getById(id)

      if (!existingUser) {
        throw new NotFoundException('User not found')
      }

      const data = await this.userAdminService.updateUser(id, newData)

      if (!data) {
        throw new BadGatewayException()
      }

      return data
    } catch (err) {
      console.error('ERROR @ User Admin Controler | data update')

      if (err instanceof NotFoundException) {
        throw err
      }
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
    return await this.userAdminService.getAllUsers()
  }

  @ApiOperation({ summary: 'Busca um usuário por email' })
  @ApiResponse({
    type: GetOneUserSuccess,
    status: 200,
    description: 'Usuário encontrado com sucesso'
  })
  @Get('/:email')
  async getByEmail(@Param('email') email: string) {
    const foundUser = await this.userAdminService.getByEmail(email)

    if (!foundUser) {
      throw new NotFoundException('Usuário não encontrado')
    }

    return foundUser
  }

  @ApiOperation({ summary: 'Busca um usuário por cpf' })
  @ApiResponse({
    type: GetOneUserSuccess,
    status: 200,
    description: 'Usuário encontrado com sucesso'
  })
  @Get('/cpf/:cpf')
  async getByCPF(@Param('cpf') cpf: string) {
    const foundUser = await this.userAdminService.getByCPF(cpf)

    if (!foundUser) {
      throw new NotFoundException('Usuário não encontrado')
    }

    return foundUser
  }

  @ApiOperation({ summary: 'Deleta um usuário por id' })
  @ApiResponse({
    type: DeleteUserSuccess,
    status: 200,
    description: 'Usuário deletado com sucesso'
  })
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userAdminService.deleteUser(id)
  }
}
