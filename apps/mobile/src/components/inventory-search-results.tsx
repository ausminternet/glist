import type { InventoryItemView } from '@glist/views'
import { SymbolView } from 'expo-symbols'
import { Text, View } from 'react-native'
import { useShoppingListItems } from '@/api/shopping-list-items'
import { colors } from './colors'
import { ListItem } from './list-item.component'

interface InventorySearchResultsProps {
  items: InventoryItemView[]
  onSelectItem: (item: InventoryItemView) => void
  getSubtitle: (item: InventoryItemView) => string
}

export function InventorySearchResults({
  items,
  onSelectItem,
  getSubtitle,
}: InventorySearchResultsProps) {
  const { findShoppingListItemByInventoryId } = useShoppingListItems()
  return (
    <>
      {items.map((item) => {
        const subtitle = getSubtitle(item)
        const showSubtitle = subtitle || item.description
        const isOnShoppingList = !!findShoppingListItemByInventoryId(item.id)
        return (
          <ListItem
            disabled={isOnShoppingList}
            compact
            key={item.id}
            onPress={() => onSelectItem(item)}
            right={
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <SymbolView
                  name={isOnShoppingList ? 'link' : 'arrow.up.backward.circle'}
                  size={20}
                  tintColor={
                    isOnShoppingList ? colors.system.blue : colors.system.mint
                  }
                />
              </View>
            }
            subtitle={
              showSubtitle && (
                <View style={{ flexDirection: 'column', gap: 1 }}>
                  {subtitle && (
                    <Text
                      numberOfLines={1}
                      lineBreakMode="tail"
                      style={{
                        fontSize: 15,
                        maxWidth: 280,
                        color: colors.label.secondary,
                      }}
                    >
                      {subtitle}
                    </Text>
                  )}
                  {item.description && (
                    <Text
                      style={{
                        fontSize: 15,
                        maxWidth: 200,
                        color: colors.label.secondary,
                      }}
                    >
                      {item.description}
                    </Text>
                  )}
                </View>
              )
            }
          >
            {item.name}
          </ListItem>
        )
      })}
    </>
  )
}
