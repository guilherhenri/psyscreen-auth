import type { INestApplication } from '@nestjs/common'
import type { ClientKafka } from '@nestjs/microservices'
import { Test } from '@nestjs/testing'
import {
  AuthenticateSessionCodes,
  type AuthenticateUserResponse,
  AuthTopics,
  type LoginUserCommand,
} from '@psyscreen/contracts'
import { getAuthClientConfig } from '@test/config/clients.config'
import { getMicroserviceConfig } from '@test/config/microservice.config'
import { UserFactory } from '@test/factories/make-user'
import { kafkaSetup } from '@test/helpers/kafka-setup'
import { type StartedRedpandaContainer } from '@testcontainers/redpanda'
import { firstValueFrom } from 'rxjs'

import { Hasher } from '@/domain/application/cryptography/hasher'
import { TypeOrmService } from '@/infra/database/typeorm.service'

import { AppModule } from '../app.module'
import { DatabaseModule } from '../database/database.module'
import { User } from '../database/entities/user.entity'

describe('LoginUserCommand (Integration)', () => {
  let app: INestApplication
  let client: ClientKafka
  let typeorm: TypeOrmService
  let hasher: Hasher
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

    typeorm = moduleRef.get(TypeOrmService)
    hasher = moduleRef.get(Hasher)
    userFactory = moduleRef.get(UserFactory)
    client = moduleRef.get('AUTH_SERVICE')

    client.subscribeToResponseOf(AuthTopics.LOGIN_USER)

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

  afterEach(async () => {
    await typeorm.getRepository(User).clear()
  })

  it('should authenticate a user successfully', async () => {
    const passwordHash = await hasher.hash('12345Ab@')
    await userFactory.makeTypeOrmUser({
      email: 'johndoe@email.com',
      passwordHash,
    })

    const command: LoginUserCommand = {
      email: 'johndoe@email.com',
      password: '12345Ab@',
    }

    const response = await firstValueFrom(
      client.send<AuthenticateUserResponse>(AuthTopics.LOGIN_USER, command)
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

  it('should return error when invalid credentials are provided', async () => {
    const passwordHash = await hasher.hash('12345Ab@')
    await userFactory.makeTypeOrmUser({
      email: 'johndoe@email.com',
      passwordHash,
    })

    const command: LoginUserCommand = {
      email: 'johndoe@email.com',
      password: 'invalid_credential',
    }

    const response = await firstValueFrom(
      client.send<AuthenticateUserResponse>(AuthTopics.LOGIN_USER, command)
    )

    expect(response.success).toBeFalsy()

    if (!response.success) {
      expect(response.error).toBeDefined()
      expect(response.error.code).toBe(
        AuthenticateSessionCodes.INVALID_CREDENTIALS
      )
      expect(response.error.message).toBe('E-mail ou senha inválidos.')
    }
  })
})
