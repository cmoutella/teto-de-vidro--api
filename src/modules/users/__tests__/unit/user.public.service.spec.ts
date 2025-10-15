import { ConfigModule } from '@nestjs/config'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { mockUserLimitService } from '@src/modules/accessLevelPolicies/__tests__/__mocks__/injectable.mock.access-level-policies'
import { UserLimitService } from '@src/modules/accessLevelPolicies/services/user-limit.service'
import { mockInvitationService } from '@src/modules/invitation/__tests__/__mocks__/injectable.mock.invitation'
import { InvitationService } from '@src/modules/invitation/service/invitation.service'
import { mockMailService } from '@src/services/__tests__/__mocks__/injectable.mock.mail'
import { AppService } from '@src/services/app.service'
import { MailService } from '@src/services/mail/mail.service'

import {
  mockCreatedUser,
  mockedUser,
  mockToInviteUser
} from '../__mocks__/data.mock.users'
import { mockUserRepository } from '../__mocks__/injectable.mock.users'
import { UserRepository } from '../../repositories/user.repository'
import { UserPublicService } from '../../services/user.public.service'

describe('UserPublicService | UnitTest', () => {
  let service: UserPublicService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AppService,
        UserPublicService,
        {
          provide: UserRepository,
          useValue: mockUserRepository
        },
        {
          provide: InvitationService,
          useValue: mockInvitationService
        },
        {
          provide: UserLimitService,
          useValue: mockUserLimitService
        },
        {
          provide: MailService,
          useValue: mockMailService
        }
      ]
    }).compile()

    jest.clearAllMocks()

    service = module.get<UserPublicService>(UserPublicService)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('update user', () => {
    it('should return updated user', async () => {
      const newName = 'Bernadete'

      mockUserRepository.updateUser.mockReturnValue({
        ...mockCreatedUser,
        name: newName
      })

      const created = await service.updateUser(mockCreatedUser.id, {
        name: newName
      })

      expect(created).toBeTruthy()
    })
  })

  describe('invite user', () => {
    it('should create invite if create user success', async () => {
      mockUserRepository.inviteUser.mockReturnValue(mockCreatedUser)

      mockInvitationService.addInvitation.mockResolvedValue({
        invitationToken: 'mock-invitation-token'
      })

      const created = await service.inviteUser(
        mockToInviteUser,
        mockCreatedUser.id
      )

      expect(created).toBeTruthy()
    })

    it('should send invitation email if success', async () => {
      mockUserRepository.inviteUser.mockResolvedValue(mockCreatedUser)
      mockInvitationService.addInvitation.mockResolvedValue({
        invitationToken: 'mock-invitation-token'
      })

      await service.inviteUser(mockToInviteUser as never, 'tester-operator')

      expect(mockMailService.welcome).toHaveBeenCalled()
    })

    it('should not create invite if user create fails', async () => {
      mockUserRepository.inviteUser.mockResolvedValue(undefined)

      await service.inviteUser(mockToInviteUser as never, 'tester-operator')

      expect(mockInvitationService.addInvitation).not.toHaveBeenCalled()
    })

    it('should not invitation if invite fails', async () => {
      mockUserRepository.inviteUser.mockResolvedValue(mockCreatedUser)
      mockInvitationService.addInvitation.mockResolvedValue(undefined)

      await service.inviteUser(mockToInviteUser as never, 'tester-operator')

      expect(mockMailService.welcome).not.toHaveBeenCalled()
    })
  })

  describe('get by id', () => {
    describe('should return found user with no sensible information password', () => {
      it('no password', async () => {
        mockUserRepository.getById.mockResolvedValue(mockedUser)

        const foundUser = await service.getById(mockedUser.id)

        expect(foundUser).not.toHaveProperty('password')
      })

      it('no cpf', async () => {
        mockUserRepository.getById.mockResolvedValue(mockedUser)

        const foundUser = await service.getById(mockedUser.id)

        expect(foundUser).not.toHaveProperty('cpf')
      })
    })
  })

  describe('get by email', () => {
    describe('should return found user with no sensible information password', () => {
      it('no password', async () => {
        mockUserRepository.getByEmail.mockResolvedValue(mockedUser)

        const foundUser = await service.getByEmail(mockedUser.email)

        expect(foundUser).not.toHaveProperty('password')
      })

      it('no cpf', async () => {
        mockUserRepository.getByEmail.mockResolvedValue(mockedUser)

        const foundUser = await service.getByEmail(mockedUser.email)

        expect(foundUser).not.toHaveProperty('cpf')
      })
    })
  })
})
