export function normalizeCpf(cpf: string): string | null {
  const normalized = cpf.replace(/\D/g, '')
  return normalized.length === 11 ? normalized : null
}
