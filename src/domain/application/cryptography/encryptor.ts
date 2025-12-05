export abstract class Encryptor {
  abstract encrypt(
    payload: Record<string, unknown>,
    type: 'access' | 'refresh'
  ): Promise<string>
}
