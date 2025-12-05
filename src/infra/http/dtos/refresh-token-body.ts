import { IsUUID } from 'class-validator'

export class RefreshTokenBodyDto {
  @IsUUID('4')
  userId: string
}
