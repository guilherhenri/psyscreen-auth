import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import {
  AuthTopics,
  EnrollIdentityCodes,
  EnrollIdentityErrorCode,
  GlobalErrorCodes,
  RegisterUserCommand,
  RegisterUserResponse,
} from '@psyscreen/contracts'

import { EnrollIdentityUseCase } from '@/domain/application/use-cases/enroll-identity'
import { EmailAlreadyInUseError } from '@/domain/application/use-cases/errors/email-already-in-use'

import { UserPresenter } from '../presenter/user-presenter'

@Controller()
export class RegisterUserCommandHandler {
  constructor(private readonly enrollIdentity: EnrollIdentityUseCase) {}

  @MessagePattern(AuthTopics.REGISTER_USER)
  async handle(
    @Payload() command: RegisterUserCommand
  ): Promise<RegisterUserResponse> {
    const result = await this.enrollIdentity.execute(command)

    if (result.isLeft()) {
      const domainError = result.value

      let code: EnrollIdentityErrorCode
      const message = domainError.message

      switch (domainError.constructor) {
        case EmailAlreadyInUseError:
          code = EnrollIdentityCodes.EMAIL_ALREADY_IN_USE
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

    return {
      success: true,
      data: { user: UserPresenter.toMessage(result.value.user) },
    }
  }
}
