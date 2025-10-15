export const mockTargetPropertyService = {
  createTargetProperty: jest.fn(),
  updateTargetProperty: jest.fn(),
  getOneTargetById: jest.fn(),
  getAllTargetsByHunt: jest.fn(),
  addAmenityToTarget: jest.fn(),
  removeAmenityfromTarget: jest.fn(),
  preventDuplicity: jest.fn(),
  deleteTargetProperty: jest.fn()
}

export const mockTargetPropertyRepository = {
  createTargetProperty: jest.fn(),
  getAllTargetsByHunt: jest.fn(),
  getHuntTargetByFullAddress: jest.fn(),
  getHuntTargetsByLot: jest.fn(),
  getHuntTargetsByStreet: jest.fn(),
  getOneTargetById: jest.fn(),
  updateTargetProperty: jest.fn(),
  deleteTargetProperty: jest.fn()
}
