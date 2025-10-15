import type { INestApplication } from '@nestjs/common'
import {
  BadRequestException,
  ConflictException,
  NotFoundException
} from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { mockAmenityService } from '@src/modules/amenity/__tests__/__mocks__/injectable.mock.amenity'
import {
  Amenity,
  AmenitySchema
} from '@src/modules/amenity/schemas/amenity.schema'
import { AmenityService } from '@src/modules/amenity/services/amenity.service'
import { mockCommentService } from '@src/modules/comments/__tests__/__mocks__/injectable.mock.amenity'
import {
  Comment,
  CommentSchema
} from '@src/modules/comments/schemas/comment.schema'
import { CommentService } from '@src/modules/comments/services/comments.service'
import { mockHuntService } from '@src/modules/hunt/__tests__/__mocks__/injectable.mock.hunt'
import { HuntMongooseRepository } from '@src/modules/hunt/repositories/mongoose/hunt.mongoose.repository'
import { HuntService } from '@src/modules/hunt/services/hunt-collection.service'
import { AppService } from '@src/services/app.service'
import { AuthGuard } from '@src/shared/guards/auth.guard'
import { ResponseInterceptor } from '@src/shared/interceptors/response.interceptor'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { AddressService } from 'src/modules/address/services/address.service'
import { HuntRepository } from 'src/modules/hunt/repositories/hunt.repository'
import { Hunt, HuntSchema } from 'src/modules/hunt/schemas/hunt.schema'
import request from 'supertest'
import { MockAuthGuard } from 'test/mocks/mock-auth.guard'

import {
  amenity1,
  baseProperty,
  huntID,
  manyAmenities,
  mockUpdateComment,
  targetId
} from '../__mocks__/data.mock.target-property'
import {
  mockTargetPropertyRepository,
  mockTargetPropertyService
} from '../__mocks__/injectable.mock.target-property'
import { TargetPropertyController } from '../../controllers/target-property.controller'
import { TargetPropertyRepository } from '../../repositories/target-property.repository'
import type {
  InterfaceTargetProperty,
  TargetAmenity
} from '../../schemas/models/target-property.interface'
import {
  TargetProperty,
  TargetPropertySchema
} from '../../schemas/target-property.schema'
import type { UpdateTargetProperty } from '../../schemas/zod-validation/update-target-property.zod-validation'
import { TargetPropertyService } from '../../services/target-property.service'

/**
 * TODO
 * - testar validação com zod
 */
describe('TargetPropertyController | Integration Test', () => {
  let controller: TargetPropertyController
  let mongod: MongoMemoryServer
  let app: INestApplication

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: TargetProperty.name, schema: TargetPropertySchema },
          { name: Hunt.name, schema: HuntSchema },
          { name: Amenity.name, schema: AmenitySchema },
          { name: Comment.name, schema: CommentSchema }
        ])
      ],
      controllers: [TargetPropertyController],
      providers: [
        AppService,
        {
          provide: TargetPropertyService,
          useValue: mockTargetPropertyService
        },
        {
          provide: HuntService,
          useValue: mockHuntService
        },
        {
          provide: AmenityService,
          useValue: mockAmenityService
        },
        {
          provide: CommentService,
          useValue: mockCommentService
        },
        {
          provide: TargetPropertyRepository,
          useValue: mockTargetPropertyRepository
        },
        {
          provide: HuntRepository,
          useClass: HuntMongooseRepository
        },
        {
          provide: AddressService,
          useValue: {
            validateZipCode: jest.fn().mockResolvedValue(true)
          }
        }
      ]
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile()

    controller = module.get<TargetPropertyController>(TargetPropertyController)
    app = module.createNestApplication()
    app.useGlobalInterceptors(new ResponseInterceptor())
    await app.init()
  })

  beforeEach(async () => {
    jest.clearAllMocks()
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongod.stop()
    await app.close()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('createTargetProperty', () => {
    it('should return created target if success', async () => {
      MockAuthGuard.allow = true

      mockHuntService.getOneHuntById.mockResolvedValue(true)
      mockHuntService.validateUserAccess.mockResolvedValue(true)
      mockTargetPropertyService.createTargetProperty.mockResolvedValue({
        ...baseProperty,
        id: 'target-123'
      })

      await request(app.getHttpServer())
        .post('/target-property')
        .send({
          ...baseProperty
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('status')
          expect(res.body).toHaveProperty('data')
          expect(res.body.data).toHaveProperty('id')
        })
    })

    it('should return validation error if zod validation failed', async () => {
      MockAuthGuard.allow = true

      await request(app.getHttpServer())
        .post('/target-property')
        .send({
          ...baseProperty,
          huntId: undefined
        } as InterfaceTargetProperty)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message')
          expect(res.body).toHaveProperty('error')
        })
    })

    it('should throw BadRequestException if huntId is missing', async () => {
      MockAuthGuard.allow = true

      await request(app.getHttpServer())
        .post('/target-property')
        .send({
          ...baseProperty,
          huntId: undefined
        } as InterfaceTargetProperty)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message')
          expect(res.body).toHaveProperty('error')
        })
    })

    it('should throw NotFoundExecption if no Hunt found for huntId', async () => {
      MockAuthGuard.allow = true

      mockHuntService.getOneHuntById.mockResolvedValue(undefined)

      await request(app.getHttpServer())
        .post('/target-property')
        .send({
          ...baseProperty,
          huntId: 'hunt-123'
        } as InterfaceTargetProperty)
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('message')
          expect(res.body).toHaveProperty('error')
        })
    })

    it('should test for duplicity within the hunt', async () => {
      MockAuthGuard.allow = true

      mockHuntService.getOneHuntById.mockResolvedValue(true)
      mockHuntService.validateUserAccess.mockResolvedValue(true)

      await request(app.getHttpServer())
        .post('/target-property')
        .send({
          ...baseProperty
        })

      expect(mockTargetPropertyService.preventDuplicity).toHaveBeenCalled()
    })

    it('should throw ConflictException ALREADY_EXISTS if target already exists in hunt', async () => {
      MockAuthGuard.allow = true

      mockHuntService.getOneHuntById.mockResolvedValue(true)
      mockHuntService.validateUserAccess.mockResolvedValue(true)

      mockTargetPropertyService.preventDuplicity.mockImplementation(() => {
        throw new ConflictException({ message: 'ALREADY_EXISTS' })
      })

      await request(app.getHttpServer())
        .post('/target-property')
        .send({
          ...baseProperty
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('ALREADY_EXISTS')
        })
    })

    it('should try to create received amenities', async () => {
      MockAuthGuard.allow = true

      mockHuntService.getOneHuntById.mockResolvedValue(true)
      mockHuntService.validateUserAccess.mockResolvedValue(true)
      mockTargetPropertyService.createTargetProperty.mockResolvedValue({
        ...baseProperty,
        id: 'target-123'
      })

      await request(app.getHttpServer())
        .post('/target-property')
        .send({
          ...baseProperty,
          targetAmenities: [
            { identifier: 'elevator', reportedBy: 'ad' },
            { identifier: 'portaria-24h', reportedBy: 'ad' }
          ] as TargetAmenity[]
        })

      expect(mockAmenityService.createManyAmenities).toHaveBeenCalled()
    })

    it('should try NOT to create if NO amenities were received', async () => {
      MockAuthGuard.allow = true

      mockHuntService.getOneHuntById.mockResolvedValue(true)
      mockTargetPropertyService.createTargetProperty.mockResolvedValue({
        ...baseProperty,
        id: 'target-123'
      })

      await request(app.getHttpServer())
        .post('/target-property')
        .send({
          ...baseProperty
        })

      expect(mockAmenityService.createManyAmenities).not.toHaveBeenCalled()
    })

    it('should get amenities origin data', async () => {
      MockAuthGuard.allow = true

      mockHuntService.getOneHuntById.mockResolvedValue(true)
      mockHuntService.validateUserAccess.mockResolvedValue(true)
      mockTargetPropertyService.createTargetProperty.mockResolvedValue({
        ...baseProperty,
        id: 'target-123',
        targetAmenities: manyAmenities
      })

      await request(app.getHttpServer())
        .post('/target-property')
        .send({
          ...baseProperty,
          targetAmenities: manyAmenities
        })

      expect(mockAmenityService.getCompleteAmenitiesData).toHaveBeenCalled()
    })

    it('should require authorization in request headers', async () => {
      MockAuthGuard.allow = false

      await request(app.getHttpServer())
        .post('/target-property')
        .send({
          ...baseProperty
        })
        .expect(403)
    })
  })

  describe('updateTargetProperty', () => {
    it('should throw NotFoundException if no Target found for the id', async () => {
      MockAuthGuard.allow = true
      mockTargetPropertyService.getOneTargetById.mockResolvedValue(false)

      await expect(
        controller.updateTargetProperty('abc', {
          target: baseProperty
        } as UpdateTargetProperty)
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException if id is missing', async () => {
      MockAuthGuard.allow = true
      await expect(
        controller.updateTargetProperty(undefined, {
          target: baseProperty
        } as UpdateTargetProperty)
      ).rejects.toThrow(BadRequestException)
    })

    it('should NOT call preventDuplicity if address info NOT changed', async () => {
      MockAuthGuard.allow = true
      mockTargetPropertyService.getOneTargetById.mockResolvedValue({
        ...baseProperty
      })

      await controller.updateTargetProperty('abc', {
        target: {
          ...baseProperty,
          nickname: 'ChangedName'
        }
      } as UpdateTargetProperty)

      await expect(
        mockTargetPropertyService.preventDuplicity
      ).not.toHaveBeenCalled()
    })

    it('should call preventDuplicity if address info changed', async () => {
      MockAuthGuard.allow = true
      mockTargetPropertyService.getOneTargetById.mockResolvedValue({
        ...baseProperty
      })

      mockTargetPropertyService.preventDuplicity.mockResolvedValue(true)

      await controller.updateTargetProperty('abc', {
        target: {
          ...baseProperty,
          street: 'Rua dos bobos'
        }
      } as UpdateTargetProperty)

      await expect(
        mockTargetPropertyService.preventDuplicity
      ).toHaveBeenCalled()
    })

    it('should throw ConflictException ALREADY_EXISTS if target already exists in hunt', async () => {
      MockAuthGuard.allow = true

      mockTargetPropertyService.getOneTargetById.mockResolvedValue(baseProperty)

      mockTargetPropertyService.preventDuplicity.mockImplementation(() => {
        throw new ConflictException({ message: 'ALREADY_EXISTS' })
      })

      await request(app.getHttpServer())
        .put(`/target-property/${targetId}`)
        .send({
          target: {
            ...baseProperty,
            street: 'Rua dos bobos'
          }
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('ALREADY_EXISTS')
        })
    })

    it('should create comment if updated with comment', async () => {
      MockAuthGuard.allow = true

      mockTargetPropertyService.getOneTargetById.mockResolvedValue(true)
      mockTargetPropertyService.updateTargetProperty.mockResolvedValue({
        ...baseProperty,
        condoPricing: 700,
        targetAmenities: manyAmenities
      })
      mockCommentService.mountRelationship.mockResolvedValue({
        relativeTo: 'property',
        relativeId: 'target-123'
      })

      await request(app.getHttpServer())
        .put('/target-property/target-123')
        .send({
          target: {
            ...baseProperty,
            condoPricing: 700,
            targetAmenities: manyAmenities
          },
          comment: mockUpdateComment
        })

      expect(mockCommentService.createComment).toHaveBeenCalled()
    })

    it('should get amenities origin data', async () => {
      MockAuthGuard.allow = true

      mockTargetPropertyService.getOneTargetById.mockResolvedValue(true)
      mockTargetPropertyService.updateTargetProperty.mockResolvedValue({
        ...baseProperty,
        condoPricing: 700,
        targetAmenities: manyAmenities
      })

      await request(app.getHttpServer())
        .put('/target-property/target-123')
        .send({
          target: {
            ...baseProperty,
            condoPricing: 700,
            targetAmenities: manyAmenities
          }
        })

      expect(mockAmenityService.getCompleteAmenitiesData).toHaveBeenCalled()
    })

    it('should require authorization in request headers', async () => {
      MockAuthGuard.allow = false

      await request(app.getHttpServer())
        .put(`/target-property/${targetId}`)
        .send({
          target: baseProperty
        })
        .expect(403)
    })
  })

  describe.skip('listComments', () => {})

  describe.skip('addComment', () => {})

  describe('getOneTargetById', () => {
    it('should throw BadRequestException if id is missing', async () => {
      MockAuthGuard.allow = true

      await expect(controller.getOneTargetProperty(undefined)).rejects.toThrow(
        BadRequestException
      )
    })

    it('should get amenities origin data', async () => {
      MockAuthGuard.allow = true

      mockTargetPropertyService.getOneTargetById.mockResolvedValue({
        ...baseProperty,
        condoPricing: 700,
        targetAmenities: manyAmenities
      })

      await request(app.getHttpServer())
        .get('/target-property/target-123')
        .send()

      expect(mockAmenityService.getCompleteAmenitiesData).toHaveBeenCalled()
    })

    it('should require authorization in request headers', async () => {
      MockAuthGuard.allow = false

      await request(app.getHttpServer())
        .get(`/target-property/${targetId}`)
        .send()
        .expect(403)
    })
  })

  describe('addAmenityToTarget', () => {
    it('should throw BadRequestException if id is missing', async () => {
      await expect(
        controller.addAmenityToTarget(undefined, amenity1)
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw NotFoundException if id is missing', async () => {
      await expect(
        controller.addAmenityToTarget(targetId, amenity1)
      ).rejects.toThrow(NotFoundException)
    })

    it('should call service with correct params', async () => {
      MockAuthGuard.allow = true

      mockTargetPropertyService.getOneTargetById.mockResolvedValue(true)
      mockAmenityService.getOneAmenityById.mockResolvedValue(amenity1)

      await request(app.getHttpServer())
        .put(`/target-property/${targetId}/amenity`)
        .send(amenity1)

      expect(mockTargetPropertyService.addAmenityToTarget).toHaveBeenCalled()
      expect(mockTargetPropertyService.addAmenityToTarget).toHaveBeenCalledWith(
        targetId,
        amenity1
      )
    })

    it('should create amenity if NOT already exists', async () => {
      MockAuthGuard.allow = true

      mockTargetPropertyService.getOneTargetById.mockResolvedValue(true)
      mockAmenityService.createAmenity.mockResolvedValue(amenity1)

      await request(app.getHttpServer())
        .put(`/target-property/${targetId}/amenity`)
        .send(amenity1)

      expect(mockAmenityService.createAmenity).toHaveBeenCalled()
    })

    it('should NOT create amenity if already exists', async () => {
      MockAuthGuard.allow = true

      mockTargetPropertyService.getOneTargetById.mockResolvedValue(true)
      mockAmenityService.getOneAmenityById.mockResolvedValue(amenity1)

      await request(app.getHttpServer())
        .put(`/target-property/${targetId}/amenity`)
        .send(amenity1)

      expect(mockAmenityService.createAmenity).not.toHaveBeenCalled()
    })
  })

  describe('removeAmenityfromTarget', () => {
    it('should throw BadRequestException if id is missing', async () => {
      MockAuthGuard.allow = true

      await expect(
        controller.removeAmenityfromTarget(undefined, amenity1.identifier)
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('getAllTargetsByHunt', () => {
    it('should throw BadRequestException if huntId is missing', async () => {
      MockAuthGuard.allow = true

      await expect(
        controller.getAllTargetsByHunt(undefined, 1, 10)
      ).rejects.toThrow(BadRequestException)
    })

    it('should get query params', async () => {
      MockAuthGuard.allow = true

      mockTargetPropertyService.getAllTargetsByHunt.mockResolvedValue({
        list: baseProperty
      })

      await request(app.getHttpServer())
        .get(`/target-property/search/${huntID}?page=3&limit=10`)
        .send()

      expect(
        mockTargetPropertyService.getAllTargetsByHunt
      ).toHaveBeenCalledWith(huntID, '3', '10')
    })

    it('should get amenities origin data', async () => {
      MockAuthGuard.allow = true

      const responseMock = [
        {
          ...baseProperty,
          id: '1',
          targetAmenities: manyAmenities
        },
        {
          ...baseProperty,
          id: '2',
          targetAmenities: manyAmenities
        }
      ]

      mockTargetPropertyService.getAllTargetsByHunt.mockResolvedValue({
        list: responseMock
      })

      await request(app.getHttpServer())
        .get('/target-property/search/hunt-123')
        .send()

      expect(mockAmenityService.getCompleteAmenitiesData).toHaveBeenCalledTimes(
        responseMock.length
      )
    })

    it('should require authorization in request headers', async () => {
      MockAuthGuard.allow = false

      await request(app.getHttpServer())
        .get(`/target-property/${targetId}`)
        .send()
        .expect(403)
    })
  })

  describe('deleteTargetProperty', () => {
    it('should throw BadRequestException if id is missing', async () => {
      await expect(controller.deleteTargetProperty(undefined)).rejects.toThrow(
        BadRequestException
      )
    })

    it('should throw NotFoundExceptions if no Target found for the id', async () => {
      mockTargetPropertyService.getOneTargetById.mockResolvedValue(false)

      await expect(controller.deleteTargetProperty('abc')).rejects.toThrow(
        NotFoundException
      )
    })

    it('should NOT remove target from hunt if delete success', async () => {
      mockTargetPropertyService.getOneTargetById.mockResolvedValue({
        huntId: 'h123'
      })
      mockTargetPropertyService.deleteTargetProperty.mockResolvedValue(false)

      await controller.deleteTargetProperty('abc')
      expect(mockHuntService.removeTargetFromHunt).not.toHaveBeenCalled()
    })

    it('should remove target from hunt if delete success', async () => {
      mockTargetPropertyService.getOneTargetById.mockResolvedValue({
        huntId: 'h123'
      })
      mockTargetPropertyService.deleteTargetProperty.mockResolvedValue(true)

      await controller.deleteTargetProperty('abc')
      expect(mockHuntService.removeTargetFromHunt).toHaveBeenCalled()
    })

    it('should require authorization in request headers', async () => {
      MockAuthGuard.allow = false

      await request(app.getHttpServer())
        .delete(`/target-property/${targetId}`)
        .send()
        .expect(403)
    })
  })
})
