import { Hono } from 'hono'
import bootstrapRouter from './bootstrap'
import { HouseholdContext, withHousehold } from './context'

const householdRouter = new Hono<HouseholdContext>()

householdRouter.use('*', withHousehold)
householdRouter.route('/bootstrap', bootstrapRouter)

export default householdRouter
