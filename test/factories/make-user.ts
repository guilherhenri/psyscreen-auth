import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

import type { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, type UserProps } from '@/domain/enterprise/entities/user'
import { User as TypeOrmUser } from '@/infra/database/entities/user.entity'
import { TypeOrmUserMapper } from '@/infra/database/mappers/typeorm-user-mapper'
import { TypeOrmService } from '@/infra/database/typeorm.service'

export function makeUser(
  override: Partial<UserProps> = {},
  id?: UniqueEntityID
) {
  const user = User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash: faker.internet.password(),
      ...override,
    },
    id
  )

  return user
}

@Injectable()
export class UserFactory {
  constructor(private readonly typeorm: TypeOrmService) {}

  async makeTypeOrmUser(data: Partial<UserProps> = {}): Promise<User> {
    const user = makeUser(data)

    await this.typeorm
      .getRepository(TypeOrmUser)
      .save(TypeOrmUserMapper.toTypeOrm(user))

    return user
  }
}
