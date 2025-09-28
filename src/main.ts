import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './shared/filters/http-exception-filter'
import { AuthInterceptor } from './shared/interceptors/authentication.interceptor'
import { ResponseInterceptor } from './shared/interceptors/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',')
  if (!allowedOrigins) {
    console.warn('⚠️  ALLOWED_ORIGINS não definido, usando localhost:3000')
    app.enableCors({
      origin: ['http://localhost:3000'],
      methods: ['POST', 'PUT', 'DELETE', 'GET'],
      credentials: true
    })
  } else {
    app.enableCors({
      origin: allowedOrigins,
      methods: ['POST', 'PUT', 'DELETE', 'GET'],
      credentials: true
    })
  }

  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalInterceptors(new AuthInterceptor())

  const config = new DocumentBuilder()
    .setTitle('Teto de Vidro - API')
    .setDescription('Descrição dos endpoints disponíveis no projeto')
    .setVersion('1.0')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/docs', app, documentFactory)

  await app.listen(Number(process.env.PORT) || 8080)
}
bootstrap()
