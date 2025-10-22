import { Injectable } from '@nestjs/common'
import type { InterfaceLot } from 'src/modules/address/schemas/models/lot.interface'

import { AppService } from '../app.service'

export interface ValidatedAddress {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
}

export interface ValidatedAddressTranslated {
  postalCode: string
  street: string
  streetNumber: string
  neighborhood: string
  city: string
  uf: string
}

@Injectable()
export class CEPService {
  constructor(private readonly appService: AppService) {}

  url = this.appService.envVars().OPENCEP_API

  init() {
    if (!this.url) {
      console.error('ERROR! Mail Service Token not set')
    }

    return this.url
  }

  CEP_URL = this.init()

  objectTranslate(data: ValidatedAddress) {
    return {
      postalCode: data.cep,
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      uf: data.uf
    } as ValidatedAddressTranslated
  }

  async cepFetch(cep: string) {
    const cleanCEP = cep.replace(/\D/g, '').trim()

    const data = await fetch(`${this.CEP_URL}/${cleanCEP}`).then((res) =>
      res.json()
    )

    if (!data) return null

    return this.objectTranslate(data)
  }

  async getAddress(cep: string) {
    const verifiedData = await this.cepFetch(cep)

    if (!verifiedData) {
      return null
    }

    return verifiedData
  }

  async validateAddress(cep: string, address: InterfaceLot) {
    const verifiedData = await this.cepFetch(cep)

    if (!verifiedData) {
      return null
    }

    const verifiedDataKeys: string[] = Object.keys(verifiedData)

    return verifiedDataKeys.every((key) => verifiedData[key] === address[key])
  }
}
