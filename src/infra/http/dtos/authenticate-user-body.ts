import { IsEmail, IsString } from 'class-validator'

export class AuthenticateUserBodyDto {
  @IsEmail()
  email: string

  @IsString()
  password: string
}
