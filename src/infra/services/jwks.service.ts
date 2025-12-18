import { Injectable } from '@nestjs/common'
import * as jose from 'jose'

import { EnvService } from '../env/env.service'

@Injectable()
export class JwksService {
  constructor(private readonly env: EnvService) {}

  async keys() {
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
}
