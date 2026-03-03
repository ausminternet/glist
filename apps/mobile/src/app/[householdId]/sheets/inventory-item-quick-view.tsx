import { getUnitLabel } from '@glist/shared'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import {
  Alert,
  Button,
  Image,
  Pressable,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import { useCategories } from '@/api/categories'
import { useDeleteInventoryItem, useInventoryItem } from '@/api/inventory-items'
import { useShoppingListItems } from '@/api/shopping-list-items'
import { useShops } from '@/api/shops'
import { colors } from '@/components/colors'
import { useHouseholdId } from '@/hooks/use-household-id'
import { formatEuroCents } from '@/utils/currency'

export default function InventoryItemQuickViewSheet() {
  const systemColorScheme = useColorScheme()
  const router = useRouter()
  const householdId = useHouseholdId()

  const { inventoryItemId } = useLocalSearchParams<{
    inventoryItemId: string
  }>()

  const { shops } = useShops()
  const { categories } = useCategories()
  const { deleteInventoryItem } = useDeleteInventoryItem()
  const { inventoryItem, isSuccess } = useInventoryItem(inventoryItemId)
  const { findShoppingListItemByInventoryId } = useShoppingListItems()

  const shoppingListItem = inventoryItem
    ? findShoppingListItemByInventoryId(inventoryItem.id)
    : undefined

  const editInventoryitemUrl =
    `/${householdId}/modals/inventory-item?itemId=${inventoryItem?.id}` as const

  const addShoppingListItemUrl =
    `/${householdId}/modals/shopping-list-item?inventoryItemId=${inventoryItem?.id}` as const

  const showLinkedShoppingListItemUrl =
    `/${householdId}/modals/shopping-list-item?itemId=${shoppingListItem?.id}` as const

  const handleDeleteInventoryItem = (id: string) => {
    deleteInventoryItem(id, {
      onSuccess: () => router.back(),
      onError: () => {
        Alert.alert(
          'Fehler',
          'Der Vorrat konnte nicht gelöscht werden. Bitte versuche es später erneut.',
        )
      },
    })
  }

  const handleDelete = () => {
    if (!inventoryItem) return

    Alert.alert(
      'Eintrag löschen',
      'Möchtest du diesen Vorrat wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => handleDeleteInventoryItem(inventoryItem.id),
        },
      ],
    )
  }

  if (isSuccess && !inventoryItem) {
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

  if (!isSuccess || !inventoryItem) {
    return null
  }

  return (
    <>
      <Stack.Screen
        options={{
          contentStyle: {
            backgroundColor: 'transparent',
            flex: 1,
          },
          unstable_headerRightItems: () => [
            {
              type: 'button',
              label: 'bearbeiten',
              icon: {
                type: 'sfSymbol',
                name: 'pencil',
              },
              onPress: () => {
                router.dismissTo(editInventoryitemUrl)
              },
            },
          ],
        }}
      />
      <View>
        <View style={{ flex: 1, gap: 12, paddingTop: 24, paddingInline: 24 }}>
          <View
            style={{
              gap: 0,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 28,
                color: colors.label.primary,
              }}
            >
              {inventoryItem.targetStock}{' '}
              {getUnitLabel(
                inventoryItem.targetStockUnit,
                inventoryItem.targetStock,
              )}{' '}
              {inventoryItem.name}
            </Text>
          </View>

          {inventoryItem.description && (
            <Text
              style={{
                fontSize: 18,
                color: colors.label.secondary,
                fontStyle: 'italic',
              }}
            >
              {inventoryItem.description}
            </Text>
          )}

          {inventoryItem?.targetStock && (
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 18, color: colors.label.secondary }}>
                Sollmenge: {inventoryItem.targetStock}{' '}
                {getUnitLabel(
                  inventoryItem.targetStockUnit,
                  inventoryItem.targetStock,
                )}
              </Text>
            </View>
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

          {inventoryItem.categoryId && (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <SymbolView
                name="square.grid.2x2"
                size={32}
                tintColor={colors.label.primary}
              />
              <Text style={{ fontSize: 18, color: colors.label.primary }}>
                {
                  categories.find((c) => c.id === inventoryItem.categoryId)
                    ?.name
                }
              </Text>
            </View>
          )}

          {inventoryItem.shopIds?.length > 0 && (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <SymbolView
                name="storefront"
                size={32}
                tintColor={colors.label.primary}
              />
              <Text style={{ fontSize: 18, color: colors.label.primary }}>
                {inventoryItem.shopIds
                  .map((id) => shops.find((s) => s.id === id)?.name)
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </View>
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            paddingTop: 12,
            paddingInline: 24,
            gap: 8,
          }}
        >
          {inventoryItem.photoUrls.map((photo) => (
            <Image
              key={photo}
              source={{ uri: photo }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 8,
              }}
            />
          ))}
        </View>

        <View
          style={{
            flex: 1,
            gap: 10,
            paddingTop: 24,
            paddingInline: 24,
            flexDirection: 'row',
            width: '100%',
          }}
        >
          <Pressable
            onPress={() => {
              shoppingListItem
                ? router.push(showLinkedShoppingListItemUrl)
                : router.push(addShoppingListItemUrl)
            }}
            style={{
              backgroundColor: colors.system.blue,
              borderRadius: 20,
              paddingInline: 6,
              paddingBlock: 8,
              gap: 3,
              flex: 1,
              flexBasis: 0,
              alignItems: 'center',
            }}
          >
            <SymbolView
              name={shoppingListItem ? 'cart.fill' : 'cart'}
              size={22}
              tintColor="white"
            />
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 'bold',
              }}
            >
              {shoppingListItem ? 'Anzeigen' : 'Einkaufen'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(editInventoryitemUrl)}
            style={{
              backgroundColor:
                systemColorScheme === 'light'
                  ? 'rgba(0, 200, 179, 0.1)'
                  : 'rgba(0, 218, 195, 0.1)',
              borderRadius: 20,
              paddingInline: 6,
              paddingBlock: 8,
              gap: 3,
              flex: 1,
              flexBasis: 0,
              alignItems: 'center',
            }}
          >
            <SymbolView
              name="square.and.pencil"
              size={22}
              tintColor={colors.system.mint}
            />
            <Text
              style={{
                color: colors.system.mint,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 'bold',
              }}
            >
              Bearbeiten
            </Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            style={{
              backgroundColor:
                systemColorScheme === 'light'
                  ? 'rgba(255, 56, 60, 0.1)'
                  : 'rgba(255, 66, 69, 0.1)',
              borderRadius: 20,
              paddingInline: 6,
              paddingBlock: 8,
              flex: 1,
              flexBasis: 0,
              gap: 3,
              alignItems: 'center',
            }}
          >
            <SymbolView name="trash" size={22} tintColor={colors.system.red} />
            <Text
              style={{
                color: colors.system.red,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 'bold',
              }}
            >
              Löschen
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  )
}
