// utils/password-generator.util.ts
import { randomBytes } from 'crypto'

export class PasswordGenerator {
  /**
   * Gera senha alfanumérica forte
   */
  static generateSecurePassword(length: number = 32): string {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const bytes = randomBytes(length)

    return Array.from(bytes)
      .map((byte) => charset[byte % charset.length])
      .join('')
  }

  /**
   * Gera senha com caracteres especiais
   */
  static generateComplexPassword(length: number = 32): string {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
    const bytes = randomBytes(length)

    return Array.from(bytes)
      .map((byte) => charset[byte % charset.length])
      .join('')
  }

  /**
   * Gera senha hexadecimal
   */
  static generateHexPassword(length: number = 32): string {
    return randomBytes(length).toString('hex')
  }
}
