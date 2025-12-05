import { type INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from '@test/factories/make-user'
import * as request from 'supertest'

import { Hasher } from '@/domain/application/cryptography/hasher'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let hasher: Hasher

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    app.useGlobalPipes(new ValidationPipe())

    hasher = moduleRef.get(Hasher)
    userFactory = moduleRef.get(UserFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[POST] /sessions', async () => {
    const passwordHash = await hasher.hash('12345Ab@')
    await userFactory.makeTypeOrmUser({
      email: 'johndoe@email.com',
      passwordHash,
    })

    const response = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        email: 'johndoe@email.com',
        password: '12345Ab@',
      })
      .expect(200)

    expect(response.body).toMatchObject({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    })
  })

  it('[POST] /sessions | invalid input data', async () => {
    const response = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        email: 'johndoe',
      })
      .expect(400)

    expect(response.body).toMatchObject({
      message: expect.any(Array<string>),
      statusCode: 400,
      error: 'Bad Request',
    })
  })

  it('[POST] /sessions | unauthorized credentials', async () => {
    const passwordHash = await hasher.hash('12345Ab@')
    await userFactory.makeTypeOrmUser({
      email: 'johndoe1@email.com',
      passwordHash,
    })

    const response = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        email: 'johndoe2@email.com',
        password: '12345Ab@',
      })
      .expect(401)

    expect(response.body).toMatchObject({
      message: 'E-mail ou senha inválidos.',
      error: 'Unauthorized',
      statusCode: 401,
    })
  })
})
