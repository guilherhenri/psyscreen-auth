import 'dotenv/config'

import { DataSource, type DataSourceOptions } from 'typeorm'

import { envSchema } from '../env/env'

export const getDataSourceOptions = (): DataSourceOptions => {
  const env = envSchema.parse(process.env)

  return {
    type: 'postgres',
    host: 'localhost',
    port: env.DATABASE_PORT,
    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    schema: env.DATABASE_SCHEMA,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/**/*{.js,.ts}'],
    migrationsRun: false,
    synchronize: false,
  }
}

export default new DataSource(getDataSourceOptions())
