import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'

import { EnrollIdentityUseCase } from '@/domain/application/use-cases/enroll-identity'
import { EmailAlreadyInUseError } from '@/domain/application/use-cases/errors/email-already-in-use'

import { CreateUserBodyDto } from '../dtos/create-user-body'

@Controller('sign-up')
export class RegisterController {
  constructor(private readonly enrollIdentity: EnrollIdentityUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(@Body() body: CreateUserBodyDto) {
    const { name, email, password } = body

    const result = await this.enrollIdentity.execute({
      name,
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case EmailAlreadyInUseError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return { message: 'Usuário registrado com sucesso.' }
  }
}
