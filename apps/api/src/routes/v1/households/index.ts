import { Hono } from 'hono'
import bootstrapRouter from './bootstrap.router'
import { HouseholdContext, withHousehold } from './context'
import inventoryItemsRouter from './inventory-items.router'

const householdRouter = new Hono<HouseholdContext>()

householdRouter.use('*', withHousehold)
householdRouter.route('/bootstrap', bootstrapRouter)
householdRouter.route('/inventory-items', inventoryItemsRouter)

export default householdRouter
