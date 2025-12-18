import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource, type DataSourceOptions } from 'typeorm'

import { UsersRepository } from '@/domain/application/repositories/users-repository'

import { getDataSourceOptions } from './data-source'
import { TypeOrmUsersRepository } from './repositories/typeorm-users-repository'
import { TypeOrmService } from './typeorm.service'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (): DataSourceOptions => getDataSourceOptions(),
      dataSourceFactory: async (options: DataSourceOptions) => {
        const dataSource = new DataSource(options)

        return await dataSource.initialize()
      },
    }),
  ],
  providers: [
    TypeOrmService,
    {
      provide: UsersRepository,
      useClass: TypeOrmUsersRepository,
    },
  ],
  exports: [TypeOrmService, UsersRepository],
})
export class DatabaseModule {}
