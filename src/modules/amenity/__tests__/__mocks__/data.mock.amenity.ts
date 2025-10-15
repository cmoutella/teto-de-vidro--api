import type { InterfaceAmenity } from '../../schemas/models/amenity.interface'

export const baseAmenity: InterfaceAmenity = {
  identifier: 'elevator',
  label: 'Elevador',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const otherAmenity: InterfaceAmenity = {
  identifier: 'portaria-24h',
  label: 'Portaria 24h',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const oneMoreAmenity: InterfaceAmenity = {
  identifier: 'varanda',
  label: 'Varanda',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

export const mockAllAmenities = [baseAmenity, otherAmenity, oneMoreAmenity]
