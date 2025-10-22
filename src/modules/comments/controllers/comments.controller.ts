import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Put,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@src/shared/guards/auth.guard'
import { differenceInMinutes } from 'date-fns'
import { LoggingInterceptor } from 'src/shared/interceptors/logging.interceptor'
import { ZodValidationPipe } from 'src/shared/pipe/zod-validation.pipe'
import { z } from 'zod'

import { Comment } from '../schemas/comment.schema'
import { InterfaceComment } from '../schemas/models/comment.interface'
import { updateCommentSchema } from '../schemas/zod-validation/update'
import { CommentService } from '../services/comments.service'

type UpdateComment = z.infer<typeof updateCommentSchema>

@ApiTags('comments')
@UseInterceptors(LoggingInterceptor)
@Controller('comment')
export class CommentsController {
  constructor(private readonly commentService: CommentService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Atualiza um comentário' })
  @ApiBody({
    type: Comment,
    description: 'Payload da atualização de um comentário'
  })
  // TODO:
  // @ApiResponse({
  //   type: CreateUserSuccess,
  //   status: 201,
  //   description: 'Usuário criado com sucesso'
  // })
  // @ApiResponse({
  //   type: CreateUserFailureException,
  //   status: 409,
  //   description: 'Nome de usuário já existe'
  // })
  @Put(':id')
  async updateComment(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCommentSchema))
    body: UpdateComment
  ) {
    console.log('hello', body)

    const found = await this.commentService.getOneCommentById(id)

    if (!found) {
      throw new NotFoundException()
    }

    const creationAgo = differenceInMinutes(
      new Date(),
      new Date(found.createdAt)
    )
    if (creationAgo > 15) {
      throw new BadRequestException('Tempo de alteração expirado')
    }

    return await this.commentService.updateComment(
      id,
      body as Partial<InterfaceComment>
    )
  }

  @ApiOperation({ summary: 'Busca comentário por id' })
  // TODO:
  // @ApiResponse({
  //   type: GetOneCommentSuccess,
  //   status: 200,
  //   description: 'Comentário encontrado com sucesso'
  // })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/:id')
  async getById(@Param('id') id: string) {
    return await this.commentService.getOneCommentById(id)
  }

  @ApiOperation({ summary: 'Deleta um comentário por id' })
  // TODO:
  // @ApiResponse({
  //   type: DeleteUserSuccess,
  //   status: 200,
  //   description: 'Comentário deletado com sucesso'
  // })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    await this.commentService.deleteComment(id)
  }
}
