import { getUnitLabel } from '@glist/shared'
import * as Haptics from 'expo-haptics'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import {
  Alert,
  Button,
  Pressable,
  Text,
  useColorScheme,
  View,
} from 'react-native'
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
import { PhotoView } from '@/components/photo-view'
import { useHouseholdId } from '@/hooks/use-household-id'
import { formatEuroCents } from '@/utils/currency'

export default function ShoppingListItemQuickViewSheet() {
  const systemColorScheme = useColorScheme()
  const router = useRouter()
  const householdId = useHouseholdId()

  const { itemId } = useLocalSearchParams<{
    itemId: string
  }>()

  const { shops } = useShops()
  const { categories } = useCategories()
  const { deleteShoppingListItem } = useDeleteShoppingListItem()
  const { shoppingListItem, isSuccess } = useShoppingListItem(itemId)
  const { findInventoryItemById } = useFindInventoryItems()
  const { checkShoppingListItem } = useCheckShoppingListItem()
  const { uncheckShoppingListItem } = useUncheckShoppingListItem()

  const inventoryItem = shoppingListItem?.inventoryItemId
    ? findInventoryItemById(shoppingListItem.inventoryItemId)
    : undefined

  const itemEditUrl =
    `/${householdId}/modals/shopping-list-item?itemId=${shoppingListItem?.id}` as const

  const deleteItem = (id: string) => {
    deleteShoppingListItem(id, {
      onSuccess: () => router.back(),
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
          contentStyle: {
            backgroundColor: 'transparent',
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

        {shoppingListItem.description && (
          <Text
            style={{
              fontSize: 18,
              color: colors.label.secondary,
              fontStyle: 'italic',
            }}
          >
            {shoppingListItem.description}
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

        {shoppingListItem.categoryId && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <SymbolView
              name="square.grid.2x2"
              size={32}
              tintColor={colors.label.primary}
            />
            <Text style={{ fontSize: 18, color: colors.label.primary }}>
              {
                categories.find((c) => c.id === shoppingListItem.categoryId)
                  ?.name
              }
            </Text>
          </View>
        )}

        {shoppingListItem.shopIds?.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <SymbolView
              name="storefront"
              size={32}
              tintColor={colors.label.primary}
            />
            <Text style={{ fontSize: 18, color: colors.label.primary }}>
              {shoppingListItem.shopIds
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
        {shoppingListItem.photoUrls.map((photo) => (
          <PhotoView key={photo} url={photo} />
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
            shoppingListItem.checked
              ? uncheckShoppingListItem(shoppingListItem.id)
              : checkShoppingListItem(shoppingListItem.id)
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
            name={shoppingListItem.checked ? 'checkmark.circle.fill' : 'circle'}
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
            {shoppingListItem.checked ? 'Auspacken' : 'Kaufen'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(itemEditUrl)}
          style={{
            backgroundColor:
              systemColorScheme === 'light'
                ? 'rgba(0, 122, 255, 0.1)'
                : 'rgba(0, 145, 255, 0.1)',
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
            tintColor={colors.system.blue}
          />
          <Text
            style={{
              color: colors.system.blue,
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
    </>
  )
}
