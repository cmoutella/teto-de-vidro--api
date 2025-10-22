import { ConfigModule } from '@nestjs/config'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { AppService } from '@src/services/app.service'
import { CEPService } from '@src/services/cep/cep.service'

import { LotRepository } from '../../repositories/lot.repository'
import { LotService } from '../../services/lot-collection.service'

describe('LotService | UnitTest', () => {
  let service: LotService

  const mockLotRepository = {
    getOneLotByAddress: jest.fn(),
    getAllLotsByAddress: jest.fn(),
    getAllLotsByCEP: jest.fn(),
    getOneLot: jest.fn(),
    createLot: jest.fn(),
    updateLot: jest.fn(),
    deleteLot: jest.fn()
  }

  beforeAll(() => {
    process.env.OPENCEP_API = 'cep_url'
    process.env.NODE_ENV = 'test'
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AppService,
        CEPService,
        LotService,
        {
          provide: LotRepository,
          useValue: mockLotRepository
        }
      ]
    }).compile()

    jest.clearAllMocks()

    service = module.get<LotService>(LotService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // TODO: write Lot tests
})
