import { Module } from '@nestjs/common'

import { EnvModule } from '../env/env.module'
import { JwksService } from './jwks.service'

@Module({
  imports: [EnvModule],
  providers: [JwksService],
  exports: [JwksService],
})
export class ServicesModule {}
