import { randomUUID } from 'node:crypto'

import { DataSource } from 'typeorm'

import { DomainEvents } from '@/core/events/domain-events'
import { getDataSourceOptions } from '@/infra/database/data-source'
import { envSchema } from '@/infra/env/env'

process.env.DATABASE_SCHEMA = randomUUID()

const env = envSchema.parse(process.env)

jest.setTimeout(60000)

jest.mock('jose', () => ({
  exportJWK: jest.fn().mockResolvedValue({
    kty: 'RSA',
    n: 'mocked-n-value',
    e: 'AQAB',
  }),
  importSPKI: jest.fn().mockResolvedValue('mocked-key'),
}))

const dataSource = new DataSource(getDataSourceOptions())

beforeAll(async () => {
  await dataSource.initialize()

  await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${env.DATABASE_SCHEMA}"`)
  await dataSource.query(
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA "${env.DATABASE_SCHEMA}"`
  )
  await dataSource.query(`SET search_path TO "${env.DATABASE_SCHEMA}", public`)
  await dataSource.runMigrations()

  DomainEvents.shouldRun = false
})

afterAll(async () => {
  await dataSource.query(
    `DROP SCHEMA IF EXISTS "${env.DATABASE_SCHEMA}" CASCADE`
  )
  await dataSource.destroy()
})
