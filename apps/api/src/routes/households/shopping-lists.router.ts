import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import z from 'zod'
import { CreateShoppingListCommandHandler } from '@/application/commands/create-shopping-list'
import { DeleteShoppingListCommandHandler } from '@/application/commands/delete-shopping-list'
import { GetShoppingListQueryHandler } from '@/application/queries/get-shopping-list'
import { GetShoppingListsQueryHandler } from '@/application/queries/get-shopping-lists'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleShoppingListQueryRepository } from '@/infrastructure/repositories/drizzle-shopping-list-query-repository'
import { DrizzleShoppingListRepository } from '@/infrastructure/repositories/drizzle-shopping-list-repository'
import type { HouseholdContext } from './context'

const shoppingListsRouter = new Hono<HouseholdContext>()

shoppingListsRouter.get('/', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListQueryRepository(db)
  const query = new GetShoppingListsQueryHandler(repository)

  const result = await query.execute({ householdId })

  return c.json({ success: true, data: result })
})

shoppingListsRouter.get('/:id', async (c) => {
  const listId = c.req.param('id')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListQueryRepository(db)
  const query = new GetShoppingListQueryHandler(repository)

  const result = await query.execute({ id: listId })

  return c.json({ success: true, data: result })
})

const CreateShoppingListCommandSchema = z.object({
  name: z.string().trim().nonempty('Name cannot be empty'),
})

shoppingListsRouter.post(
  '/',
  zValidator('json', CreateShoppingListCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const { name } = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleShoppingListRepository(db)
    const command = new CreateShoppingListCommandHandler(repository)

    const result = await command.execute({ name }, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'INVALID_NAME':
          console.error('Failed to create shopping list', {
            name,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 400)
      }
    }

    return c.json({ success: true, data: { id: result.value } }, 201)
  },
)

shoppingListsRouter.delete('/:id', async (c) => {
  const householdId = c.get('householdId')
  const id = c.req.param('id')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleShoppingListRepository(db)
  const command = new DeleteShoppingListCommandHandler(repository)

  const result = await command.execute({ shoppingListId: id })

  if (!result.ok) {
    switch (result.error.type) {
      case 'SHOPPING_LIST_NOT_FOUND':
        console.error('Failed to delete shopping list', {
          id,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
      case 'CANNOT_DELETE_LAST_SHOPPING_LIST':
        console.error('Failed to delete shopping list', {
          id,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 400)
    }
  }

  return c.json({ success: true })
})

export default shoppingListsRouter
