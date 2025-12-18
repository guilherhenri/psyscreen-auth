import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { AuthTopics, type JwksResponse } from '@psyscreen/contracts'

import { JwksService } from '../services/jwks.service'

@Controller()
export class JwksCommandHandler {
  constructor(private readonly jwks: JwksService) {}

  @MessagePattern(AuthTopics.JWKS)
  async handle(): Promise<JwksResponse> {
    const { keys } = await this.jwks.keys()

    return {
      success: true,
      data: { keys },
    }
  }
}
