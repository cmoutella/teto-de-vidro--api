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
  onboardingCompleted: false,
  updatedAt: someDate,
  lastLogin: someDate
}
