export const mockUserPublicService = {
  initialUserDataUpdate: jest.fn(),
  updateUserPassword: jest.fn(),
  updateUser: jest.fn(),
  getUserPermissions: jest.fn(),
  getByEmail: jest.fn(),
  getById: jest.fn(),
  inviteUser: jest.fn(),
  validateInvitation: jest.fn(),
  countInvitations: jest.fn()
}

export const mockUserAdminService = {
  createUser: jest.fn(),
  updateUser: jest.fn(),
  getUserPermissions: jest.fn(),
  getAllUsers: jest.fn(),
  getById: jest.fn(),
  getByEmail: jest.fn(),
  getByCPF: jest.fn(),
  deleteUser: jest.fn()
}

export const mockUserApplicationService = {
  createApplication: jest.fn(),
  listApplications: jest.fn(),
  getByName: jest.fn(),
  getById: jest.fn(),
  getByEmail: jest.fn(),
  deleteUser: jest.fn()
}

export const mockUserRepository = {
  createUser: jest.fn(),
  getAllUsers: jest.fn(),
  getById: jest.fn(),
  getByEmail: jest.fn(),
  getByCPF: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),

  inviteUser: jest.fn(),
  getApplications: jest.fn(),
  getAppByName: jest.fn()
}
