import type { Context, Next } from 'hono'

const serverKey = async (c: Context, next: Next) => {
  const keyServer = c.req.header('x-api-key')

  if (keyServer !== c.env.API_KEY) {
    return c.json({
      status: 403,
      message: 'Forbidden you are not allowed to access this resource',
    })
  }

  await next()
}

export default serverKey
