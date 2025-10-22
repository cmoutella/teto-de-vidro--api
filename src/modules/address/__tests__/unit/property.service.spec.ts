import { ConfigModule } from '@nestjs/config'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'

import { LotRepository } from '../../repositories/lot.repository'
import { PropertyRepository } from '../../repositories/property.repository'
import { PropertyService } from '../../services/property-collection.service'

describe('PropertyService | UnitTest', () => {
  let service: PropertyService

  const mockLotRepository = {
    getOneLotByAddress: jest.fn(),
    getAllLotsByAddress: jest.fn(),
    getAllLotsByCEP: jest.fn(),
    getOneLot: jest.fn(),
    createLot: jest.fn(),
    updateLot: jest.fn(),
    deleteLot: jest.fn()
  }

  const mockPropertyRepository = {
    getAllPropertiesByLotId: jest.fn(),
    getOnePropertyById: jest.fn(),
    getOnePropertyByAddress: jest.fn(),
    createProperty: jest.fn(),
    updateProperty: jest.fn(),
    deleteProperty: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        PropertyService,
        {
          provide: PropertyRepository,
          useValue: mockPropertyRepository
        },
        {
          provide: LotRepository,
          useValue: mockLotRepository
        }
      ]
    }).compile()

    jest.clearAllMocks()

    service = module.get<PropertyService>(PropertyService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // TODO: write Property tests
})
