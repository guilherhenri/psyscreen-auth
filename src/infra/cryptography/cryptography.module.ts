import { Module } from '@nestjs/common'

import { Encryptor } from '@/domain/application/cryptography/encryptor'
import { Hasher } from '@/domain/application/cryptography/hasher'

import { BcryptHasher } from './bcrypt-hasher'
import { JwtEncryptor } from './jwt-encryptor'

@Module({
  providers: [
    { provide: Hasher, useClass: BcryptHasher },
    { provide: Encryptor, useClass: JwtEncryptor },
  ],
  exports: [Hasher, Encryptor],
})
export class CryptographyModule {}
