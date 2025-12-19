import { NestFactory } from '@nestjs/core'
import {
  type KafkaOptions,
  type MicroserviceOptions,
  Transport,
} from '@nestjs/microservices'

import { AppModule } from './app.module'

async function bootstrap() {
  const kafkaBroker = process.env.KAFKA_BROKER ?? 'localhost:9092'

  const kafkaOptions: KafkaOptions = {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth',
        brokers: [kafkaBroker],
      },
      consumer: {
        groupId: 'auth-consumer',
      },
    },
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    kafkaOptions
  )

  await app.listen()
}
bootstrap()
