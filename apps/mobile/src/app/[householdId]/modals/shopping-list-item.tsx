import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useCategories } from '@/api/categories'
import { useFindInventoryItems } from '@/api/inventory-items'
import { useDeleteShoppingListItem } from '@/api/shopping-list-items'
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
import { useHouseholdId } from '@/hooks/use-household-id'
import { useInventoryItemSubtitle } from '@/hooks/use-inventory-item-subtitle'
import { useShoppingListForm } from '@/hooks/use-shopping-list-item-form'
import { useSubmitShoppingListItemForm } from '@/hooks/use-submit-shopping-list-item-form-submit'

export default function ShoppingListItemModal() {
  const [shouldClose, setShouldClose] = useState(false)

  const [search, setSearch] = useState<string | null>(null)

  const router = useRouter()
  const householdId = useHouseholdId()

  const { itemId, inventoryItemId } = useLocalSearchParams<{
    itemId: string
    inventoryItemId?: string
  }>()
  const { getSubtitle } = useInventoryItemSubtitle()
  const { shops } = useShops()
  const { categories } = useCategories()
  const { searchInventoryItems } = useFindInventoryItems()
  const {
    deleteShoppingListItem,
    isPending: isDeletePending,
    isError: isDeleteError,
  } = useDeleteShoppingListItem()

  const { submit, isSubmitting } = useSubmitShoppingListItemForm()

  const {
    setValue,
    values,
    canSubmit,
    commit,
    isDirty,
    linkInventoryItem,
    unlinkInventoryItem,
    inventoryItem,
    shoppingListItem,
  } = useShoppingListForm(itemId, inventoryItemId)

  useEffect(() => {
    if (!isDeleteError) return

    Alert.alert('Fehler', 'Der Eintrag konnte nicht gelöscht werden.')
  }, [isDeleteError])

  const preventSubmit = isSubmitting || !canSubmit || isDeletePending
  const preventRemove = isDirty || isSubmitting || isDeletePending

  const searchResults = search ? searchInventoryItems(search) : []
  const showSearchResults = !!search && searchResults?.length > 0

  const handleUnselectInventoryItem = () => {
    Alert.alert(
      'Zurücksetzen',
      'Möchtest du die Verknüpfung zum Vorrat auflösen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: () => unlinkInventoryItem(),
        },
      ],
    )
  }

  const handleDelete = () => {
    Alert.alert(
      'Eintrag löschen',
      'Möchtest du diesen Eintrag wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            if (!shoppingListItem) return
            deleteShoppingListItem(shoppingListItem.id)
          },
        },
      ],
    )
  }

  const handleSubmit = async () => {
    const result = await submit(values, shoppingListItem?.id)

    if (!result.ok) {
      Alert.alert(
        'Fehler',
        result.error?.type === 'add'
          ? 'Der Eintrag konnte nicht erstellt werden.'
          : 'Der Eintrag konnte nicht aktualisiert werden.',
      )

      return
    }

    commit()
    setShouldClose(true)
  }

  useEffect(() => {
    if (!shouldClose) return
    if (preventRemove) return

    router.back()
  }, [shouldClose, preventRemove, router])

  let title =
    shoppingListItem || isDeletePending ? 'Bearbeiten' : 'Neuer Einkauf'

  if (inventoryItem && shoppingListItem) {
    title = 'Einkauf aktualisieren'
  }

  if (inventoryItem && !shoppingListItem) {
    title = 'Vorrat einkaufen'
  }

  const focusName = !values.name
  const focusQuantity = !!values.name && !values.quantity

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerTransparent: true,
          headerLeft: () => (
            <NavbarCancelButton
              disabled={isSubmitting || isDeletePending}
              onCancel={() => router.back()}
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
              disabled: preventSubmit,
              onPress: handleSubmit,
            },
          ],
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={64}
      >
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
                autoFocus={focusName}
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
                <Pressable onPress={handleUnselectInventoryItem}>
                  <SymbolView
                    name="personalhotspot.slash"
                    size={36}
                    tintColor={colors.system.red}
                  />
                </Pressable>
              )}
            </ListItemInputContainer>

            {showSearchResults && (
              <InventorySearchResults
                items={searchResults}
                onSelectItem={(item) => {
                  setSearch(null)
                  linkInventoryItem(item)
                }}
                getSubtitle={getSubtitle}
              />
            )}

            <ListItemInput
              inputProps={{
                placeholder: 'Notizen',
                onChangeText: (text) => setValue('description', text),
                value: values.description,
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
                  autoFocus={focusQuantity}
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
                values.categoryId
                  ? categories.find((c) => c.id === values.categoryId)?.name
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
                values.shopIds && values.shopIds.length > 0
                  ? values.shopIds
                      .map((id) => shops.find((s) => s.id === id)?.name)
                      .filter(Boolean)
                      .join(', ')
                  : 'Ohne'
              }
            >
              Geschäfte
            </ListItem>
          </List>

          {shoppingListItem && (
            <Button
              title="Eintrag löschen"
              color="red"
              onPress={handleDelete}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}
