import { isFuture } from 'date-fns'

export function validateExpiration(expiresAt: Date | string) {
  const dueDate = new Date(expiresAt)

  return isFuture(dueDate)
}
