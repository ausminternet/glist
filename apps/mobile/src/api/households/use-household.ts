import { useHouseholds } from './use-households'

export function useHousehold(id: string) {
  const { households } = useHouseholds()
  const household = households.find((h) => h.id === id)

  if (!household) {
    throw new Error(`Household with id "${id}" not found`)
  }

  return household
}
