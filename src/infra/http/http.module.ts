import { Module } from '@nestjs/common'

import { EnrollIdentityUseCase } from '@/domain/application/use-cases/enroll-identity'

import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { RegisterController } from './controllers/register.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [RegisterController],
  providers: [EnrollIdentityUseCase],
})
export class HttpModule {}
