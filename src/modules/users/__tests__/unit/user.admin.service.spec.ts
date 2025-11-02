import { ConfigModule } from '@nestjs/config'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { mockAccessLevelPolicy } from '@src/modules/accessLevelPolicies/__tests__/__mocks__/data.mock.access-level-policies'
import { mockAccessLevelService } from '@src/modules/accessLevelPolicies/__tests__/__mocks__/injectable.mock.access-level-policies'
import { AccessLevelPoliciesService } from '@src/modules/accessLevelPolicies/services/access-level-policies.service'
import { mockInvitationService } from '@src/modules/invitation/__tests__/__mocks__/injectable.mock.invitation'
import { InvitationService } from '@src/modules/invitation/service/invitation.service'
import { mockMailService } from '@src/services/__tests__/__mocks__/injectable.mock.mail'
import { AppService } from '@src/services/app.service'
import { MailService } from '@src/services/mail/mail.service'

import { mockCreatedUser, mockToCreateUser } from '../__mocks__/data.mock.users'
import {
  mockUserLimitsService,
  mockUserRepository
} from '../__mocks__/injectable.mock.users'
import { UserRepository } from '../../repositories/user.repository'
import { UserLimitsService } from '../../services/user-limits.service'
import { UserAdminService } from '../../services/user.admin.service'

describe('UserAdminService | UnitTest', () => {
  let service: UserAdminService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AppService,
        UserAdminService,
        {
          provide: UserRepository,
          useValue: mockUserRepository
        },
        {
          provide: InvitationService,
          useValue: mockInvitationService
        },
        {
          provide: AccessLevelPoliciesService,
          useValue: mockAccessLevelService
        },
        {
          provide: UserLimitsService,
          useValue: mockAccessLevelService
        },
        {
          provide: UserLimitsService,
          useValue: mockUserLimitsService
        },
        {
          provide: MailService,
          useValue: mockMailService
        }
      ]
    }).compile()

    jest.clearAllMocks()

    service = module.get<UserAdminService>(UserAdminService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create user', () => {
    it('should return falsy if name is missing', async () => {
      const { name, ...data } = mockToCreateUser
      const created = await service.createUser(data as never, 'tester-operator')

      expect(created).toBeFalsy()
    })

    it('should return falsy if email is missing', async () => {
      const { email, ...data } = mockToCreateUser
      const created = await service.createUser(data as never, 'tester-operator')

      expect(created).toBeFalsy()
    })

    it('should create user successfully', async () => {
      mockUserRepository.createUser.mockResolvedValue(mockCreatedUser)
      mockInvitationService.addInvitation.mockResolvedValue({
        invitationToken: 'mock-invitation-token'
      })
      mockAccessLevelService.getByLevel.mockResolvedValue(mockAccessLevelPolicy)

      const created = await service.createUser(
        mockToCreateUser as never,
        'tester-operator'
      )

      expect(created).toBeTruthy()
    })

    it('should send invitation if creation success and invite success', async () => {
      mockUserRepository.createUser.mockResolvedValue(mockCreatedUser)
      mockInvitationService.addInvitation.mockResolvedValue({
        invitationToken: 'mock-invitation-token'
      })
      mockAccessLevelService.getByLevel.mockResolvedValue(mockAccessLevelPolicy)

      await service.createUser(mockToCreateUser as never, 'tester-operator')

      expect(mockMailService.welcome).toHaveBeenCalled()
    })

    it('should not create invite if user create fails', async () => {
      mockUserRepository.createUser.mockResolvedValue(undefined)

      await service.createUser(mockToCreateUser as never, 'tester-operator')

      expect(mockInvitationService.addInvitation).not.toHaveBeenCalled()
    })

    it('should not invitation if invite fails', async () => {
      mockUserRepository.createUser.mockResolvedValue(mockCreatedUser)
      mockInvitationService.addInvitation.mockResolvedValue(undefined)

      await service.createUser(mockToCreateUser as never, 'tester-operator')

      expect(mockMailService.welcome).not.toHaveBeenCalled()
    })
  })
})
