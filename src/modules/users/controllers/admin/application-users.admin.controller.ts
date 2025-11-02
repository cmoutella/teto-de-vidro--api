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
  ApiBasicAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { AdminGuard } from '@src/shared/guards/admin.guard'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'
import { ZodValidationPipe } from 'src/shared/pipe/zod-validation.pipe'

import { CreateApplicationSuccess } from '../../schemas/endpoints/admin/create-application.admin.schema'
import { DeleteUserSuccess } from '../../schemas/endpoints/admin/delete-user.admin.schema'
import {
  CreateApplication,
  createApplicationSchema
} from '../../schemas/endpoints/admin/zod-validation/create-application-user.admin.zod-validation'
import { GetAllUsersSuccess } from '../../schemas/endpoints/public/get-users.public.schema'
import { ApplicationUserService } from '../../services/application-user.service'

@ApiTags('admin/applications')
@UseInterceptors(LoggingInterceptor)
@ApiBasicAuth()
@UseGuards(AdminGuard)
@Controller('admin/applications')
export class ApplicationUsersController {
  constructor(private readonly userService: ApplicationUserService) {}

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
  @Delete('/:name')
  async deleteApplication(@Param('name') name: string) {
    const app = await this.userService.getByName(name)

    await this.userService.deleteUser(app.id)
  }
}
