import type { InterfaceComment } from '../../schemas/models/comment.interface'

export const mockCreateComment: Omit<
  InterfaceComment,
  'id' | 'createdAt' | 'updatedAt'
> = {
  comment: 'Meu comentário sobre propriedade',
  author: 'author-123',
  authorPrivacy: 'allowed',
  validation: 'waiting',
  topic: 'property',
  relationship: {
    relativeTo: 'property',
    relativeId: 'property-123'
  },
  target: {
    targetId: 'target-123',
    stage: 'visited'
  }
}
