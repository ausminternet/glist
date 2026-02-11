import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export function createDb(d1: D1Database) {
  const db = drizzle(d1, { schema })

  d1.exec('PRAGMA foreign_keys = ON;').catch(console.error)

  return db
}

export * from './schema'
