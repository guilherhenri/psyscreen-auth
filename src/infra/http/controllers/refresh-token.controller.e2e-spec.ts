import { randomUUID } from 'node:crypto'

import { type INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from '@test/factories/make-user'
import * as request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Refresh Token (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    app.useGlobalPipes(new ValidationPipe())

    userFactory = moduleRef.get(UserFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[GET] /auth/refresh', async () => {
    const user = await userFactory.makeTypeOrmUser()

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        userId: user.id.toString(),
      })
      .expect(200)
  })

  it('[GET] /auth/refresh | invalid input data', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .expect(400)

    expect(response.body).toMatchObject({
      message: expect.any(Array<string>),
      statusCode: 400,
      error: 'Bad Request',
    })
  })

  it('[GET] /auth/refresh | not found user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ userId: randomUUID() })
      .expect(404)

    expect(response.body).toMatchObject({
      message: 'Usuário não encontrado.',
      error: 'Not Found',
      statusCode: 404,
    })
  })
})
