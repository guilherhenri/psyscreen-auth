import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'

import { Encryptor } from '../cryptography/encryptor'
import { UsersRepository } from '../repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found'

interface RenewTokenUseCaseRequest {
  userId: string
}

type RenewTokenUseCaseResponse = Either<
  ResourceNotFoundError,
  { accessToken: string; refreshToken: string }
>

@Injectable()
export class RenewTokenUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private encryptor: Encryptor
  ) {}

  async execute({
    userId,
  }: RenewTokenUseCaseRequest): Promise<RenewTokenUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError('Usuário não encontrado.'))
    }

    const accessToken = await this.encryptor.encrypt(
      {
        sub: user.id.toString(),
      },
      'access'
    )
    const refreshToken = await this.encryptor.encrypt(
      {
        sub: user.id.toString(),
      },
      'refresh'
    )

    return right({ accessToken, refreshToken })
  }
}
