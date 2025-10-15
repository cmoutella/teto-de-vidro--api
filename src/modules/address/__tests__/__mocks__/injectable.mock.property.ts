export const mockPropertyRepository = {
  getAllPropertiesByLotId: jest.fn(),
  getOnePropertyById: jest.fn(),
  getOnePropertyByAddress: jest.fn(),
  createProperty: jest.fn(),
  updateProperty: jest.fn(),
  deleteProperty: jest.fn()
}
