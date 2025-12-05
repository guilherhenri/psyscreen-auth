import { Injectable } from '@nestjs/common'
import { JwtService, type JwtSignOptions } from '@nestjs/jwt'

import { Encryptor } from '@/domain/application/cryptography/encryptor'

@Injectable()
export class JwtEncryptor implements Encryptor {
  private readonly defaults: Record<
    'access' | 'refresh',
    Partial<JwtSignOptions>
  > = {
    access: { expiresIn: '10m' },
    refresh: { expiresIn: '7d' },
  }

  constructor(private jwtService: JwtService) {}

  encrypt(
    payload: Record<string, unknown>,
    type: 'access' | 'refresh'
  ): Promise<string> {
    return this.jwtService.signAsync(payload, this.defaults[type])
  }
}
