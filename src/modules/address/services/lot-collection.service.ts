import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { CEPService } from '@src/services/cep/cep.service'
import { PaginatedData } from 'src/shared/types/response'

import { LotRepository } from '../repositories/lot.repository'
import {
  InterfaceLot,
  InterfaceSearchLot
} from '../schemas/models/lot.interface'

@Injectable()
export class LotService {
  constructor(
    private readonly lotRepository: LotRepository,
    private readonly cepService: CEPService
  ) {}

  async createLot(newLot: InterfaceLot): Promise<InterfaceLot> {
    const verifiedAddress = await this.cepService.getAddress(newLot.postalCode)

    if (!verifiedAddress) {
      throw new BadRequestException('CEP inválido')
    }

    const newLotIsValid = await this.cepService.validateAddress(
      newLot.postalCode,
      newLot
    )

    const validLot = newLotIsValid ? newLot : { ...newLot, ...verifiedAddress }

    if (validLot.lotNumber) {
      const foundLot = await this.lotRepository.getOneLotByAddress(
        validLot.postalCode,
        validLot.lotNumber
      )

      if (foundLot) {
        return foundLot
      }
    } else {
      // TODO: tratar endereço sem numero
    }

    const createdLot = await this.lotRepository.createLot({
      ...validLot,
      lotAmenities: []
    })

    return createdLot
  }

  async getAllLotsByAddress(
    addressParams: InterfaceSearchLot,
    page?: number,
    limit?: number
  ): Promise<PaginatedData<InterfaceLot>> {
    return await this.lotRepository.getAllLotsByAddress(
      addressParams,
      page,
      limit
    )
  }

  async getAllLotsByCEP(
    cep: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedData<InterfaceLot>> {
    return await this.lotRepository.getAllLotsByCEP(cep, page, limit)
  }

  async getOneLot(id: string): Promise<InterfaceLot> {
    const Lot = await this.lotRepository.getOneLot(id)

    if (!Lot) throw new NotFoundException('Endereço não encontrado')
    return Lot
  }

  async updateLot(
    id: string,
    data: Partial<InterfaceLot>
  ): Promise<InterfaceLot> {
    return await this.lotRepository.updateLot(id, data)
  }

  async deleteLot(id: string): Promise<void> {
    await this.lotRepository.deleteLot(id)
  }
}
