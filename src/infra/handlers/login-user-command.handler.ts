import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import {
  AuthenticateSessionCodes,
  type AuthenticateSessionErrorCode,
  type AuthenticateUserResponse,
  AuthTopics,
  GlobalErrorCodes,
  type LoginUserCommand,
} from '@psyscreen/contracts'

import { AuthenticateSessionUseCase } from '@/domain/application/use-cases/authenticate-session'
import { InvalidCredentialsError } from '@/domain/application/use-cases/errors/invalid-credentials'

@Controller()
export class LoginUserCommandHandler {
  constructor(
    private readonly authenticateSession: AuthenticateSessionUseCase
  ) {}

  @MessagePattern(AuthTopics.LOGIN_USER)
  async handle(
    @Payload() command: LoginUserCommand
  ): Promise<AuthenticateUserResponse> {
    const result = await this.authenticateSession.execute(command)

    if (result.isLeft()) {
      const domainError = result.value

      let code: AuthenticateSessionErrorCode
      const message = domainError.message

      switch (domainError.constructor) {
        case InvalidCredentialsError:
          code = AuthenticateSessionCodes.INVALID_CREDENTIALS
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
