import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import {
  AuthTopics,
  GlobalErrorCodes,
  type RefreshTokenCommand,
  type RefreshTokenResponse,
  type RenewTokenErrorCode,
} from '@psyscreen/contracts'

import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found'
import { RenewTokenUseCase } from '@/domain/application/use-cases/renew-token'

@Controller()
export class RefreshTokenCommandHandler {
  constructor(private readonly renewToken: RenewTokenUseCase) {}

  @MessagePattern(AuthTopics.REFRESH_TOKEN)
  async handle(
    @Payload() command: RefreshTokenCommand
  ): Promise<RefreshTokenResponse> {
    const result = await this.renewToken.execute(command)

    if (result.isLeft()) {
      const domainError = result.value

      let code: RenewTokenErrorCode
      const message = domainError.message

      switch (domainError.constructor) {
        case ResourceNotFoundError:
          code = GlobalErrorCodes.RESOURCE_NOT_FOUND
          break
        default:
          code = GlobalErrorCodes.UNEXPECTED_ERROR
      }

      return {
        success: false,
        error: {
          code,
          message,
        },
      }
    }

    const { accessToken, refreshToken } = result.value

    return {
      success: true,
      data: { accessToken, refreshToken },
    }
  }
}
