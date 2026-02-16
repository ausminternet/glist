import { Hono } from 'hono'
import bootstrapRouter from './bootstrap.router'
import categoriesRouter from './categories.router'
import { type HouseholdContext, withHousehold } from './context'
import { eventsRouter } from './events.router'
import inventoryItemsRouter from './inventory-items.router'
import shoppingListItemsRouter from './shopping-list-items.router'
import shopsRouter from './shops.router'

const householdRouter = new Hono<HouseholdContext>()

householdRouter.use('*', withHousehold)
householdRouter.route('/bootstrap', bootstrapRouter)
householdRouter.route('/categories', categoriesRouter)
householdRouter.route('/inventory-items', inventoryItemsRouter)
householdRouter.route('/shopping-list-items', shoppingListItemsRouter)
householdRouter.route('/shops', shopsRouter)
householdRouter.route('/', eventsRouter)

export default householdRouter
