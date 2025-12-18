import { NestFactory } from '@nestjs/core'
import {
  type KafkaOptions,
  type MicroserviceOptions,
  Transport,
} from '@nestjs/microservices'

import { AppModule } from './app.module'

const kafkaOptions: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'auth',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'auth-consumer',
    },
  },
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    kafkaOptions
  )

  await app.listen()
}
bootstrap()
