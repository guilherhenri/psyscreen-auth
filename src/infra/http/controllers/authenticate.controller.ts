import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import type { Response } from 'express'

import { AuthenticateSessionUseCase } from '@/domain/application/use-cases/authenticate-session'
import { InvalidCredentialsError } from '@/domain/application/use-cases/errors/invalid-credentials'

import { AuthenticateUserBodyDto } from '../dtos/authenticate-user-body'

@Controller('/sessions')
export class AuthenticateController {
  constructor(
    private readonly authenticateSession: AuthenticateSessionUseCase
  ) {}

  @Post()
  @HttpCode(200)
  async handle(@Body() body: AuthenticateUserBodyDto, @Res() res: Response) {
    const { email, password } = body

    const result = await this.authenticateSession.execute({
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case InvalidCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { accessToken, refreshToken } = result.value

    return res
      .status(200)
      .send({ access_token: accessToken, refresh_token: refreshToken })
  }
}
