import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersRepository } from '@/domain/application/repositories/users-repository'

import { dataSourceOptions } from './data-source'
import { TypeOrmUsersRepository } from './repositories/typeorm-users-repository'
import { TypeOrmService } from './typeorm.service'

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions)],
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
