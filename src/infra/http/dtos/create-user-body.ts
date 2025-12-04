import { IsEmail, IsString } from 'class-validator'

export class CreateUserBodyDto {
  @IsString()
  name: string

  @IsEmail()
  email: string

  @IsString()
  password: string
}
