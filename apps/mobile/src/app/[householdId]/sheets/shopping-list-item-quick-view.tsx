import { getUnitLabel } from '@glist/shared'
import * as Haptics from 'expo-haptics'
import {
  Stack,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useEffect, useState } from 'react'
import { Alert, Button, Pressable, Text, View } from 'react-native'
import { useCategories } from '@/api/categories'
import { useFindInventoryItems } from '@/api/inventory-items'
import {
  useCheckShoppingListItem,
  useDeleteShoppingListItem,
  useUncheckShoppingListItem,
} from '@/api/shopping-list-items'
import { useShoppingListItem } from '@/api/shopping-list-items/use-shopping-list-item'
import { useShops } from '@/api/shops'
import { colors } from '@/components/colors'
import { useHouseholdId } from '@/hooks/use-household-id'
import { useInventoryItemSubtitle } from '@/hooks/use-inventory-item-subtitle'
import { useShoppingListForm } from '@/hooks/use-shopping-list-item-form'
import { useSubmitShoppingListItemForm } from '@/hooks/use-submit-shopping-list-item-form-submit'
import { formatEuroCents } from '@/utils/currency'

export default function ShoppingListItemModal() {
  const navigation = useNavigation()

  const [preventModalRemove, setPreventModalRemove] = useState(false)
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
  const { searchInventoryItems, findInventoryItemById } =
    useFindInventoryItems()
  const { deleteShoppingListItem, isPending: isDeletePending } =
    useDeleteShoppingListItem()

  const { shoppingListItem, isSuccess } = useShoppingListItem(itemId)

  const { submit, isSubmitting } = useSubmitShoppingListItemForm({
    setPreventRemove: setPreventModalRemove,
  })

  const { checkShoppingListItem } = useCheckShoppingListItem()
  const { uncheckShoppingListItem } = useUncheckShoppingListItem()

  const {
    reset,
    setValue,
    values,
    isValid,
    isDirty,
    setShoppingListItem,
    linkInventoryItem,
    unlinkInventoryItem,
    inventoryItem,
  } = useShoppingListForm(findInventoryItemById)

  const resetFormAndGoBack = () => {
    reset()
    router.back()
  }

  useEffect(() => {
    if (preventModalRemove) return
    const sub = navigation.addListener('beforeRemove', () => {
      reset()
    })

    return sub
  }, [navigation, reset, preventModalRemove])

  useEffect(() => {
    if (shoppingListItem) {
      setShoppingListItem(shoppingListItem)
    }
  }, [shoppingListItem, setShoppingListItem])

  useEffect(() => {
    if (inventoryItemId) {
      const item = findInventoryItemById(inventoryItemId)
      if (item) {
        linkInventoryItem(item)
      }
    }
  }, [inventoryItemId, findInventoryItemById, linkInventoryItem])

  const canSubmit = !isSubmitting && isValid && isDirty

  useEffect(() => {
    setPreventModalRemove(isDirty)
  }, [isDirty])

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

  const deleteItem = (id: string) => {
    deleteShoppingListItem(id, {
      onSuccess: () => resetFormAndGoBack(),
      onError: () => {
        Alert.alert(
          'Fehler',
          'Der Eintrag konnte nicht gelöscht werden. Bitte versuche es später erneut.',
        )
      },
    })
  }

  const handleDelete = () => {
    if (!shoppingListItem) return

    if (shoppingListItem.checked) {
      deleteItem(shoppingListItem.id)

      return
    }

    Alert.alert(
      'Eintrag löschen',
      'Möchtest du diesen Eintrag wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => deleteItem(shoppingListItem.id),
        },
      ],
    )
  }

  let title =
    shoppingListItem || isDeletePending ? 'Bearbeiten' : 'Neuer Eintrag'

  if (inventoryItem) {
    title = 'Vorrat einkaufen'
  }

  const focusName = !values.name
  const focusQuantity = !!values.name && !values.quantity

  const itemEditUrl =
    `/${householdId}/modals/shopping-list-item?itemId=${shoppingListItem?.id}` as const

  if (isSuccess && !shoppingListItem) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 17, color: colors.label.primary }}>
          Dieser Eintrag existiert nicht.
        </Text>
        <Button
          title="Zurück zur Einkaufsliste"
          onPress={() => router.back()}
        />
      </View>
    )
  }

  if (!isSuccess || !shoppingListItem) {
    return null
  }

  return (
    <>
      <Stack.Screen
        options={{
          unstable_headerRightItems: () => [
            {
              type: 'button',
              label: 'bearbeiten',
              icon: {
                type: 'sfSymbol',
                name: 'pencil',
              },
              onPress: () => {
                router.dismissTo(itemEditUrl)
              },
            },
          ],
        }}
      />

      <View style={{ flex: 1, gap: 12, paddingTop: 24, paddingInline: 24 }}>
        <View
          style={{
            gap: 0,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Pressable
            onPress={() => {
              shoppingListItem.checked
                ? uncheckShoppingListItem(shoppingListItem.id)
                : checkShoppingListItem(shoppingListItem.id)
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            }}
            style={{
              width: 52,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              paddingInlineEnd: 8,
              marginInlineStart: -8,
            }}
          >
            <SymbolView
              name={
                shoppingListItem.checked ? 'checkmark.circle.fill' : 'circle'
              }
              size={32}
              tintColor={
                shoppingListItem.checked
                  ? colors.system.blue
                  : colors.label.tertiary
              }
            />
          </Pressable>
          <Text
            style={{
              fontSize: 28,
              color: colors.label.primary,
            }}
          >
            {shoppingListItem.quantity}{' '}
            {getUnitLabel(
              shoppingListItem.quantityUnit,
              shoppingListItem.quantity,
            )}{' '}
            {shoppingListItem.name}
          </Text>
        </View>

        {inventoryItem?.description && (
          <Text
            style={{
              fontSize: 18,
              color: colors.label.secondary,
              fontStyle: 'italic',
            }}
          >
            {inventoryItem?.description}
          </Text>
        )}

        {inventoryItem?.basePriceCents && (
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 18, color: colors.label.secondary }}>
              Grundpreis: {formatEuroCents(inventoryItem.basePriceCents)}
              {' / '}
              {getUnitLabel(
                inventoryItem.basePriceUnit,
                inventoryItem.basePriceCents,
              )}
            </Text>
          </View>
        )}

        {values.categoryId && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <SymbolView
              name="square.grid.2x2"
              size={32}
              tintColor={colors.label.primary}
            />
            <Text style={{ fontSize: 18, color: colors.label.primary }}>
              {categories.find((c) => c.id === values.categoryId)?.name}
            </Text>
          </View>
        )}

        {values.shopIds?.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <SymbolView
              name="storefront"
              size={32}
              tintColor={colors.label.primary}
            />
            <Text style={{ fontSize: 18, color: colors.label.primary }}>
              {values.shopIds
                .map((id) => shops.find((s) => s.id === id)?.name)
                .filter(Boolean)
                .join(', ')}
            </Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1, gap: 12, paddingTop: 24, paddingInline: 24 }}>
        <Pressable
          onPress={() => router.dismissTo(itemEditUrl)}
          style={{
            backgroundColor: colors.label.primary,
            borderRadius: 100,
            padding: 16,
          }}
        >
          <Text
            style={{
              color: colors.background.primary,
              textAlign: 'center',
              fontSize: 18,
            }}
          >
            Bearbeiten
          </Text>
        </Pressable>

        <Button
          color="red"
          title={`${shoppingListItem.name} löschen`}
          onPress={handleDelete}
        />

        {/*<List>
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
        */}
      </View>
    </>
  )
}
