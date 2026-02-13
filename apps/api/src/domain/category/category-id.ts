import { assertValidUuid, DomainId, generateId } from '../shared/domain-id'

export type CategoryId = DomainId<'CategoryId'>

export const parseCategoryId = (raw: string): CategoryId => {
  assertValidUuid(raw)
  return raw as CategoryId
}

export const generateCategoryId = (): CategoryId => generateId<'CategoryId'>()
