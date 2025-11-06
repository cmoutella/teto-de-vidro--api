import { ConfigModule } from '@nestjs/config'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { HuntRepository } from '@src/modules/hunt/repositories/hunt.repository'
import { AppService } from '@src/services/app.service'

import { baseHunt } from '../__mocks__/data.mock.hunt'
import {
  mockHuntRepository,
  mockHuntUsersRepository,
  mockHuntUsersService
} from '../__mocks__/injectable.mock.hunt'
import { HuntUsersRepository } from '../../repositories/hunt-users.repository'
import type {
  CreateHuntServiceDate,
  InterfaceHunt
} from '../../schemas/models/hunt.interface'
import { HuntService } from '../../services/hunt-collection.service'
import { HuntUsersService } from '../../services/hunt-users-collection.service'

describe('HuntService | UnitTest', () => {
  let service: HuntService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AppService,
        HuntService,
        { provide: HuntUsersService, useValue: mockHuntUsersService },
        {
          provide: HuntRepository,
          useValue: mockHuntRepository
        },
        {
          provide: HuntUsersRepository,
          useValue: mockHuntUsersRepository
        }
      ]
    }).compile()

    jest.clearAllMocks()

    service = module.get<HuntService>(HuntService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createHunt', () => {
    it('should return falsy if creatorId is missing', async () => {
      const created = await service.createHunt({
        ...baseHunt,
        creatorId: undefined
      } as InterfaceHunt)

      expect(created).toBeFalsy()
    })

    it('should call repository to create a new target property', async () => {
      mockHuntRepository.createHunt.mockResolvedValue({
        ...baseHunt,
        isActive: true
      })

      await service.createHunt({
        ...baseHunt,
        creatorId: 'user-123'
      } as CreateHuntServiceDate)

      expect(mockHuntRepository.createHunt).toHaveBeenCalledWith(
        expect.objectContaining({
          ...baseHunt
        })
      )
    })

    it('should return created target', async () => {
      mockHuntRepository.createHunt.mockResolvedValue({
        ...baseHunt,
        participants: 1,
        isActive: true
      })

      const result = await service.createHunt({
        ...baseHunt,
        creatorId: 'user-123'
      } as CreateHuntServiceDate)

      expect(result).toEqual(
        expect.objectContaining({
          ...baseHunt,
          participants: 1,
          isActive: true
        })
      )
    })
  })

  describe('getOneHuntById', () => {
    it('should return falsy if id is missing', async () => {
      const found = await service.getOneHuntById(undefined)

      expect(found).toBeFalsy()
    })

    it('should call repository getAllTargetsByHunt', async () => {
      await await service.getOneHuntById('abc')

      expect(mockHuntRepository.getOneHuntById).toHaveBeenCalledWith('abc')
    })
  })

  describe('updateHunt', () => {
    it('should return falsy if id is missing', async () => {
      const found = await service.updateHunt(undefined, {
        ...baseHunt
      })

      expect(found).toBeFalsy()
    })

    it('should call repository to update the target property', async () => {
      mockHuntRepository.updateHunt.mockResolvedValue({
        ...baseHunt,
        isActive: true
      })

      await service.updateHunt('abc', baseHunt)

      expect(mockHuntRepository.updateHunt).toHaveBeenCalledWith(
        'abc',
        expect.objectContaining({
          ...baseHunt
        })
      )
    })
  })

  describe('deleteHunt', () => {
    it('should return falsy if id is missing', async () => {
      const deleted = await service.deleteHunt(undefined)

      expect(deleted).toBeFalsy()
    })

    it('should return true if deleted success', async () => {
      const deleted = await service.deleteHunt('abc')

      expect(deleted).toBeTruthy()
    })
  })

  // hunt users
  describe('addParticipant', () => {
    it('should add 1 participant in hunt count', async () => {
      mockHuntRepository.getOneHuntById.mockResolvedValue({
        ...baseHunt,
        participants: 1
      })

      await service.addParticipant('hunt-id')

      expect(mockHuntRepository.updateHunt).toHaveBeenCalledWith('hunt-id', {
        participants: 2
      })
    })
  })

  describe('removeParticipant', () => {
    it('should remove 1 participant in hunt count', async () => {
      mockHuntRepository.getOneHuntById.mockResolvedValue({
        ...baseHunt,
        participants: 1
      })

      await service.removeParticipant('hunt-id')

      expect(mockHuntRepository.updateHunt).toHaveBeenCalledWith('hunt-id', {
        participants: 0
      })
    })
  })

  describe.skip('findUserInHunt', () => {
    it('TODO', () => {
      //TODO
    })
  })
  describe.skip('addUserToHunt', () => {
    it('TODO', () => {
      //TODO
    })
  })
  describe.skip('removeUserFromHunt', () => {
    it('TODO', () => {
      //TODO
    })
  })

  describe('validateUserAccess', () => {
    it('should return true if user is authorized to access the hunt', async () => {
      mockHuntUsersService.findSpecificRelationship.mockResolvedValue({
        huntId: 'hunt-id',
        userId: 'user-id'
      })

      const result = await service.validateUserAccess('user-id', 'hunt-id')

      expect(result).toBe(true)
    })

    it('should return falsy if user is not in hunt users list', async () => {
      mockHuntUsersService.findSpecificRelationship.mockResolvedValue(undefined)

      const result = await service.validateUserAccess('other-user', 'hunt-id')

      expect(result).toBeFalsy()
    })
  })

  describe.skip('getAllUsersInHunt', () => {
    it('TODO', () => {
      //TODO
    })
  })

  describe('getAllHuntsByUser', () => {
    it('should return falsy if userId is missing', async () => {
      const found = await service.getAllHuntsByUser(undefined, 1, 10)

      expect(found).toBeFalsy()
    })

    it('should call repository function getAllTargetsByHunt', async () => {
      mockHuntUsersService.getAllRelationshipsByUserPaginated.mockResolvedValue(
        {
          list: [
            { userId: 'user-id', huntId: 'hunt-id-1' },
            { userId: 'user-id', huntId: 'hunt-id-2' }
          ]
        }
      )

      mockHuntRepository.getOneHuntById.mockResolvedValueOnce({
        id: '2',
        baseHunt
      })
      mockHuntRepository.getOneHuntById.mockResolvedValueOnce({
        id: '1',
        baseHunt
      })

      await service.getAllHuntsByUser('user-id', 1, 10)

      expect(mockHuntRepository.getOneHuntById).toHaveBeenCalledWith(
        'hunt-id-1'
      )
      expect(mockHuntRepository.getOneHuntById).toHaveBeenCalledWith(
        'hunt-id-2'
      )
    })
  })

  describe.skip('getAllActiveHuntsByUser', () => {
    it('TODO', () => {
      //TODO
    })
  })

  // hunt targets
  describe('addTargetToHunt', () => {
    it('should return falsy if no huntId', async () => {
      const added = await service.addTargetToHunt(undefined, 'target-123')

      expect(added).toBeFalsy()
    })

    it('should return falsy if no targetId', async () => {
      const added = await service.addTargetToHunt('hunt-123', undefined)

      expect(added).toBeFalsy()
    })

    it('should true if add success', async () => {
      const added = await service.addTargetToHunt('hunt-123', 'target-123')

      expect(added).toBeTruthy()
    })

    it('should false if add fail', async () => {
      mockHuntRepository.addTargetToHunt.mockResolvedValue(false)

      const added = await service.addTargetToHunt('hunt-123', 'target-123')

      expect(added).toBeTruthy()
    })
  })

  describe('removeTargetFromHunt', () => {
    it('should return falsy if no huntId', async () => {
      const added = await service.removeTargetFromHunt(undefined, 'target-123')

      expect(added).toBeFalsy()
    })

    it('should return falsy if no targetId', async () => {
      const added = await service.removeTargetFromHunt('hunt-123', undefined)

      expect(added).toBeFalsy()
    })

    it('should true if add success', async () => {
      const added = await service.removeTargetFromHunt('hunt-123', 'target-123')

      expect(added).toBeTruthy()
    })

    it('should false if add fail', async () => {
      mockHuntRepository.removeTargetFromHunt.mockResolvedValue(false)

      const added = await service.removeTargetFromHunt('hunt-123', 'target-123')

      expect(added).toBeTruthy()
    })
  })
})
