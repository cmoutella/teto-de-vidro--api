import { ConfigModule } from '@nestjs/config'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { mockAddressService } from '@src/modules/address/__tests__/__mocks__/injectable.mock.address'
import { AddressService } from '@src/modules/address/services/address.service'
import { mockHuntRepository } from '@src/modules/hunt/__tests__/__mocks__/injectable.mock.hunt'
import { HuntRepository } from '@src/modules/hunt/repositories/hunt.repository'
import { AppService } from '@src/services/app.service'

import {
  amenity1,
  baseProperty,
  huntID,
  lotId,
  manyAmenities,
  propertyId
} from '../__mocks__/data.mock.target-property'
import { mockTargetPropertyRepository } from '../__mocks__/injectable.mock.target-property'
import { TargetPropertyRepository } from '../../repositories/target-property.repository'
import type { InterfaceTargetProperty } from '../../schemas/models/target-property.interface'
import { TargetPropertyService } from '../../services/target-property.service'

describe('TargetPropertyService | UnitTest', () => {
  let service: TargetPropertyService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AppService,
        TargetPropertyService,
        {
          provide: TargetPropertyRepository,
          useValue: mockTargetPropertyRepository
        },
        {
          provide: HuntRepository,
          useValue: mockHuntRepository
        },
        {
          provide: AddressService,
          useValue: mockAddressService
        }
      ]
    }).compile()

    jest.clearAllMocks()

    service = module.get<TargetPropertyService>(TargetPropertyService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createTargetProperty', () => {
    it('should return falsy if huntId is missing', async () => {
      const created = await service.createTargetProperty({
        ...baseProperty,
        huntId: undefined
      } as InterfaceTargetProperty)

      expect(created).toBeFalsy()
    })

    it('should register address', async () => {
      mockAddressService.createAddress.mockResolvedValue({
        lot: { id: lotId },
        property: { id: propertyId }
      })

      const input = {
        ...baseProperty,
        huntId: huntID
      }

      mockTargetPropertyRepository.createTargetProperty.mockResolvedValue({
        ...input,
        lotId: 'lot-123',
        propertyId: 'property-123',
        isActive: true
      })

      await service.createTargetProperty(baseProperty)

      expect(mockAddressService.createAddress).toHaveBeenCalled()
    })

    it('should call repository to create a new target property', async () => {
      mockAddressService.createAddress.mockResolvedValue({
        lot: { id: lotId },
        property: { id: propertyId }
      })

      const input = {
        ...baseProperty,
        huntId: huntID
      }

      mockTargetPropertyRepository.createTargetProperty.mockResolvedValue({
        ...input,
        lotId: 'lot-123',
        propertyId: 'property-123',
        isActive: true
      })

      await service.createTargetProperty(baseProperty)

      expect(mockAddressService.createAddress).toHaveBeenCalled()
      expect(
        mockTargetPropertyRepository.createTargetProperty
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          ...baseProperty,
          huntId: huntID,
          lotId: lotId,
          propertyId: propertyId,
          isActive: true
        })
      )
    })

    it('should return created target', async () => {
      mockAddressService.createAddress.mockResolvedValue({
        lot: { id: lotId },
        property: { id: propertyId }
      })

      const input = {
        ...baseProperty,
        huntId: huntID
      }

      mockTargetPropertyRepository.createTargetProperty.mockResolvedValue({
        ...input,
        lotId: lotId,
        propertyId: 'property-123',
        isActive: true
      })

      const result = await service.createTargetProperty(baseProperty)

      expect(result).toEqual(
        expect.objectContaining({
          ...baseProperty,
          lotId: lotId,
          propertyId: propertyId,
          isActive: true
        })
      )
    })
  })

  describe('updateTargetProperty', () => {
    it('should return falsy if id is missing', async () => {
      const found = await service.updateTargetProperty(undefined, {
        ...baseProperty,
        street: 'street-123'
      })

      expect(found).toBeFalsy()
    })

    // TODO: melhorar esse teste quando entrar noLotNumber e noComplement
    it('should register updated address', async () => {
      mockAddressService.createAddress.mockResolvedValue({
        lot: { id: lotId },
        property: { id: propertyId }
      })

      const input = {
        ...baseProperty,
        huntId: huntID
      }

      mockTargetPropertyRepository.updateTargetProperty.mockResolvedValue({
        ...input,
        lotId: 'lot-123',
        propertyId: 'property-123',
        isActive: true
      })

      await service.updateTargetProperty('abc', baseProperty)

      expect(mockAddressService.createAddress).toHaveBeenCalled()
    })

    it('should call repository to update the target property', async () => {
      mockAddressService.createAddress.mockResolvedValue({
        lot: { id: lotId },
        property: { id: propertyId }
      })

      const input = {
        ...baseProperty,
        huntId: huntID
      }

      mockTargetPropertyRepository.updateTargetProperty.mockResolvedValue({
        ...input,
        lotId: 'lot-123',
        propertyId: 'property-123',
        isActive: true
      })

      await service.updateTargetProperty('abc', baseProperty)

      expect(
        mockTargetPropertyRepository.updateTargetProperty
      ).toHaveBeenCalledWith(
        'abc',
        expect.objectContaining({
          ...baseProperty,
          huntId: huntID,
          lotId: lotId,
          propertyId: propertyId,
          isActive: true
        })
      )
    })
  })

  describe('getOneTargetById', () => {
    it('should return falsy if id is missing', async () => {
      const found = await service.getOneTargetById(undefined)

      expect(found).toBeFalsy()
    })

    it('should call repository getAllTargetsByHunt', async () => {
      await await service.getOneTargetById('abc')

      expect(
        mockTargetPropertyRepository.getOneTargetById
      ).toHaveBeenCalledWith('abc')
    })
  })

  describe('getAllTargetsByHunt', () => {
    it('should return falsy if huntId is missing', async () => {
      const found = await service.getAllTargetsByHunt(undefined, 1, 10)

      expect(found).toBeFalsy()
    })

    it('should call repository function getAllTargetsByHunt', async () => {
      await await service.getAllTargetsByHunt('abc', 1, 10)

      expect(
        mockTargetPropertyRepository.getAllTargetsByHunt
      ).toHaveBeenCalledWith('abc', 1, 10)
    })
  })

  describe('addAmenityToTarget', () => {
    it('should return falsy if id is missing', async () => {
      const found = await service.addAmenityToTarget(undefined, amenity1)

      expect(found).toBeFalsy()
    })

    it('should return object with amenities added', async () => {
      mockTargetPropertyRepository.getOneTargetById.mockResolvedValue(
        baseProperty
      )

      const targetId = 'target-123'
      await service.addAmenityToTarget(targetId, amenity1)

      const expectedUpdatedValue = {
        ...baseProperty,
        targetAmenities: [amenity1]
      }

      expect(
        mockTargetPropertyRepository.updateTargetProperty
      ).toHaveBeenCalledWith(targetId, expectedUpdatedValue)
    })
  })

  describe('removeAmenityFromTarget', () => {
    it('should return falsy if id is missing', async () => {
      const found = await service.removeAmenityFromTarget(
        undefined,
        amenity1.identifier
      )

      expect(found).toBeFalsy()
    })

    it('should return object with amenities removed', async () => {
      mockTargetPropertyRepository.getOneTargetById.mockResolvedValue({
        ...baseProperty,
        targetAmenities: manyAmenities
      })

      const targetId = 'target-123'
      const removedAmenityId = amenity1.identifier
      await service.removeAmenityFromTarget(targetId, removedAmenityId)

      const expectedUpdatedValue = {
        ...baseProperty,
        targetAmenities: manyAmenities.filter(
          (amnt) => amnt.identifier !== removedAmenityId
        )
      }

      expect(
        mockTargetPropertyRepository.updateTargetProperty
      ).toHaveBeenCalledWith(targetId, expectedUpdatedValue)
    })
  })

  describe('deleteTargetProperty', () => {
    it('should return falsy if id is missing', async () => {
      const deleted = await service.deleteTargetProperty(undefined)

      expect(deleted).toBeFalsy()
    })

    it('should return true if deleted success', async () => {
      const deleted = await service.deleteTargetProperty('abc')

      expect(deleted).toBeTruthy()
    })
  })
})
