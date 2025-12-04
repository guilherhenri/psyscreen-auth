import { randomUUID } from 'node:crypto'

process.env.DATABASE_SCHEMA = randomUUID()

import { DomainEvents } from '@/core/events/domain-events'
import dataSource from '@/infra/database/data-source'
import { envSchema } from '@/infra/env/env'

const env = envSchema.parse(process.env)

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
  await dataSource.query(`DROP SCHEMA IF EXISTS "test" CASCADE`)
  await dataSource.destroy()
})
