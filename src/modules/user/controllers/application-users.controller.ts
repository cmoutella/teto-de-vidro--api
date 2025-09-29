import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { AdminGuard } from '@src/shared/guards/admin.guard'
import { AuthGuard } from 'src/shared/guards/auth.guard'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'
import { ZodValidationPipe } from 'src/shared/pipe/zod-validation.pipe'

import { CreateApplicationSuccess } from '../schemas/endpoints/createApplication'
import { DeleteUserSuccess } from '../schemas/endpoints/deleteUser'
import { GetAllUsersSuccess } from '../schemas/endpoints/getUsers'
import {
  CreateApplication,
  createApplicationSchema
} from '../schemas/zod-validation/create-application-user.zod-validation'
import { ApplicationUserService } from '../services/application-user.service'

@ApiTags('applications')
@UseInterceptors(LoggingInterceptor)
@Controller('applications')
export class ApplicationUsersController {
  constructor(private readonly userService: ApplicationUserService) {}

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UsePipes(new ZodValidationPipe(createApplicationSchema))
  @ApiOperation({ summary: 'Cria uma nova aplicação' })
  @ApiResponse({
    type: CreateApplicationSuccess,
    status: 201,
    description: 'Aplicação criada com sucesso'
  })
  @Post('/')
  async createApplication(
    @Body()
    { email, name }: CreateApplication
  ) {
    try {
      const createdApplication = await this.userService.createApplication({
        email,
        name
      })

      if (!createdApplication) {
        throw new InternalServerErrorException()
      }

      return createdApplication
    } catch (err) {
      return err
    }
  }

  // TODO: reset password

  @ApiOperation({ summary: 'Lista as applicações registradas' })
  @ApiResponse({
    type: GetAllUsersSuccess,
    status: 200,
    description: 'Applicações encontradas com sucesso'
  })
  @Get('/')
  async listApplications() {
    return await this.userService.listApplications()
  }

  @ApiOperation({ summary: 'Deleta uma aplicação por id' })
  @ApiResponse({
    type: DeleteUserSuccess,
    status: 200,
    description: 'Aplicação deletada com sucesso'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('/:name')
  async deleteApplication(@Param('name') name: string) {
    const app = await this.userService.getByName(name)

    await this.userService.deleteUser(app.id)
  }
}
