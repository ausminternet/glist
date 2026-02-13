const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type DomainId<Brand extends string> = string & {
  readonly __brand: Brand
}

export function assertValidUuid(raw: string): asserts raw is DomainId<string> {
  if (!UUID_REGEX.test(raw)) {
    throw new Error(`invalid UUID: ${raw}`)
  }
}

export const generateId = <Brand extends string>(): DomainId<Brand> =>
  crypto.randomUUID() as DomainId<Brand>
