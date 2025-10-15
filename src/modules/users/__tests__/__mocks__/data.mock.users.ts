import type { InterfaceUser } from '../../schemas/models/user.interface'

const someDate = new Date().toISOString()

export const mockedUser: InterfaceUser = {
  id: 'user-123',

  // identify user
  name: 'Tester',
  familyName: 'Testerson',
  cpf: '11111111111',
  email: 'teste@tester.com',

  // access
  accessLevel: 0,
  role: 'regular',

  // user profiling
  profession: 'user',
  gender: 'male',

  // user settings
  password: 'password',

  // history
  createdAt: someDate,
  welcomeCompleted: false,
  updatedAt: someDate,
  lastLogin: someDate
}

export const mockToCreateUser = {
  name: 'Thomas',
  familyName: 'Fletcher',
  email: 'thomas@mcfly.com',
  accessLevel: 1,
  role: 'regular'
}

export const mockCreatedUser = {
  ...mockToCreateUser,
  id: 'created-mock-user-1',
  createdAt: someDate,
  updatedAt: someDate
}

export const mockToInviteUser = {
  name: 'Dougie',
  familyName: 'Poynter',
  email: 'dougie@mcfly.com'
}
