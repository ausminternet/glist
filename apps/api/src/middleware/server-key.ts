import type { Context, Next } from 'hono'

const serverKey = async (c: Context, next: Next) => {
  // Photos are public, no API key required
  if (c.req.path.startsWith('/photos')) {
    return next()
  }

  const keyServer = c.req.header('x-api-key')

  if (keyServer !== c.env.API_KEY) {
    return c.json(
      {
        success: false,
        error: 'Forbidden: invalid API key',
      },
      403,
    )
  }

  await next()
}

export default serverKey
