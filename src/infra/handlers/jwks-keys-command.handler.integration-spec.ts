import type { INestApplication } from '@nestjs/common'
import type { ClientKafka } from '@nestjs/microservices'
import { Test } from '@nestjs/testing'
import { AuthTopics, type JwksResponse } from '@psyscreen/contracts'
import { getAuthClientConfig } from '@test/config/clients.config'
import { getMicroserviceConfig } from '@test/config/microservice.config'
import { kafkaSetup } from '@test/helpers/kafka-setup'
import type { StartedRedpandaContainer } from '@testcontainers/redpanda'
import { firstValueFrom } from 'rxjs'

import { AppModule } from '../app.module'

describe('JwksCommand (Integration)', () => {
  let app: INestApplication
  let client: ClientKafka
  let kafkaContainer: StartedRedpandaContainer

  beforeAll(async () => {
    const { container, brokers } = await kafkaSetup()
    kafkaContainer = container

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, getAuthClientConfig(brokers)],
    }).compile()

    app = moduleRef.createNestApplication()

    app.connectMicroservice(getMicroserviceConfig(brokers))

    client = moduleRef.get('AUTH_SERVICE')

    client.subscribeToResponseOf(AuthTopics.JWKS)

    await client.connect()

    await app.startAllMicroservices()
    await app.init()
  })

  afterAll(async () => {
    await client.close()
    await app.close()

    if (kafkaContainer) {
      await kafkaContainer.stop()
    }
  })

  it('should return jwks successfully', async () => {
    const response = await firstValueFrom(
      client.send<JwksResponse>(AuthTopics.JWKS, {})
    )

    expect(response.success).toBeTruthy()

    if (response.success) {
      expect(response.data).toBeDefined()
      expect(response.data).toMatchObject({
        keys: [
          {
            kty: expect.any(String),
            kid: expect.any(String),
            alg: expect.any(String),
            use: expect.any(String),
            n: expect.any(String),
            e: expect.any(String),
          },
        ],
      })
    }
  })
})
