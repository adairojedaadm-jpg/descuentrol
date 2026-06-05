import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Tipo para emular la respuesta de Upstash Ratelimit
interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// Interfaz para el Rate Limiter
interface Limiter {
  limit: (identifier: string) => Promise<RateLimitResult>
}

let ratelimit: Limiter

const isUpstashConfigured = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_URL !== 'https://xxx.upstash.io' &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.UPSTASH_REDIS_REST_TOKEN !== 'xxxxx'

if (isUpstashConfigured) {
  try {
    const redis = Redis.fromEnv()
    const limiterInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/descuentrol',
    })
    
    ratelimit = {
      limit: async (identifier: string) => {
        try {
          const res = await limiterInstance.limit(identifier)
          return {
            success: res.success,
            limit: res.limit,
            remaining: res.remaining,
            reset: res.reset
          }
        } catch (err) {
          console.warn('[Rate Limit] Error en llamada a Upstash. Denegando request (fail closed):', err)
          return {
            success: false,
            limit: 20,
            remaining: 0,
            reset: Date.now() + 60000,
          }
        }
      }
    }
  } catch (error) {
    console.warn('Fallo al inicializar Upstash Redis client. Usando rate limiter simulado.', error)
    ratelimit = createMockLimiter()
  }
} else {
  if (process.env.NODE_ENV !== 'production') {
    console.info('Upstash Redis no configurado o tiene valores por defecto. Rate limiting desactivado (simulado).')
  }
  ratelimit = createMockLimiter()
}

function createMockLimiter(): Limiter {
  return {
    limit: async () => ({
      success: true,
      limit: 20,
      remaining: 20,
      reset: Date.now() + 60000,
    })
  }
}

export { ratelimit }
