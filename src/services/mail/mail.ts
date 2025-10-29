type EmailContact = {
  email: string
  name: string
}

type ContactType = 'default' | 'contact' | 'sac'

export const contacts: Record<ContactType, EmailContact> = {
  default: {
    name: 'Teto de Vidro',
    email: 'contato@tetodevidro.app.br'
  },
  contact: {
    name: 'Contato @ Teto de Vidro',
    email: 'contato@tetodevidro.app.br'
  },
  sac: {
    name: 'Atendimento @ Teto de Vidro',
    email: 'contato@tetodevidro.app.br'
  }
}
