const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type CategoryId = string & { readonly __brand: 'CategoryId' }

export const parseCategoryId = (raw: string): CategoryId => {
  if (!UUID_REGEX.test(raw)) {
    throw new Error('invalid CategoryId')
  }
  return raw as CategoryId
}

export const generateCategoryId = (): CategoryId =>
  crypto.randomUUID() as CategoryId
