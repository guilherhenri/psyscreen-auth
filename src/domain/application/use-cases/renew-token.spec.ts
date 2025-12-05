import { FakeEncryptor } from '@test/cryptography/fake-encryptor'
import { makeUser } from '@test/factories/make-user'
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users-repository'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { ResourceNotFoundError } from './errors/resource-not-found'
import { RenewTokenUseCase } from './renew-token'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeEncryptor: FakeEncryptor
let sut: RenewTokenUseCase

describe('Renew Token Use-case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeEncryptor = new FakeEncryptor()
    sut = new RenewTokenUseCase(inMemoryUsersRepository, fakeEncryptor)
  })

  it('should be able to renew a token with a valid user id', async () => {
    const user = makeUser()
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      userId: user.id.toString(),
    })

    expect(response.isRight()).toBeTruthy()

    if (response.isRight()) {
      expect(response.value).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
    }
  })

  it('should not be able to renew a token for an invalid user', async () => {
    const user = makeUser({}, new UniqueEntityID('user-1'))
    inMemoryUsersRepository.items.push(user)

    const response = await sut.execute({
      userId: 'user-2',
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    expect(response.value).toHaveProperty('message', 'Usuário não encontrado.')
  })
})
