import type { User } from '@/domain/enterprise/entities/user'

export class UserPresenter {
  static toMessage(user: User) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
    }
  }
}
