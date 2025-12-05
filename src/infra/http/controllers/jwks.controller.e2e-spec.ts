import { type INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import * as request from 'supertest'

import { AppModule } from '@/infra/app.module'

jest.mock('jose', () => ({
  exportJWK: jest.fn().mockResolvedValue({
    kty: 'RSA',
    n: 'mocked-n-value',
    e: 'AQAB',
  }),
  importSPKI: jest.fn().mockResolvedValue('mocked-key'),
}))

describe('Authenticate (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    app.useGlobalPipes(new ValidationPipe())

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('[GET] /.well-known/jwks.json', async () => {
    const response = await request(app.getHttpServer())
      .get('/.well-known/jwks.json')
      .expect(200)

    expect(response.body).toMatchObject({
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
  })
})
