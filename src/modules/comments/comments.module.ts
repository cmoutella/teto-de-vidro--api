import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AddressModule } from '../address/address.module'
import { UsersCollectionModule } from '../users/user.module'
import { CommentsController } from './controllers/comments.controller'
import { CommentRepository } from './repositories/comment.repository'
import { CommentMongooseRepository } from './repositories/mongoose/comment.mongoose.repository'
import { Comment, CommentSchema } from './schemas/comment.schema'
import { CommentService } from './services/comments.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    forwardRef(() => UsersCollectionModule),
    forwardRef(() => AddressModule)
  ],
  providers: [
    CommentService,
    {
      provide: CommentRepository,
      useClass: CommentMongooseRepository
    }
  ],
  controllers: [CommentsController],
  exports: [CommentService]
})
export class CommentsCollectionModule {}
