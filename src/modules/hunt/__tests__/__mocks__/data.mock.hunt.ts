import { Types } from 'mongoose'

import type { InterfaceHunt } from '../../schemas/models/hunt.interface'
import type { CreateHunt } from '../../schemas/zod-validation/create-hunt.zod-validation'

export const userId = 'user-123'

export const baseHunt: CreateHunt = {
  type: 'rent',
  title: 'Minha mudança',
  movingExpected: 'soon'
}

export const userObjectId = new Types.ObjectId().toHexString()
export const huntObjectId = new Types.ObjectId().toHexString()
export const mockTargets = ['target-1', 'target-2']
export const huntMock: InterfaceHunt = {
  creatorId: userObjectId,
  type: 'buy',
  title: 'Test Hunt',
  movingExpected: 'soon',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
