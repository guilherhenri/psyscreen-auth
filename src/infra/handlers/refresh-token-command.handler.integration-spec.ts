import { randomUUID } from 'node:crypto'

import type { INestApplication } from '@nestjs/common'
import type { ClientKafka } from '@nestjs/microservices'
import { Test } from '@nestjs/testing'
import {
  AuthTopics,
  GlobalErrorCodes,
  type RefreshTokenCommand,
  type RefreshTokenResponse,
} from '@psyscreen/contracts'
import { getAuthClientConfig } from '@test/config/clients.config'
import { getMicroserviceConfig } from '@test/config/microservice.config'
import { UserFactory } from '@test/factories/make-user'
import { kafkaSetup } from '@test/helpers/kafka-setup'
import { type StartedRedpandaContainer } from '@testcontainers/redpanda'
import { firstValueFrom } from 'rxjs'

import { AppModule } from '../app.module'
import { DatabaseModule } from '../database/database.module'

describe('RefreshTokenCommand (Integration)', () => {
  let app: INestApplication
  let client: ClientKafka
  let userFactory: UserFactory
  let kafkaContainer: StartedRedpandaContainer

  beforeAll(async () => {
    const { container, brokers } = await kafkaSetup()
    kafkaContainer = container

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, getAuthClientConfig(brokers)],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    app.connectMicroservice(getMicroserviceConfig(brokers))

    userFactory = moduleRef.get(UserFactory)
    client = moduleRef.get('AUTH_SERVICE')

    client.subscribeToResponseOf(AuthTopics.REFRESH_TOKEN)

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

  it('should renew the access and refresh token', async () => {
    const user = await userFactory.makeTypeOrmUser()

    const command: RefreshTokenCommand = {
      userId: user.id.toString(),
    }

    const response = await firstValueFrom(
      client.send<RefreshTokenResponse>(AuthTopics.REFRESH_TOKEN, command)
    )

    expect(response.success).toBeTruthy()

    if (response.success) {
      expect(response.data).toBeDefined()
      expect(response.data).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
    }
  })

  it("should return error when user don't exists", async () => {
    const command: RefreshTokenCommand = {
      userId: randomUUID(),
    }

    const response = await firstValueFrom(
      client.send<RefreshTokenResponse>(AuthTopics.REFRESH_TOKEN, command)
    )

    expect(response.success).toBeFalsy()

    if (!response.success) {
      expect(response.error).toBeDefined()
      expect(response.error.code).toBe(GlobalErrorCodes.RESOURCE_NOT_FOUND)
      expect(response.error.message).toBe('Usuário não encontrado.')
    }
  })
})
