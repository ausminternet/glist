import {
  CreateCategoryCommandHandler,
  CreateCategoryCommandSchema,
} from '@/application/commands/create-category'
import { DeleteCategoryCommandHandler } from '@/application/commands/delete-category'
import {
  ReorderCategoriesCommandHandler,
  ReorderCategoriesCommandSchema,
} from '@/application/commands/reorder-categories'
import {
  ReplaceCategoryCommandHandler,
  ReplaceCategoryCommandSchema,
} from '@/application/commands/replace-category'
import { createDb } from '@/infrastructure/persistence'
import { DrizzleCategoryDtoRepository } from '@/infrastructure/repositories/drizzle-category-dto-repository'
import { DrizzleCategoryRepository } from '@/infrastructure/repositories/drizzle-category-repository'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HouseholdContext } from './context'

const categoriesRouter = new Hono<HouseholdContext>()

categoriesRouter.get('/', async (c) => {
  const householdId = c.get('householdId')
  const db = createDb(c.env.glist_db)
  const repository = new DrizzleCategoryDtoRepository(db)

  const categories = await repository.findAllByHouseholdId(householdId)

  return c.json({ success: true, data: categories })
})

categoriesRouter.post(
  '/',
  zValidator('json', CreateCategoryCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleCategoryRepository(db)
    const command = new CreateCategoryCommandHandler(repository)

    const result = await command.execute(input, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'INVALID_NAME':
          console.error('Failed to create category', {
            input,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 400)
      }
    }

    return c.json({ success: true, data: { id: result.value } }, 201)
  },
)

categoriesRouter.put(
  '/reorder',
  zValidator('json', ReorderCategoriesCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleCategoryRepository(db)
    const command = new ReorderCategoriesCommandHandler(repository)

    const result = await command.execute(input, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'CATEGORY_NOT_FOUND':
          console.error('Failed to reorder categories', {
            input,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 404)
        case 'CATEGORY_IDS_MISMATCH':
          console.error('Failed to reorder categories', {
            input,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 400)
      }
    }

    return c.json({ success: true })
  },
)

categoriesRouter.put(
  '/:id',
  zValidator('json', ReplaceCategoryCommandSchema),
  async (c) => {
    const householdId = c.get('householdId')
    const id = c.req.param('id')
    const input = c.req.valid('json')

    const db = createDb(c.env.glist_db)
    const repository = new DrizzleCategoryRepository(db)
    const command = new ReplaceCategoryCommandHandler(repository)

    const result = await command.execute(id, input, { householdId })

    if (!result.ok) {
      switch (result.error.type) {
        case 'CATEGORY_NOT_FOUND':
          console.error('Failed to replace category', {
            id,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 404)
        case 'INVALID_NAME':
          console.error('Failed to replace category', {
            id,
            input,
            householdId,
            error: result.error,
          })
          return c.json({ success: false, error: result.error }, 400)
      }
    }

    return c.json({ success: true })
  },
)

categoriesRouter.delete('/:id', async (c) => {
  const householdId = c.get('householdId')
  const id = c.req.param('id')

  const db = createDb(c.env.glist_db)
  const repository = new DrizzleCategoryRepository(db)
  const command = new DeleteCategoryCommandHandler(repository)

  const result = await command.execute(id, { householdId })

  if (!result.ok) {
    switch (result.error.type) {
      case 'CATEGORY_NOT_FOUND':
        console.error('Failed to delete category', {
          id,
          householdId,
          error: result.error,
        })
        return c.json({ success: false, error: result.error }, 404)
    }
  }

  return c.json({ success: true })
})

export default categoriesRouter
