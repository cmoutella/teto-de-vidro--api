import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { CEPService } from '@src/services/cep/cep.service'

import { LotRepository } from '../../repositories/lot.repository'
import { PropertyRepository } from '../../repositories/property.repository'
import { AddressService } from '../../services/address.service'
import { LotService } from '../../services/lot-collection.service'
import { PropertyService } from '../../services/property-collection.service'
import { mockLotRepository } from './__mocks__/lot'
import { mockPropertyRepository } from './__mocks__/property'

describe('AddressService | UnitTest', () => {
  let service: AddressService

  beforeAll(() => {
    process.env.OPENCEP_API = 'cep_url'
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        LotService,
        PropertyService,
        CEPService,
        {
          provide: LotRepository,
          useValue: mockLotRepository
        },
        {
          provide: PropertyRepository,
          useValue: mockPropertyRepository
        }
      ]
    }).compile()

    jest.clearAllMocks()

    service = module.get<AddressService>(AddressService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe.skip('createAddress', () => {
    it('should return object with lot and property if necessary data received', async () => {})

    it('should return object with ONLY lot if not enough property data', async () => {})

    it('should return falsy if minimal address data NOT received', async () => {})

    it('should call cepService to validate address', async () => {})

    it('should verify if lot already exists with no postalCode', async () => {})

    it('should create lot if NOT already exists', async () => {})

    it('should NOT create lot if already exists', async () => {})

    it('should verify if lot with postalCode already exists', async () => {})

    it('should update postalCode if lot with postalCode NOT exists', async () => {})

    it('should create property if NOT already exists', async () => {})

    it('should NOT create property if already exists', async () => {})
  })

  describe.skip('findByAddress', () => {
    it('should return lots and properties arrays with search results', async () => {})

    it('should return falsy if minimal address data NOT received', async () => {})

    it('should return object with empty lot and property arrays if no lots found', async () => {})

    it('should search for properties if minimal ONE lots found', async () => {})
  })
})
