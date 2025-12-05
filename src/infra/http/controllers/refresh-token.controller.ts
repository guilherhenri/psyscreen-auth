import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
  Res,
} from '@nestjs/common'
import type { Response } from 'express'

import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found'
import { RenewTokenUseCase } from '@/domain/application/use-cases/renew-token'

import { RefreshTokenBodyDto } from '../dtos/refresh-token-body'

@Controller('/auth/refresh')
export class RefreshTokenController {
  constructor(private readonly renewToken: RenewTokenUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(@Body() body: RefreshTokenBodyDto, @Res() res: Response) {
    const { userId } = body

    const result = await this.renewToken.execute({
      userId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
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
