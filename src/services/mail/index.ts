import type { PublicInterfaceUser } from '@src/modules/user/schemas/models/user.interface'
import { Resend } from 'resend'

import { welcomeBetaEmailTemplate } from './templates/welcome_beta.email'

export function mailService() {
  const token = process.env.EMAIL_TOKEN

  if (!token) {
    console.error('ERROR! Mail Service Token not set')
  }
  const resend = new Resend(process.env.EMAIL_TOKEN)

  async function welcome(user: PublicInterfaceUser, firstAccessValidation) {
    const { data, error } = await resend.emails.send({
      from: 'Teto de Vidro <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Boas vindas à Teto de Vidro!',
      html: welcomeBetaEmailTemplate(
        user.name,
        `${process.env.TDV_URL}/primeiro-acesso/${firstAccessValidation}`
      )
    })

    if (error) {
      return console.error('EMAIL SERVICE ERROR', { error })
    }

    console.log('email sent successfully!', { data })
  }

  async function submit({
    to,
    subject,
    html
  }: {
    to: string
    subject: string
    html: string
  }) {
    const { data, error } = await resend.emails.send({
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

  return { submit, welcome }
}
