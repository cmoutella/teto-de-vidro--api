import { ConfigModule } from '@nestjs/config'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { AppService } from '@src/services/app.service'

import {
  baseAmenity,
  mockAllAmenities,
  oneMoreAmenity,
  otherAmenity
} from '../__mocks__/data.mock.amenity'
import { mockAmenityRepository } from '../__mocks__/injectable.mock.amenity'
import { AmenityRepository } from '../../repositories/amenity.repository'
import type { SearchAmenity } from '../../schemas/models/amenity.interface'
import { AmenityService } from '../../services/amenity.service'

describe('AmenityService | UnitTest', () => {
  let service: AmenityService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AppService,
        AmenityService,
        {
          provide: AmenityRepository,
          useValue: mockAmenityRepository
        }
      ]
    }).compile()

    jest.clearAllMocks()

    service = module.get<AmenityService>(AmenityService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createAmenity', () => {
    it('should call repository to create a new target property', async () => {
      mockAmenityRepository.createAmenity.mockResolvedValue({
        ...baseAmenity,
        isActive: true
      })

      await service.createAmenity(baseAmenity)

      expect(mockAmenityRepository.createAmenity).toHaveBeenCalledWith(
        expect.objectContaining({
          ...baseAmenity
        })
      )
    })

    it('should return created target', async () => {
      mockAmenityRepository.createAmenity.mockResolvedValue({
        ...baseAmenity,
        isActive: true
      })

      const result = await service.createAmenity(baseAmenity)

      expect(result).toEqual(
        expect.objectContaining({
          ...baseAmenity,
          isActive: true
        })
      )
    })
  })

  describe('createManyAmenities', () => {
    const many = [baseAmenity, otherAmenity] as unknown as SearchAmenity[]

    it('should call repository to create a new target property', async () => {
      mockAmenityRepository.createManyAmenities.mockResolvedValue({
        success: [many[0].identifier, many[1].identifier],
        failed: []
      })

      await service.createManyAmenities(many)

      expect(mockAmenityRepository.createManyAmenities).toHaveBeenCalled()
    })

    it('should return created target', async () => {
      mockAmenityRepository.createManyAmenities.mockResolvedValue({
        success: [many[0].identifier, many[1].identifier],
        failed: []
      })

      const result = await service.createManyAmenities(many)

      expect(result).toEqual(
        expect.objectContaining({
          success: [many[0].identifier, many[1].identifier],
          failed: []
        })
      )
    })
  })

  describe('getOneAmenityById', () => {
    it('should return falsy if id is missing', async () => {
      const found = await service.getOneAmenityById(undefined)

      expect(found).toBeFalsy()
    })

    it('should call repository getOneAmenityById', async () => {
      mockAmenityRepository.getOneAmenityById.mockReturnValue(baseAmenity)
      await service.getOneAmenityById('abc')

      expect(mockAmenityRepository.getOneAmenityById).toHaveBeenCalledWith(
        'abc'
      )
    })
  })

  describe('getCompleteAmenitiesData', () => {
    it('should get complete info on amenities', async () => {
      jest
        .spyOn(service, 'getOneAmenityById')
        .mockImplementation(async (id) =>
          mockAllAmenities.find((el) => el.identifier === id)
        )

      const result = await service.getCompleteAmenitiesData([
        { identifier: oneMoreAmenity.identifier, amenityOf: 'property' },
        { identifier: baseAmenity.identifier, amenityOf: 'lot' }
      ])

      expect(result).toStrictEqual([
        { ...oneMoreAmenity, amenityOf: 'property' },
        { ...baseAmenity, amenityOf: 'lot' }
      ])
    })
  })

  describe('updateAmenity', () => {
    it('should return falsy if id is missing', async () => {
      const found = await service.updateAmenity(undefined, {
        ...baseAmenity
      })

      expect(found).toBeFalsy()
    })

    it('should call repository to update the target property', async () => {
      mockAmenityRepository.updateAmenity.mockResolvedValue({
        ...baseAmenity,
        label: 'Teste'
      })

      await service.updateAmenity('abc', baseAmenity)

      expect(mockAmenityRepository.updateAmenity).toHaveBeenCalledWith(
        'abc',
        expect.objectContaining({
          ...baseAmenity
        })
      )
    })
  })

  describe('deleteAmenity', () => {
    it('should return falsy if id is missing', async () => {
      const deleted = await service.deleteAmenity(undefined)

      expect(deleted).toBeFalsy()
    })

    it('should return true if deleted success', async () => {
      const deleted = await service.deleteAmenity('abc')

      expect(deleted).toBeTruthy()
    })
  })
})
