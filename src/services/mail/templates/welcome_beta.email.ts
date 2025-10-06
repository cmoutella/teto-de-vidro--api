export function welcomeBetaEmailTemplate(
  name: string,
  firstAccessPage: string
) {
  return `<div style="padding: 32px 12px; color: #5e6977">
  <h1 style="font-size: 24px; margin-bottom: 32px">
    Boas vindas, ${name}
  </h1>

  <div
    style="
      font-size: 14px;
      margin-bottom: 28px;
      color: #5e6977;
    "
  >
    <p style="display: block; margin-bottom: 8px;">Agora você é <b>beta tester</b> na Teto de Vidro</p>
    <p style="display: block; margin-bottom: 28px">
      Isso quer dizer que você vai <b>ter acesso à ferramenta e às novas features
      antes de todo mundo!</b>
    </p>
    <div>
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
          margin: 6px auto 24px;
          color: #0C403C;
          text-decoration: none;
        "
        href="${firstAccessPage}"
        target="_blank"
      >
        Começar agora!
      </a>
    </div>
    <p style="display: block; margin-bottom: 8px;">Estamos felizes em ter você conosco!</p>
    <p style="display: block; margin-bottom: 16px;">
      Queremos saber o que você gostou, o que ficou confuso e o que poderia
      melhorar. Juntes vamos construir um
      <b>mercado imobiliário mais transprante!</b>
    </p>
    <p style="display: block; margin-bottom: 8px;">
      Conta tudo pra gente respondendo esse e-mail e em breve entraremos em
      contato :)
    </p>
  </div>

  <p style="display: block; font-size: 14px; color: #5e6977; margin-bottom: 8px">Atenciosamente,</p>
  <p style="display: block; font-size: 20px; color: #2d736e; font-weight: 600">
    Equipe Teto de Vidro
  </p>
</div>
`
}
