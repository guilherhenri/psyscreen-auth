import { type INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { UserFactory } from '@test/factories/make-user'
import * as request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { User } from '@/infra/database/entities/user.entity'
import { TypeOrmService } from '@/infra/database/typeorm.service'

describe('Register (E2E)', () => {
  let app: INestApplication
  let typeorm: TypeOrmService
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    app.useGlobalPipes(new ValidationPipe())

    typeorm = moduleRef.get(TypeOrmService)
    userFactory = moduleRef.get(UserFactory)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[POST] /sign-up', async () => {
    await request(app.getHttpServer())
      .post('/sign-up')
      .send({
        name: 'John Doe',
        email: 'johndoe@email.com',
        password: '12345Ab@',
      })
      .expect(201)

    const userOnDatabase = await typeorm.getRepository(User).findOne({
      where: {
        email: 'johndoe@email.com',
      },
    })

    expect(userOnDatabase).toBeTruthy()
  })

  it('[POST] /sign-up | invalid input data', async () => {
    const response = await request(app.getHttpServer())
      .post('/sign-up')
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

  it('[POST] /sign-up | email already in use', async () => {
    await userFactory.makeTypeOrmUser({ email: 'alreadyinuse@gmail.com' })

    const response = await request(app.getHttpServer())
      .post('/sign-up')
      .send({
        name: 'John Doe',
        email: 'alreadyinuse@gmail.com',
        password: '12345Ab@',
      })
      .expect(409)

    expect(response.body).toMatchObject({
      message: `O e-mail "alreadyinuse@gmail.com" já está em uso.`,
      error: 'Conflict',
      statusCode: 409,
    })
  })
})
