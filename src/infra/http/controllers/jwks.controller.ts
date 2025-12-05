import { Controller, Get } from '@nestjs/common'
import * as jose from 'jose'

import { EnvService } from '@/infra/env/env.service'

@Controller('.well-known/jwks.json')
export class JwksController {
  constructor(private readonly env: EnvService) {}

  private async getJwks() {
    const publicKeyPem = Buffer.from(
      this.env.get('JWT_PUBLIC_KEY'),
      'base64'
    ).toString('utf8')

    const jwk = await jose.exportJWK(
      await jose.importSPKI(publicKeyPem, 'RS256')
    )

    jwk.kid = '2025-12'
    jwk.alg = 'RS256'
    jwk.use = 'sig'

    return { keys: [jwk] }
  }

  @Get()
  async handle() {
    return this.getJwks()
  }
}
