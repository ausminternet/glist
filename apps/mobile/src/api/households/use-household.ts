import { useHouseholds } from './use-households'

export function useHousehold(id: string) {
  const { households, ...rest } = useHouseholds()
  const household = households.find((h) => h.id === id)

  return {
    household,
    ...rest,
  }
}
