import {
  ClientsModule,
  type KafkaOptions,
  Transport,
} from '@nestjs/microservices'

import { KAFKA_TEST_CONFIG } from './kafka.config'

export const getAuthClientConfig = (brokers: Array<string>) => {
  const kafkaClient: KafkaOptions & {
    name: string | symbol
  } = {
    name: 'AUTH_SERVICE',
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: KAFKA_TEST_CONFIG.clientId,
        brokers: brokers,
      },
      consumer: {
        groupId: KAFKA_TEST_CONFIG.groupId,
      },
    },
  }

  return ClientsModule.register([kafkaClient])
}
