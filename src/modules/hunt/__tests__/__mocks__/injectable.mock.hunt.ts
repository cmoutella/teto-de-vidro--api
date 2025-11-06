export const mockHuntService = {
  createHunt: jest.fn(),
  getOneHuntById: jest.fn(),
  updateHunt: jest.fn(),
  deleteHunt: jest.fn(),
  addParticipant: jest.fn(),
  removeParticipant: jest.fn(),
  findUserInHunt: jest.fn(),
  addUserToHunt: jest.fn(),
  removeUserFromHunt: jest.fn(),
  validateUserAccess: jest.fn(),
  getAllUsersInHunt: jest.fn(),
  getAllHuntsByUser: jest.fn(),
  getAllActiveHuntsByUser: jest.fn(),
  addTargetToHunt: jest.fn(),
  removeTargetFromHunt: jest.fn()
}

export const mockHuntRepository = {
  createHunt: jest.fn(),
  updateHunt: jest.fn(),
  getOneHuntById: jest.fn(),
  getAllHuntsByUser: jest.fn(),
  getActiveHunts: jest.fn(),
  deleteHunt: jest.fn(),
  addTargetToHunt: jest.fn(),
  removeTargetFromHunt: jest.fn()
}

export const mockHuntUsersService = {
  createRelationship: jest.fn(),
  findSpecificRelationship: jest.fn(),
  getAllRelationshipsByHunt: jest.fn(),
  getAllRelationshipsByHuntPaginated: jest.fn(),
  getAllRelationshipsByUser: jest.fn(),
  getAllRelationshipsByUserPaginated: jest.fn(),
  deleteRelationship: jest.fn()
}

export const mockHuntUsersRepository = {
  createRelationship: jest.fn(),
  findRelationship: jest.fn(),
  getRelationshipsByHunt: jest.fn(),
  getRelationshipsByHuntPaginated: jest.fn(),
  getRelationshipsByUser: jest.fn(),
  getRelationshipsByUserPaginated: jest.fn(),
  deleteRelationship: jest.fn()
}
