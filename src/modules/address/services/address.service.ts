import { BadRequestException, Injectable } from '@nestjs/common'
import {
  CEPService,
  ValidatedAddressTranslated
} from '@src/services/cep/cep.service'
import { PaginatedData } from 'src/shared/types/response'

import { LotRepository } from '../repositories/lot.repository'
import { PropertyRepository } from '../repositories/property.repository'
import {
  CreatedAddressFromTarget,
  InterfaceAddress,
  InterfaceSearchAddress
} from '../schemas/models/address.interface'
import { InterfaceLot } from '../schemas/models/lot.interface'
import { InterfaceProperty } from '../schemas/models/property.interface'

@Injectable()
export class AddressService {
  constructor(
    private readonly lotRepository: LotRepository,
    private readonly propertyRepository: PropertyRepository,
    private readonly cepService: CEPService
  ) {}

  // para ser utilizado integrado ao service de target
  async createAddress(
    address: InterfaceAddress
  ): Promise<CreatedAddressFromTarget | null> {
    if (
      !address.street ||
      (!address.noLotNumber && !address.lotNumber) ||
      !address.city ||
      !address.country
    ) {
      return null
    }

    let cepAddress: ValidatedAddressTranslated | null = null
    if (address.postalCode && address.postalCode !== '') {
      // faz a busca pelo cep
      cepAddress = await this.cepService.getAddress(address.postalCode)
    }

    let relatedLot: InterfaceLot | null = null

    // se foi criado um lote com o endereço enviado
    const foundLots = await this.lotRepository.getAllLotsByAddress({
      street: address.street,
      city: address.city,
      uf: address.uf,
      country: address.country,
      lotNumber: address.noLotNumber ? '0' : address.lotNumber,
      noLotNumber: address.noLotNumber
    })

    // se não encontrou lotes com o endereço enviado
    if (!foundLots || foundLots.list.length <= 0) {
      // cria o endereço corrigido com os dados do cep
      const lot = await this.lotRepository.createLot({
        street: cepAddress?.street ?? address.street,
        city: cepAddress?.city ?? address.city,
        uf: cepAddress?.uf ?? address.uf,
        country: address.country,
        noLotNumber: address.noLotNumber,
        lotNumber: address.noLotNumber ? '0' : address.lotNumber,
        neighborhood: address.neighborhood,
        lotName: address.lotName ?? '',
        postalCode: address.postalCode ?? '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      relatedLot = lot
    } else if (foundLots && foundLots.list.length >= 2) {
      // TODO: log / handle (fila?)
      console.warn('WARN @ foundLots && lenght >= 2', foundLots)
    } else {
      relatedLot = foundLots.list[0]
    }

    if (!relatedLot || !relatedLot.id) {
      return null
    }

    // se o lote encontrado não possui postal code
    if (
      (!relatedLot.postalCode || relatedLot.postalCode === '') &&
      cepAddress
    ) {
      // buscar o lote com o endereço corrigido pelo cep
      const foundLotsWithPostalCode =
        await this.lotRepository.getAllLotsByAddress({
          street: cepAddress.street,
          city: cepAddress.city,
          uf: cepAddress.uf,
          country: address.country,
          lotNumber: address.noLotNumber ? '0' : address.lotNumber,
          noLotNumber: address.noLotNumber,
          postalCode: address.postalCode
        })

      // se não existe o endereço com o cep corrigido, realiza o update com dados do cep
      if (
        !foundLotsWithPostalCode ||
        foundLotsWithPostalCode.list.length <= 0
      ) {
        const updatedLotData = await this.lotRepository.updateLot(
          relatedLot.id,
          {
            postalCode: address.postalCode,
            street: cepAddress?.street ?? address.street,
            city: cepAddress?.city ?? address.city,
            uf: cepAddress?.uf ?? address.uf
          }
        )

        if (updatedLotData) {
          relatedLot = updatedLotData
        }
      } else if (foundLotsWithPostalCode.list.length === 1) {
        // TODO: log
        // aqui relatedLot é o lote encontrado como está no banco
        // vamos substituir a referencia pelo lote encontrado considerando os dados do cep
        relatedLot = foundLotsWithPostalCode.list[0]
      }
    }

    // se tem complemento mas nao tem propertyNumber ou block
    if (!address.noComplement || (!address.propertyNumber && !address.block)) {
      return { lot: relatedLot }
    }

    const foundProperty = await this.propertyRepository.getOnePropertyByAddress(
      relatedLot.id,
      {
        noComplement: address.noComplement,
        block: address.block,
        propertyNumber: address.propertyNumber
      }
    )

    if (foundProperty) {
      return { lot: relatedLot, property: foundProperty }
    }

    // cria a propriedade se não existir
    const property = await this.propertyRepository.createProperty({
      lotId: relatedLot.id,
      noComplement: address.noComplement,
      propertyNumber: address.noComplement ? '0' : address.propertyNumber,
      block: address.noComplement ? '0' : (address.block ?? null),
      size: address.size ?? null,
      rooms: address.rooms ?? null,
      bathrooms: address.bathrooms ?? null,
      is_front: address.is_front ?? null,
      sun: address.sun ?? null,
      parking: address.parking ?? null,
      condoPricing: address.condoPricing ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return { lot: relatedLot, property }
  }

  async findByAddress(
    address: InterfaceSearchAddress
  ): Promise<{ lot?: InterfaceLot[]; property?: InterfaceProperty[] }> {
    if (
      !address.street ||
      !address.lotNumber ||
      !address.city ||
      !address.country
    ) {
      throw new BadRequestException(
        'Um endereço precisa ter no mínimo rua, número, cidade, estado e país.'
      )
    }

    const foundLots = await this.lotRepository.getAllLotsByAddress({
      street: address.street,
      city: address.city,
      uf: address.uf,
      country: address.country,
      lotNumber: address.lotNumber,
      noLotNumber: address.noLotNumber
    })

    if (!foundLots || foundLots.list.length <= 0) {
      return { lot: [], property: [] }
    }

    let properties: InterfaceProperty[] = []
    if (foundLots.list.length === 1) {
      const foundProperties =
        await this.propertyRepository.getAllPropertiesByLotId(foundLots[0].id)

      if (address.propertyNumber) {
        const property = foundProperties.list.find(
          (property) => property.propertyNumber === address.propertyNumber
        )

        properties = [property]
      } else {
        properties = foundProperties.list
      }
    }

    return { lot: foundLots.list ?? [], property: properties }
  }

  async findLotsByAddress(
    address: InterfaceSearchAddress
  ): Promise<PaginatedData<InterfaceLot>> {
    if (!address.street || !address.city || !address.country) {
      throw new BadRequestException(
        'Um endereço precisa ter no mínimo rua, número, cidade, estado e país.'
      )
    }

    const foundLots = await this.lotRepository.getAllLotsByAddress({
      street: address.street,
      city: address.city,
      country: address.country,
      uf: address.uf
    })

    return foundLots
  }
}
