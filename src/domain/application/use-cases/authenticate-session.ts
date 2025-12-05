import { Injectable } from '@nestjs/common'

import { type Either, left, right } from '@/core/either'

import { Encryptor } from '../cryptography/encryptor'
import { Hasher } from '../cryptography/hasher'
import { UsersRepository } from '../repositories/users-repository'
import { InvalidCredentialsError } from './errors/invalid-credentials'

interface AuthenticateSessionUseCaseRequest {
  email: string
  password: string
}

type AuthenticateSessionUseCaseResponse = Either<
  InvalidCredentialsError,
  { accessToken: string; refreshToken: string }
>

@Injectable()
export class AuthenticateSessionUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private encryptor: Encryptor,
    private hasher: Hasher
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateSessionUseCaseRequest): Promise<AuthenticateSessionUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      const error = new InvalidCredentialsError()

      return left(error)
    }

    const isPasswordMatch = await this.hasher.compare(
      password,
      user.passwordHash
    )

    if (!isPasswordMatch) {
      return left(new InvalidCredentialsError())
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
