import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useCategories } from '@/api/categories'
import { useFindInventoryItems } from '@/api/inventory-items'
import { useShoppingListItem } from '@/api/shopping-list-items/use-shopping-list-item'
import { useShops } from '@/api/shops'
import { colors } from '@/components/colors'
import { DecimalInput } from '@/components/decimal-input'
import { InventorySearchResults } from '@/components/inventory-search-results'
import { LinkedInventoryInfo } from '@/components/linked-inventory-info'
import { List } from '@/components/list.components'
import { ListItem } from '@/components/list-item.component'
import { DefaultInputStyles, ListItemInput } from '@/components/list-item-input'
import { ListItemInputContainer } from '@/components/list-item-input-container'
import { NavbarCancelButton } from '@/components/navbar-cancel-button'
import { UnitSelector } from '@/components/unit-selector'
import { useSubmitShoppingListForm } from '@/hooks/use-handle-shopping-list-item-form-submit'
import { useInventoryItemSubtitle } from '@/hooks/use-inventory-item-subtitle'
import { useLinkedInventoryItem } from '@/hooks/use-linked-inventory-item'
import { useShoppingListForm } from '@/hooks/use-shopping-list-item-form'
import { useCategorySelectionStore } from '@/stores/category-selection'
import { useShopsSelectionStore } from '@/stores/shops-selection'
import { sameUuids } from '@/utils/same-uuids'

export default function Modal() {
  const [search, setSearch] = useState<string | null>(null)
  const router = useRouter()
  const { itemId, householdId } = useLocalSearchParams<{
    itemId: string
    householdId: string
  }>()
  const { getSubtitle } = useInventoryItemSubtitle(householdId)
  const [preventRemove, setPreventRemove] = useState(false)
  const { shops } = useShops(householdId)
  const { categories } = useCategories(householdId)
  const { searchInventoryItems } = useFindInventoryItems(householdId)

  const { reset, setValue, values, isValid, isDirty, setShoppingListItem } =
    useShoppingListForm()

  const {
    inventoryItem,
    linkInventoryItem,
    handleSelectInventoryItem,
    handleUnselectInventoryItem,
  } = useLinkedInventoryItem({ householdId, setValue })

  const { findInventoryItemById } = useFindInventoryItems(householdId)

  const { selectedCategoryId, setSelectedCategoryId, clearSelectedCategory } =
    useCategorySelectionStore()
  const { selectedShopIds, setSelectedShopIds, clearSelectedShops } =
    useShopsSelectionStore()

  const resetFormAndGoBack = () => {
    clearSelectedCategory()
    clearSelectedShops()
    reset()
    router.back()
  }

  const { shoppingListItem } = useShoppingListItem(itemId, householdId)
  const { submit, isSubmitting } = useSubmitShoppingListForm({
    householdId,
    setPreventRemove,
    resetFormAndGoBack,
  })

  useEffect(() => {
    if (shoppingListItem) {
      setShoppingListItem(shoppingListItem)
      setSelectedCategoryId(shoppingListItem.categoryId)
      setSelectedShopIds(shoppingListItem.shopIds)

      if (!shoppingListItem.inventoryItemId) {
        return
      }

      const inventoryItem = findInventoryItemById(
        shoppingListItem.inventoryItemId,
      )

      if (inventoryItem) {
        linkInventoryItem(inventoryItem)
      }
    }
  }, [
    shoppingListItem,
    setSelectedCategoryId,
    setSelectedShopIds,
    findInventoryItemById,
    linkInventoryItem,
    setShoppingListItem,
  ])

  const hasChanges =
    isDirty ||
    selectedCategoryId !== shoppingListItem?.categoryId ||
    (shoppingListItem
      ? !sameUuids(selectedShopIds, shoppingListItem.shopIds)
      : selectedShopIds.length > 0)

  const canSubmit = !isSubmitting && isValid && hasChanges

  useEffect(() => {
    setPreventRemove(hasChanges)
  }, [hasChanges])

  const searchResults = search ? searchInventoryItems(search) : []

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Neuer Eintrag',
          headerTransparent: true,
          headerLeft: () => (
            <NavbarCancelButton
              onCancel={() => resetFormAndGoBack()}
              preventRemove={preventRemove}
            />
          ),
          unstable_headerRightItems: () => [
            {
              type: 'button',
              label: shoppingListItem ? 'Speichern' : 'Erstellen',
              icon: {
                type: 'sfSymbol',
                name: 'checkmark',
              },
              variant: 'prominent',
              disabled: !canSubmit,
              onPress: () => {
                submit(
                  {
                    values,
                    shopIds: selectedShopIds,
                    categoryId: selectedCategoryId,
                    inventoryItemId: inventoryItem?.id,
                  },
                  shoppingListItem?.id,
                )
              },
            },
          ],
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
          <ListItemInputContainer>
            <TextInput
              placeholder="Milch"
              onChangeText={(text) => {
                // Das verhindert, dass die async Eventqueue von RN nach dem
                // onBlur noch einmal das Feld flushed und mit einem alten Wert
                // befuekllt
                if (inventoryItem) return
                setValue('name', text)
                setSearch(text)
              }}
              value={values.name}
              autoCorrect={false}
              autoCapitalize="none"
              autoFocus
              editable={!inventoryItem}
              style={[
                DefaultInputStyles.input,
                {
                  fontSize: 23,
                  fontWeight: 'bold',
                  color: inventoryItem
                    ? colors.system.teal
                    : colors.label.primary,
                },
              ]}
            />
            {inventoryItem && (
              <Pressable onPress={() => handleUnselectInventoryItem()}>
                <SymbolView
                  name="personalhotspot.slash"
                  size={36}
                  tintColor={colors.system.red}
                />
              </Pressable>
            )}
          </ListItemInputContainer>

          {!inventoryItem && search && searchResults?.length && (
            <InventorySearchResults
              items={searchResults}
              onSelectItem={(item) => {
                setSearch(null)
                handleSelectInventoryItem(item)
              }}
              getSubtitle={getSubtitle}
            />
          )}

          <ListItemInput
            inputProps={{
              placeholder: 'Notizen',
              onChangeText: (text) => setValue('description', text),
              value: values.description ?? undefined,
              multiline: true,
            }}
          />
        </List>

        <View>
          <List>
            <ListItemInputContainer icon="plusminus" iconSize={24}>
              <Text
                style={{
                  fontSize: 17,
                  color: colors.label.primary,
                  flexGrow: 1,
                }}
              >
                Menge
              </Text>

              <DecimalInput
                placeholder="3"
                keyboardType="decimal-pad"
                value={values.quantity}
                onChange={(value) => setValue('quantity', value)}
                style={{
                  marginInlineStart: 'auto',
                  flexGrow: 0,
                  minWidth: 60,
                  backgroundColor: colors.groupedBackground.primary,
                  borderWidth: 1,
                  borderColor: colors.separator.default,
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  textAlign: 'center',
                  fontSize: 17,
                  color: colors.label.primary,
                }}
              />

              <UnitSelector
                value={values.quantityUnit}
                onChange={(value) => setValue('quantityUnit', value)}
                label="singular"
              />
            </ListItemInputContainer>
          </List>

          {inventoryItem && (
            <LinkedInventoryInfo inventoryItem={inventoryItem} />
          )}
        </View>

        <List>
          <ListItem
            icon="square.grid.2x2"
            iconSize={24}
            href={`/${householdId}/modals/select-category`}
            right={
              selectedCategoryId
                ? categories.find((c) => c.id === selectedCategoryId)?.name
                : 'Ohne'
            }
          >
            Kategorie
          </ListItem>
          <ListItem
            icon="storefront"
            iconSize={24}
            href={`/${householdId}/modals/select-shops`}
            right={
              selectedShopIds && selectedShopIds.length > 0
                ? selectedShopIds
                    .map((id) => shops.find((s) => s.id === id)?.name)
                    .filter(Boolean)
                    .join(', ')
                : 'Ohne'
            }
          >
            Geschäfte
          </ListItem>
        </List>
      </ScrollView>
    </>
  )
}
