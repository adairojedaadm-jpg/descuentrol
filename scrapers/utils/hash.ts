import { createHash } from 'crypto'

export function generateHash(bankId: string, title: string, sourceUrl?: string | null): string {
  const data = `${bankId}:${title.trim().toLowerCase()}:${(sourceUrl || '').trim().toLowerCase()}`
  return createHash('sha256').update(data).digest('hex')
}
