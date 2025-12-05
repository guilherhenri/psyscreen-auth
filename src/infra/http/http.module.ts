import { Module } from '@nestjs/common'

import { AuthenticateSessionUseCase } from '@/domain/application/use-cases/authenticate-session'
import { EnrollIdentityUseCase } from '@/domain/application/use-cases/enroll-identity'
import { RenewTokenUseCase } from '@/domain/application/use-cases/renew-token'

import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { EnvModule } from '../env/env.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { JwksController } from './controllers/jwks.controller'
import { RefreshTokenController } from './controllers/refresh-token.controller'
import { RegisterController } from './controllers/register.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule, EnvModule],
  controllers: [
    RegisterController,
    AuthenticateController,
    RefreshTokenController,
    JwksController,
  ],
  providers: [
    EnrollIdentityUseCase,
    AuthenticateSessionUseCase,
    RenewTokenUseCase,
  ],
})
export class HttpModule {}
