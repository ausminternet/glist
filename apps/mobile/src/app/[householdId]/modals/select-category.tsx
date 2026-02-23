import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { ScrollView } from 'react-native'
import { useCategories } from '@/api/categories'
import { List } from '@/components/list.components'
import { ListItem } from '@/components/list-item.component'
import { useCategorySelectionStore } from '@/stores/category-selection'

export default function SelectCategory() {
  const { householdId } = useLocalSearchParams<{ householdId: string }>()
  const router = useRouter()

  const { categories } = useCategories(householdId)
  const { selectedCategoryId, setSelectedCategoryId } =
    useCategorySelectionStore()

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId)

    router.back()
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Kategorie auswählen',
          headerBackButtonDisplayMode: 'minimal',
          headerTransparent: true,
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: 24,
          flexDirection: 'column',
        }}
      >
        <List>
          <ListItem
            onPress={() => handleCategorySelect(null)}
            right={
              !selectedCategoryId ? (
                <SymbolView name="checkmark" size={24} />
              ) : undefined
            }
          >
            Keine Kategorie
          </ListItem>

          {categories.map((category) => (
            <ListItem
              key={category.id}
              onPress={() => handleCategorySelect(category.id)}
              right={
                category.id === selectedCategoryId ? (
                  <SymbolView name="checkmark" size={22} />
                ) : undefined
              }
            >
              {category.name}
            </ListItem>
          ))}
        </List>
      </ScrollView>
    </>
  )
}
