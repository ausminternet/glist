import { createDb } from '@/db'
import { inventoryItems } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { HouseholdContext } from './context'

const inventoryItemsRouter = new Hono<HouseholdContext>()

inventoryItemsRouter.get('/', async (c) => {
  try {
    const householdId = c.get('householdId')
    const db = createDb(c.env.glist_db)

    const inventoryItemsResult = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.householdId, householdId))

    return c.json({
      success: true,
      data: inventoryItemsResult,
    })
  } catch (error) {
    console.error('Error fetching inventory items:', error)
    return c.json(
      {
        success: false,
        error: 'Internal server error',
      },
      500,
    )
  }
})

export default inventoryItemsRouter
