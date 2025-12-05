import { Injectable } from '@nestjs/common'
import type { Repository } from 'typeorm'

import { DomainEvents } from '@/core/events/domain-events'
import type { UsersRepository } from '@/domain/application/repositories/users-repository'
import type { User } from '@/domain/enterprise/entities/user'

import { User as TypeOrmUser } from '../entities/user.entity'
import { TypeOrmUserMapper } from '../mappers/typeorm-user-mapper'
import { TypeOrmService } from '../typeorm.service'

@Injectable()
export class TypeOrmUsersRepository implements UsersRepository {
  private readonly usersRepository: Repository<TypeOrmUser>

  constructor(private readonly typeorm: TypeOrmService) {
    this.usersRepository = this.typeorm.getRepository(TypeOrmUser)
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
    })

    if (!user) return null

    return TypeOrmUserMapper.toDomain(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
    })

    if (!user) return null

    return TypeOrmUserMapper.toDomain(user)
  }

  async create(user: User): Promise<void> {
    const typeOrmUser = TypeOrmUserMapper.toTypeOrm(user)

    await this.usersRepository.save(typeOrmUser)

    DomainEvents.dispatchEventsForAggregate(user.id)
  }
}
