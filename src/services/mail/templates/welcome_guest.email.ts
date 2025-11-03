import type { Gender } from '@src/modules/users/schemas/models/user.interface'

interface TemplateProps {
  user: {
    name: string
    gender: Gender
  }
  inviteHost: string
  ctaUrl: string
  productUrl: string
}

export function welcomeGuestEmailTemplate({
  user,
  inviteHost,
  ctaUrl,
  productUrl
}: TemplateProps) {
  return `
  <div style="padding: 32px 12px; color: #5e6977;">
    <div style="max-width: 700px;">
      <h1 style="font-size: 24px; color: #378C87; margin-bottom: 32px; text-align: center;">
        Boas vindas, ${user.name}
      </h1>

      <div
        style="
          font-size: 14px;
          margin-bottom: 28px;
          color: #5e6977;
        "
      >
        <p style="display: block; margin-bottom: 8px; text-align: center;"><b style="color: #378C87;">${inviteHost} convidou você</b> para se juntar a ela na busca pelo imóvel ideal.</p>
        <p style="display: block; margin-bottom: 28px; text-align: center;">
          Isso quer dizer que você agora você faz parte da <b style="color: #378C87;">Teto de Vidro</b>. 
        </p>
        <p style="display: block; margin-bottom: 28px; text-align: center;">
          Aqui você <b style="color: #378C87;">organiza sua busca por imóvel</b> em um único lugar. Chega de anotações espalhadas, anúncios perdidos, quais contatos foram feitos e quais foram respondidos. Acompanhe cada etapa e <b style="color: #378C87;">contribua por um futuro mais transparente na busca por imóvel</b>.
        </p>
        <div style="display: block; margin-bottom: 28px; text-align: center;">
          <p>
            Para começar a utilizar acesse o link abaixo e complete seu cadastro:
          </p>
          <a
            style="
              display: inline-block;
              border: none;
              background-color: #acd9d6;
              padding: 18px 18px;
              font-size: 18px;
              border-radius: 4px;
              margin: 6px auto 2px;
              color: #0C403C;
              text-decoration: none;
              cursor: pointer;
            "
            href="${ctaUrl}"
            target="_blank"
          >
            Começar agora!
          </a>
          <p style="font-size: 12px;">
            Esse convite é válido por 7 dias. Entre em contato para renovar se necessário.
          </p>
        </div>
        <p style="display: block; margin-bottom: 8px; text-align: center;">
          Estamos muito felizes em ter você conosco!
        </p>
        <p style="display: block; margin-bottom: 8px; text-align: center;">
          Obrigada por <b style="color: #378C87;">acreditar nesse sonho</b> com a gente!
        </p>
        <p style="display: block; margin-bottom: 16px; text-align: center;">
          Queremos saber o que você gostou, o que ficou confuso e o que poderia
          melhorar.
        <p style="display: block; margin-bottom: 16px; text-align: center;">
          ${user.gender === 'female' ? 'Juntas' : user.gender === 'male' ? 'Juntos' : 'Juntes'} vamos construir um <b style="color: #378C87;">mercado imobiliário mais transparente!</b>
        </p>
      </div>

      <p style="display: block; font-size: 14px; color: #5e6977; margin-bottom: 8px; text-align: right;">Atenciosamente,</p>

      <a
        href="${productUrl}" 
        style="
          display: block; 
          font-size: 20px; 
          color: #2d736e; 
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          text-align: right;
      ">
        Teto de Vidro
      </a>
    </div>
  </div>
`
}
