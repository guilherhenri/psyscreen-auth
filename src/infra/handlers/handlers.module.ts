import { Module } from '@nestjs/common'

import { AuthenticateSessionUseCase } from '@/domain/application/use-cases/authenticate-session'
import { EnrollIdentityUseCase } from '@/domain/application/use-cases/enroll-identity'
import { RenewTokenUseCase } from '@/domain/application/use-cases/renew-token'

import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { ServicesModule } from '../services/services.module'
import { JwksCommandHandler } from './jwks-keys-command.handler'
import { LoginUserCommandHandler } from './login-user-command.handler'
import { RefreshTokenCommandHandler } from './refresh-token-command.handler'
import { RegisterUserCommandHandler } from './register-user-command.handler'

@Module({
  imports: [DatabaseModule, CryptographyModule, ServicesModule],
  controllers: [
    RegisterUserCommandHandler,
    LoginUserCommandHandler,
    RefreshTokenCommandHandler,
    JwksCommandHandler,
  ],
  providers: [
    EnrollIdentityUseCase,
    AuthenticateSessionUseCase,
    RenewTokenUseCase,
  ],
})
export class HandlersModule {}
