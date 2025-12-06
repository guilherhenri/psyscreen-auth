import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'

import { AppModule } from './app.module'
import { envSchema } from './env/env'

const env = envSchema.parse(process.env)

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: env.PORT,
    },
  })

  await app.listen()
}
bootstrap()
