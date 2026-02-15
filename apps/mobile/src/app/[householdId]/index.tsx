import { Link } from 'expo-router'
import { Text, View } from 'react-native'
import { usePrefetchCategories } from '@/api/categories'
import { useShoppingLists } from '@/api/shopping-lists'
import { usePrefetchShops } from '@/api/shops'
import { useHouseholdId } from '@/utils/use-household-id'

export default function Index() {
  const householdId = useHouseholdId()
  const { shoppingLists } = useShoppingLists(householdId)

  usePrefetchCategories(householdId)
  usePrefetchShops(householdId)

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Link href={`/${householdId}/inventory`}>Inventar</Link>
      <View style={{ height: 10 }} />
      {shoppingLists.map((list) => (
        <Link key={list.id} href={`/${householdId}/shopping-lists/${list.id}`}>
          <Text>{list.name}</Text>
        </Link>
      ))}
    </View>
  )
}
