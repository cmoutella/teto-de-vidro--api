import { Injectable } from '@nestjs/common'
import type { PublicInterfaceUser } from '@src/modules/users/schemas/models/user.interface'
import { Resend } from 'resend'

import { AppService } from '../app.service'
import { welcomeBetaEmailTemplate } from './templates/welcome_beta.email'

@Injectable()
export class MailService {
  constructor(private readonly appService: AppService) {}

  token = this.appService.envVars().EMAIL_TOKEN

  init() {
    if (!this.token) {
      console.error('ERROR! Mail Service Token not set')
    }
    const resend = new Resend(this.token)

    return resend
  }

  resend = this.init()

  async welcome(user: PublicInterfaceUser, firstAccessValidation) {
    const { data, error } = await this.resend.emails.send({
      from: 'Teto de Vidro <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Boas vindas à Teto de Vidro!',
      html: welcomeBetaEmailTemplate({
        user: {
          name: user.name,
          gender: user.gender
        },
        ctaUrl: `${process.env.TDV_URL}/boas-vindas/${firstAccessValidation}`,
        productUrl: process.env.TDV_URL
      })
    })

    if (error) {
      return console.error('EMAIL SERVICE ERROR', { error })
    }

    console.log('email sent successfully!', { data })
  }

  async submit({
    to,
    subject,
    html
  }: {
    to: string
    subject: string
    html: string
  }) {
    const { data, error } = await this.resend.emails.send({
      from: 'Teto de Vidro <onboarding@resend.dev>',
      to: [to],
      subject,
      html
    })

    if (error) {
      return console.error({ error })
    }

    console.log({ data })
  }
}
