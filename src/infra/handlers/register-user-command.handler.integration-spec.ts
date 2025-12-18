import type { INestApplication } from '@nestjs/common'
import { ClientKafka } from '@nestjs/microservices'
import { Test } from '@nestjs/testing'
import {
  AuthTopics,
  EnrollIdentityCodes,
  RegisterUserCommand,
  RegisterUserResponse,
} from '@psyscreen/contracts'
import { getAuthClientConfig } from '@test/config/clients.config'
import { getMicroserviceConfig } from '@test/config/microservice.config'
import { UserFactory } from '@test/factories/make-user'
import { kafkaSetup } from '@test/helpers/kafka-setup'
import { StartedRedpandaContainer } from '@testcontainers/redpanda'
import { firstValueFrom } from 'rxjs'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { User } from '@/infra/database/entities/user.entity'
import { TypeOrmService } from '@/infra/database/typeorm.service'

describe('RegisterUserCommand (Integration)', () => {
  let app: INestApplication
  let client: ClientKafka
  let typeorm: TypeOrmService
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
    typeorm = moduleRef.get(TypeOrmService)
    client = moduleRef.get('AUTH_SERVICE')

    client.subscribeToResponseOf(AuthTopics.REGISTER_USER)

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

  it('should register a new user successfully', async () => {
    const command: RegisterUserCommand = {
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: '12345Ab@',
    }

    const response = await firstValueFrom(
      client.send<RegisterUserResponse>(AuthTopics.REGISTER_USER, command)
    )

    expect(response.success).toBeTruthy()

    if (response.success) {
      expect(response.data).toBeDefined()
      expect(response.data?.user).toMatchObject({
        name: 'John Doe',
        email: 'johndoe@email.com',
      })
      expect(response.data.user.id).toBeDefined()
    }

    const userOnDatabase = await typeorm.getRepository(User).findOne({
      where: { email: 'johndoe@email.com' },
    })

    expect(userOnDatabase).toBeTruthy()
    expect(userOnDatabase?.name).toBe('John Doe')
    expect(userOnDatabase?.email).toBe('johndoe@email.com')
  })

  it('should return error when email is already in use', async () => {
    await userFactory.makeTypeOrmUser({ email: 'alreadyinuse@email.com' })

    const command: RegisterUserCommand = {
      name: 'John Doe',
      email: 'alreadyinuse@email.com',
      password: '12345Ab@',
    }

    const response = await firstValueFrom(
      client.send<RegisterUserResponse>(AuthTopics.REGISTER_USER, command)
    )

    expect(response.success).toBeFalsy()

    if (!response.success) {
      expect(response.error).toBeDefined()
      expect(response.error.code).toBe(EnrollIdentityCodes.EMAIL_ALREADY_IN_USE)
      expect(response.error.message).toBe(
        'O e-mail "alreadyinuse@email.com" já está em uso.'
      )
    }
  })
})
